const express = require('express')
var crypto = require("crypto");
const Razorpay = require('razorpay');

const generateRandomString = require('../../../utils/generateRandomString');
const Applicant = require('../../../models/applicant');
const logger = require('../../../utils/logger');
const router = express.Router();

var instance = new Razorpay({
    key_id: process.env.razorPayId_test,
    key_secret: process.env.razorPaySecret_test,
});


router.get("/orderDetails", async (req, res) => {
    try {
        const orderDetails = await instance.orders.fetch(req.query.orderId)
        const applicant = await Applicant.findOne({ orderId: req.query.orderId })
        logger.info(`> Reinitated payment for ${applicant.firstName + " " + applicant.lastName} orderId : ${req.query.orderId}`)
        orderDetails.key = process.env.razorPayId_test
        orderDetails.userDetails = {
            name: applicant.firstName + " " + applicant.lastName,
            email: applicant.email,
            phone: applicant.phone
        }
        res.send(orderDetails)
    }
    catch (err) {
        logger.error(err)
        res.status(400).send({ error: err.message })
    }

})

router.post("/verify", async (req, res) => {

    let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var expectedSignature = crypto.createHmac('sha256', process.env.razorPaySecret_test)
        .update(body.toString())
        .digest('hex');

  
    if (expectedSignature === req.body.razorpay_signature) {

        res.sendStatus(200)
    
    }
    else {
        res.sendStatus(200)
    }


})

router.get("/confirmation", async (req, res) => {
    try {
       
            const orderDetails = await instance.orders.fetch(req.query.orderId)
            console.log(orderDetails)
            return res.send(orderDetails)
        
    }
    catch (err) {
        res.status(400).send({ error: err.message })
        logger.error(err)
    }

})

router.post("/failed", async (req, res) => {

    res.sendStatus(200)
})

router.post("/", async (req, res) => {
    console.log( process.env.razorPayId_test)
    try {

        var options = {
            amount: req.body.amount,
            currency: "INR",
            receipt: generateRandomString()
        };
        // console.log(instance)
        instance.orders.create(options, function (err, order) {

            order.key = process.env.razorPayId_test;
            console.log(order)
            logger.info(`> Razor token created for ${req.body.amount}`)
            res.send(order)
            if (err) {
                logger.error(err)
                console.log(err)
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
