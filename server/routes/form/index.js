const express = require('express')
const Applicant = require('../../models/applicant');
const logger = require('../../utils/logger');
const router = express.Router();
const notify = require('./notify')

router.get("/responses", async (req, res) => {

    try {
        const applicants = await Applicant.find({})
        res.send(applicants)
    }
    catch (err) {
        logger.error(err);
        res.status(400).send({ error: err.message })
    }

})

router.post("/sendmail", async (req, res) => {

    try {
        const applicant = await Applicant.find({ paymentStatus: "success" })
        const emails = ["abhijithkannan452@gmail.com"];
        applicant.forEach((app) => emails.push(app.email))
        notify(req.body.subject, req.body.msg, emails)
        res.sendStatus(200)
    }
    catch (err) {
        logger.error(err);
        res.status(400).send({ error: err.message })
    }


})


module.exports = router