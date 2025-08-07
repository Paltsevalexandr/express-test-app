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
    let sessionId = null;
    let session = await knex("sessions")
        .where({ login_id })
        .first();
    if (session) {
        sessionId = await knex("sessions")
            .where({ login_id })
            .update({ session_start: now });
        console.log("11", sessionId)
    }
    else {
        const [_sessionId] = await knex("sessions").insert({
            login_id,
            session_start: now
        });
        sessionId = _sessionId;
    }
    
    session = await knex("sessions")
        .where({ id: sessionId })
        .first();
    res.status(200).json({time: session.session_start})
});

const port = 5000;
app.listen(port, () => console.log(`Start server on port ${port}`));
