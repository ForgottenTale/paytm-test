const multer = require('multer');
const express = require('express')
const Paytm = require('paytm-pg-node-sdk');

const notify = require('../notify');
const Applicant = require('../../../models/applicant');
const logger = require('../../../utils/logger');
const { generateTxnId } = require('../../../modules/paytm');
const router = express.Router();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './files')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    }
})

const upload = multer({ storage: fileStorage })

router.post("/", upload.single("resume"), async (req, res) => {
    try {
        var txnId = await generateTxnId(req)

        const applicant = new Applicant({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            institute: req.body.institute,
            branch: req.body.branch,
            yearofPassout: req.body.yearofPassout,
            CGPA: req.body.CGPA,
            backlog: req.body.backlog,
            ieeeMember: req.body.ieeeMember,
            resume: req.file.path,
            orderId: txnId.orderId,
            amount: txnId.TXN_AMOUNT,
            paymentStatus: "Pending",
            bankId: "Pending",
            txnDate: "Pending",
            txnId: "Pending"
        })
        applicant.save()
            .then(() => res.send(txnId))
            .catch((err) => {
                logger.error(err)
                res.status(400).send({ error: err.message })
            })
    }
    catch (err) {
        logger.error(err)
        return res.status(400).send(err);
    }
})

router.post("/callback", async (req, res) => {

    try {
        var orderId = req.body.ORDERID;
        var readTimeout = 80000;
        var paymentStatusDetailBuilder = new Paytm.PaymentStatusDetailBuilder(orderId);
        var paymentStatusDetail = paymentStatusDetailBuilder.setReadTimeout(readTimeout).build();
        var response = await Paytm.Payment.getPaymentStatus(paymentStatusDetail);

        if (response.responseObject.body.resultInfo.resultStatus === "TXN_SUCCESS") {

            const applicant = await Applicant.findOneAndUpdate({ orderId: req.body.ORDERID }, {
                amount: response.responseObject.body.txnAmount,
                paymentStatus: "success",
                bankId: response.responseObject.body.bankTxnId,
                txnDate: response.responseObject.body.txnDate,
                txnId: response.responseObject.body.txnId,
            })
            notify(true, response.responseObject.body, applicant.email);
            return res.redirect(process.env.NODE_ENV === "production" ? `https://form.ieee-mint.org/confirmation/jobfair/${req.body.ORDERID}` : `http://localhost:3000/confirmation/jobfair/${req.body.ORDERID}`)

        }
        else {
            await Applicant.findOneAndUpdate({ orderId: req.body.ORDERID }, {
                paymentStatus: "failed",
                bankId: "failed",
                txnDate: response.responseObject.body.txnDate,
                txnId: response.responseObject.body.txnId
            })
            notify(false, response.responseObject.body, applicant.email);
            return res.redirect(process.env.NODE_ENV === "production" ? `https://form.ieee-mint.org/confirmation/jobfair/${req.body.ORDERID}` : `http://localhost:3000/confirmation/jobfair/${req.body.ORDERID}`)
        }

    }
    catch (err) {
        res.status(400).send(err)
        logger.error(err)
    }

})

module.exports = router;
