const express = require("express");
const cors = require("cors");
const app = express();
const knexConfig = require("./knexfile")['development'];
const knex = require("knex")(knexConfig);
app.use(cors());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.post('/get-build-data', async (req, res) => {
    let errors =[];
    let body = req.body;
    if (!body) {
        errors.push("Unknown error");
        res.status(400).json(errors);
        return;
    }
    
    let { loginId, buildNumber } = body;

    if (!loginId || !buildNumber) {
        if (!loginId) {
            errors.push("Login Id is invalid");
        }
        if (!buildNumber) {
            errors.push("Build number is invalid");
        }
        res.status(400).json({errors});
        return;
    }
    
    try {
        let build = await knex("builds")
            .where({ 'builds.login_id': loginId })
            .andWhere({ 'builds.build_number': buildNumber })
            .first();

        if (build) {
            res.status(200).json({
                timePerPart: build.time_per_part,
                numberOfParts: build.number_of_parts
            });
        }
        else {
            res.status(400).json({errors: ["Credentials don't match any build"]});
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});

app.get('/start-session', async (req, res) => {
    const now = knex.fn.now();
    const query = req.query;
    const { login_id } = query;
    const user = await knex("users")
        .where({ login_id })
        .first();
    
    let session = await knex("sessions")
        .where({ user_id: user.id })
        .andWhere({status: 1}) // active
        .first();
    
    if (session) {
        await knex("sessions")
            .where({ login_id })
            .andWhere({status: 1}) // active
            .update({ session_start: now });
    }
    else {
        await knex("sessions").insert({
            login_id,
            user_id: user.id,
            session_start: now
        });
    }
    
    session = await knex("sessions")
        .where({ login_id })
        .andWhere({ status: 1 })
        .first();
    res.status(200).json({time: session.session_start})
});

app.get('/get-session', async (req, res) => {
    try {
        const query = req.query;
        const { login_id, build_number } = query;

        if (!login_id || !build_number) {
            res.status(400).json({ 'error': ['Request error', `login_id: ${login_id}, build_number: ${build_number}`] });
            return;
        }
        let session = await knex("sessions")
            .where({ login_id })
            .andWhere({ status: 1 })
            .first();
        
        let build = await knex("builds")
            .where({ build_number })
            .first();
    
        if (session && build) {
            const timePerPart = build.time_per_part;
            const numberOfParts = build.number_of_parts;
            const totalTimeSec = timePerPart * numberOfParts * 60;

            const now = new Date();
            const sessionStart = new Date(session.session_start);
            let timeElapsed = now - sessionStart;
            let totalPausedTime = session.total_paused_time;

            if (session.is_paused) {
                let pauseStart = new Date(session.pause_start);
                let pauseTime = Math.floor((now - pauseStart) / 1000);
                totalPausedTime += pauseTime;
            }
            
            timeElapsed = Math.floor(timeElapsed / 1000);
            timeElapsed -= totalPausedTime;

            let timeLeft = totalTimeSec - timeElapsed;

            if (timeLeft < 0) {
                let extraTimeTimestamp = await knex("timestamps")
                    .where({ session_id: session.id })
                    .andWhere({ type: TimestampType.EXTRA_TIME_START })
                    .orderBy('timestamp', 'desc')
                    .first();

                if (extraTimeTimestamp) {
                    const extraTimeStart = new Date(extraTimeTimestamp.timestamp);
                    const extraTimeEnd = new Date(extraTimeStart.getTime() + 10 * 60 * 1000);
                    timeLeft = Math.floor((extraTimeEnd - now) / 1000);
                    timeElapsed += (Math.floor(now - extraTimeStart) / 1000);
                }
            }
            await knex("sessions")
                .where({ id: session.id })
                .andWhere({ status: 1 })
                .update({
                    elapsed_seconds: timeElapsed,
                });
            
            res.status(200).json({timeLeft, session})
        }
        else {
            res.status(400).json({error: "session or build not found"})
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ 'error': ['Request error'] });
    }
});

app.get('/reset-session', async (req, res) => {
    const query = req.query;

    try {
        const { session_id } = query;

        if (!session_id) {
            res.status(400).json({ 'error': ['Request error'] });
            return;
        }
        await knex("sessions")
            .where({ id: session_id })
            .andWhere({ status: 1 })
            .update({
                elapsed_seconds: 0,
                is_paused: 0,
                total_paused_time: 0,
                pause_start: null
            });
        
        await knex("defects")
            .where({ session_id })
            .del();
        
        await knex("timestamps")
            .where({ session_id })
            .del();
        
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to reset session" });
    }
    

});

app.get('/toggle-session', async (req, res) => {
    const query = req.query;
    const { login_id, is_paused } = query;

    try {
        if (!login_id) {
            res.status(400).json({'error': ['Request error']})
        }
        let session = await knex('sessions')
            .where({ login_id })
            .andWhere({ status: 1 })
            .first();
        const isPausedValue = is_paused == "true" ;
        let updatedSession = { is_paused: isPausedValue ? 1 : 0 };
        let now = knex.fn.now();
        if (isPausedValue) {
            updatedSession.pause_start = now;
        } else {
            let totalPausedTime = session.total_paused_time;
            const pauseStart = new Date(session.pause_start);
            const now = new Date();
            let pausedTime = Math.floor((now - pauseStart) / 1000);
            totalPausedTime += pausedTime;
            updatedSession.pause_start = null;
            updatedSession.total_paused_time = totalPausedTime;
        }

        await knex("sessions")
            .where({ login_id })
            .andWhere({ status: 1 })
            .update(updatedSession);
        
        session = await knex('sessions')
            .where({ login_id })
            .andWhere({ status: 1 })
            .first();
        
        let timestampObj = {
            session_id: session.id,
            timestamp: now,
            type: isPausedValue ? TimestampType.PAUSE : TimestampType.RESUME
        };

        let result = await knex("timestamps")
            .insert(timestampObj);
                
        res.status(200).json({ session });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({error: 'Server Error'})
    }
});

app.get('/set-extra-time', async (req, res) => {
    try {
        const query = req.query;
        const { session_id } = query;
        let now = knex.fn.now();
        let result = await knex("timestamps")
            .insert({
                session_id,
                timestamp: now,
                type: TimestampType.EXTRA_TIME_START
            });

        res.status(200).json({ success: true })
    }
    catch (error) {
        res.status(400).json({ error: "error" });
    }
});

app.get("/save-defects", async (req, res) => {
    try {
        const query = req.query;
        const { defects_amount, session_id } = query;
        
        // await knex("sessions")
        //     .where({ id: session_id })
        //     .update({
        //         status: 2 // finished
        //     });
        
        let defectsObj = await knex("defects")
            .where({ session_id })
            .first();
        
        if (defectsObj) {
            await knex("defects")
            .where({ id: defectsObj.id })
            .update({ defects_amount });
        }
        else {
            await knex("defects").insert({
                session_id,
                defects_amount
            });
        }
        let result = await knex('defects').where({ session_id }).first();

        if (result) {
            res.status(200).json({ success: true });
        }
        else {
            res.status(400).json({ error: "error", success: false });
        }
    }
    catch (error) {
        res.status(400).json({ error: "error", success: false });
    }
});

app.get("/save-session", async (req, res) => {
    try {
        const query = req.query;
        const { total_parts, login_id } = query;

        const session = await knex("sessions")
            .where({ login_id })
            .andWhere({ status: 1 })
            .first();
        
        await knex("sessions")
            .where({ login_id })
            .andWhere({status: 1})
            .update({
                status: 2, // finished
                total_parts
            });
        
        let result = await knex('sessions')
            .where({ id: session.id })
            .first();

        if (result) {
            res.status(200).json({ success: true });
        }
        else {
            res.status(400).json({ error: "error1", success: false });
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "error2", success: false });
    }
});

const TimestampType = Object.freeze({
    PAUSE: 1,
    RESUME: 2,
    EXTRA_TIME_START: 3,
});


const port = 5000;
app.listen(port, () => console.log(`Start server on port ${port}`));
