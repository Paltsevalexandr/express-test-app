const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const data = [
    {
        loginId: "User 1",
        buildNumber: 1,
        numberOfParts: 34,
        timePerPart: 1
    },
    {
        loginId: "User 2",
        buildNumber: 2,
        numberOfParts: 12,
        timePerPart: 15
    }
    
];

app.post('/get-build-data', (req, res) => {
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
    let build = data.find((item) => {
        return item.loginId == loginId && item.buildNumber == buildNumber
    });
    if (build) {
        res.status(200).json({
            timePerPart: build.timePerPart,
            numberOfParts: build.numberOfParts
        });
    }
    else {
        res.status(400).json({errors: ["Credentials don't match any build"]});
    }
});

const port = 5000;
app.listen(port, () => console.log(`Start server on port ${port}`));
