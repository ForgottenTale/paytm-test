const express = require('express');
const bodyParser = require('body-parser');
const Paytm = require('paytm-pg-node-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = 5000;
app.use(cors())
app.use(bodyParser.json());
app.options('*', cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/static', express.static(path.join(__dirname, './build//static')));
app.get('*', function (req, res) {
    res.sendFile('index.html', { root: path.join(__dirname, './build/') });
});

function middleware() {
    try {
        var env = Paytm.LibraryConstants.STAGING_ENVIRONMENT;
        var mid = process.env.Merchant_Id;
        var key = process.env.Merchant_Key;
        var website = process.env.Website;
        var client_id = process.env.client_id;
        var callbackUrl = process.env.Callback;
        Paytm.MerchantProperties.setCallbackUrl(callbackUrl);
        Paytm.MerchantProperties.initialize(env, mid, key, client_id, website);
        Paytm.MerchantProperties.setConnectionTimeout(5000);
        console.log("Connection Established")
    }
    catch (e) {
        console.log("Exception caught: ", e);
        Paytm.LoggingUtil.addLog(Paytm.LoggingUtil.LogLevel.INFO, "DemoApp", "Exception caught: ", e);
        console.log("Failed")

    }

}

middleware()

function generateRandomString(count) {
    var ALPHA_NUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = ALPHA_NUMERIC_STRING.length;
    var rand = '';
    for (var i = 0; i < count; i++) {
        var start = Math.floor(Math.random() * charactersLength) + 1;
        rand += ALPHA_NUMERIC_STRING.substr(start, 1);
    }
    return rand;
}
app.post("/pay", async (req, res) => {
    try {
        var channelId = Paytm.EChannelId.WEB;
        var orderId = generateRandomString(10);
        var txnAmount = Paytm.Money.constructWithCurrencyAndValue(Paytm.EnumCurrency.INR, "10.00");
        var userInfo = new Paytm.UserInfo(generateRandomString(10));
        userInfo.setEmail(req.body.email);
        userInfo.setFirstName(req.body.firstName);
        userInfo.setLastName(req.body.lastName);
        userInfo.setMobile(req.body.phone);
        // userInfo.setPincode(req.body.pin);
        // userInfo.setAddress(req.body.address);
        var paymentDetailBuilder = new Paytm.PaymentDetailBuilder(channelId, orderId, txnAmount, userInfo);
        var paymentDetail = paymentDetailBuilder.build();
        var response = await Paytm.Payment.createTxnToken(paymentDetail);

        // if (response instanceof Paytm.SDKResponse) {
        //     console.log("\nRaw Response:\n", response.getJsonResponse());
        // }
        var details = {
            mid: process.env.Merchant_Id,
            orderId,
            "CHECKSUMHASH": response.responseObject.head.signature,
            "txnToken": response.responseObject.body.txnToken,
            TXN_AMOUNT: "10.00",
            WEBSITE: "WEBSTAGING",
        }

        res.send(details)
    }
    catch (err) {
        res.send(err)
    }

})

app.post("/callback", async (req, res) => {

    try {
        var orderId = req.body.ORDERID;
        var readTimeout = 80000;
        var paymentStatusDetailBuilder = new Paytm.PaymentStatusDetailBuilder(orderId);
        var paymentStatusDetail = paymentStatusDetailBuilder.setReadTimeout(readTimeout).build();
        var response = await Paytm.Payment.getPaymentStatus(paymentStatusDetail);

        if (response.responseObject.body.resultInfo.resultStatus === "TXN_SUCCESS") {
            res.status(200)
            // const params = new URLSearchParams("/confirmation")
            // params.append("orderId", orderId);
            // params.append("orderId", orderId);
            // params.append("orderId", orderId);
            res.redirect("/confirmation")
            // res.send(response.responseObject.body)
        }

    }
    catch (err) {
        console.log(err)
    }

})

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));