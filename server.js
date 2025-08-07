const express = require("express");
const cors = require("cors");
const app = express();
const knexConfig = require("./knexfile")['development'];
const knex = require("knex")(knexConfig);
app.use(cors());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());


// const data = [
//     {
//         loginId: "user1",
//         buildNumber: 1,
//         numberOfParts: 34,
//         timePerPart: 1
//     },
//     {
//         loginId: "user2",
//         buildNumber: 2,
//         numberOfParts: 12,
//         timePerPart: 15
//     }
    
// ];

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

const port = 5000;
app.listen(port, () => console.log(`Start server on port ${port}`));
