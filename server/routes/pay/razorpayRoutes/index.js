const moment = require('moment')
const express = require('express')
var crypto = require("crypto");
const Razorpay = require('razorpay');
const multer = require('multer');

const generateRandomString = require('../../../utils/generateRandomString');
const notify = require('../notify');
const Applicant = require('../../../models/applicant');
const logger = require('../../../utils/logger');
const router = express.Router();

var instance = new Razorpay({
    key_id: process.env.razorPayId,
    key_secret: process.env.razorPaySecret,
});

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './files')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    }
})

const upload = multer({ storage: fileStorage })


router.post("/verify", async (req, res) => {
    logger.info("Request recieved")
    let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var expectedSignature = crypto.createHmac('sha256', process.env.razorPaySecret)
        .update(body.toString())
        .digest('hex');

    const orderDetails = await instance.orders.fetch(req.body.razorpay_order_id)
    if (expectedSignature === req.body.razorpay_signature) {


        const applicant = await Applicant.findOneAndUpdate({ orderId: req.body.razorpay_order_id }, {
            paymentStatus: "success",
            txnDate: moment.unix(orderDetails.created_at).toISOString(),
            txnId: req.body.razorpay_payment_id,
        });
        var data = {
            txnAmount: orderDetails.amount_paid,
            orderId: req.body.razorpay_order_id,
            txnDate: moment.unix(orderDetails.created_at).toISOString(),
            txnId: req.body.razorpay_payment_id,
        }
        notify(true, data, applicant);
        applicant.save().then(() => res.sendStatus(200)).catch((err) => {
            logger.error(err)
            res.status(400).send({ error: err.message })
        })
    }
    else {
        res.sendStatus(200)
    }


})

router.post("/failed", async (req, res) => {

    const orderDetails = await instance.orders.fetch(req.body.metadata.order_id)
    var data = {
        txnAmount: orderDetails.amount_paid,
        orderId: req.body.metadata.order_id,
        txnDate: moment.unix(orderDetails.created_at).toISOString(),
    }
    const applicant = await Applicant.findOneAndUpdate({ orderId: req.body.metadata.order_id }, {
        paymentStatus: "failed",
        txnDate: moment.unix(orderDetails.created_at).toISOString(),
        txnId: "failed",
    })
    notify(false, data, applicant);

    applicant.save()
        .then(() => res.sendStatus(200))
        .catch((err) => {
            logger.error(err)
            res.status(400).send({ error: err.message })
        })

})

router.post("/", upload.single("resume"), async (req, res) => {
    try {

        var options = {
            amount: req.body.ieeeMember === "true" ? 25000 : 50000,
            currency: "INR",
            receipt: generateRandomString()
        };
        instance.orders.create(options, function (err, order) {

            order.key = process.env.razorPayId

            const applicant = new Applicant({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                institute: req.body.institute,
                phone:req.body.phone,
                branch: req.body.branch,
                yearofPassout: req.body.yearofPassout,
                CGPA: req.body.CGPA,
                backlog: req.body.backlog,
                ieeeMember: req.body.ieeeMember,
                resume: req.file.path,
                orderId: order.id,
                amount: order.amount / 100,
                paymentStatus: "Pending",
                txnDate: "Pending",
                txnId: "Pending"
            })
            logger.info(`> Razor token created for ${req.body.firstName + " " + req.body.lastName}`)
            applicant.save()
                .then(() => res.send(order))
                .catch((err) => {
                    logger.error(err)
                    res.status(400).send({ error: err.message })
                })
            if (err) {
                logger.error(err)
                return res.status(400).send(err);
            }
        });

    }
    catch (err) {
        logger.error(err)
        return res.status(400).send(err);
    }
})

module.exports = router;
