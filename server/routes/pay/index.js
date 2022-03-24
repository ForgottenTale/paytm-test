const express = require('express')
const Applicant = require('../../models/applicant');
const logger = require('../../utils/logger');
const router = express.Router();
const razorPayRoutes = require('./razorpayRoutes');
const paytmRoutes = require('./paytmRoutes');


router.use("/razorpay",razorPayRoutes);
router.use("/paytm",paytmRoutes);


router.get("/confirmation", async (req, res) => {
    try {
        if (req.query.type === "jobfair") {
            var txnId = await Applicant.findOne({ orderId: req.query.id })
            return res.send(txnId)
        }
    }
    catch (err) {
        res.status(400).send({ error: err.message })
        logger.error(err)
    }

})



module.exports = router;