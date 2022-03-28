const express = require('express')
const Applicant = require('../../models/applicant');
const logger = require('../../utils/logger');
const router = express.Router();
const sendMail = require('./sendMail');
const pendingTemplate = require('../../mailTemplates/registerPending');


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

router.post("/mail", async (req, res) => {

    try {
        const param = req.query.to = "success" ? { paymentStatus: "success" } : req.query.to = "pending" ? { paymentStatus: "Pending" } : { paymentStatus: "failed" }
        const applicants = await Applicant.find(param)
        applicants.forEach((applicant) => {
            sendMail(applicant.email, req.body.subject, req.body.msg)
        })

        res.sendStatus(200)
    }
    catch (err) {
        logger.error(err);
        res.status(400).send({ error: err.message })
    }


})
router.post("/mail/reminder", async (req, res) => {

    try {
        const applicants = await Applicant.find({ $or: [{ paymentStatus: "failed" }, { paymentStatus: "Pending" }] })
        applicants.forEach((applicant) => {
            sendMail(applicant.email,
                "IEEE Job Fair 2022 | Registration pending",
                pendingTemplate(
                    {
                        name: applicant.firstName + " " + applicant.lastName,
                        orderId: applicant.orderId,
                        amount: applicant.amount * 100,
                        paymentStatus: "pending",
                        txnDate: applicant.createdAt,
                        email: applicant.email,
                        phone: applicant.phone
                    }
                )
            )
        })

        res.sendStatus(200)
    }
    catch (err) {
        logger.error(err);
        res.status(400).send({ error: err.message })
    }

})


module.exports = router