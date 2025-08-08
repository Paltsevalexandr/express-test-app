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

app.get('/start', async (req, res) => {
    const now = knex.fn.now();
    const query = req.query;
    const { login_id } = query;
    let session = await knex("sessions")
        .where({ login_id })
        .first();
    if (session) {
        await knex("sessions")
            .where({ login_id })
            .update({ session_start: now });
    }
    else {
        await knex("sessions").insert({
            login_id,
            session_start: now
        });
    }
    
    session = await knex("sessions")
        .where({ login_id })
        .first();
    res.status(200).json({time: session.session_start})
});

app.get('/get-session', async (req, res) => {
    const query = req.query;
    const { login_id, build_number } = query;

    if (!login_id || !build_number) {
        res.status(400).json({'error': ['Request error']})
    }
    let session = await knex("sessions")
        .where({ login_id })
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
        timeElapsed -= totalPausedTime

        const timeLeft = totalTimeSec - timeElapsed;
        
        res.status(200).json({timeLeft, session})
    }
    else {
        res.status(400).json({error: "error"})
    }
});

app.get('/toggle-session', async (req, res) => {
    const query = req.query;
    const { login_id, is_paused } = query;

    if (!login_id) {
        res.status(400).json({'error': ['Request error']})
    }
    let session = await knex('sessions')
        .where({ login_id })
        .first();
    const isPausedValue = is_paused == "true" ;
    let updatedSession = { is_paused: isPausedValue ? 1 : 0 };
    if (isPausedValue) {
        updatedSession.pause_start = knex.fn.now();
    } else {
        let totalPausedTime = session.total_paused_time;
        const pauseStart = new Date(session.pause_start);
        const now = new Date();
        let pausedTime = Math.floor((now - pauseStart) / 1000);
        totalPausedTime += pausedTime;
        updatedSession.pause_start = null;
        updatedSession.total_paused_time = totalPausedTime;
    }

    let sessionId = await knex("sessions")
        .where({ login_id })
        .update(updatedSession);
    
    session = await knex('sessions')
        .where({ id: sessionId })
        .first();
    
    res.status(200).json({ session });
    
});

const port = 5000;
app.listen(port, () => console.log(`Start server on port ${port}`));
