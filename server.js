const express = require("express");
const bodyParser = require("body-parser");
const Paytm = require("paytm-pg-node-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require("mongodb").ObjectID;
const app = express();
const PORT = 5000;
app.use(cors());
app.use(bodyParser.json());
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(__dirname, "./build//static")));
app.get("*", function (req, res) {
  res.sendFile("index.html", { root: path.join(__dirname, "./build/") });
});
const dotenv = require("dotenv");
dotenv.config();

const url =process.env.DBNAME;
const db = "paytm";

async function getDBObject() {
  var conn = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB");
  return { db: conn.db(db), conn: conn };
}
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
    console.log("Connection Established");
  } catch (e) {
    console.log("Exception caught: ", e);
    Paytm.LoggingUtil.addLog(
      Paytm.LoggingUtil.LogLevel.INFO,
      "DemoApp",
      "Exception caught: ",
      e
    );
    console.log("Failed");
  }
}

middleware();

function generateRandomString(count) {
  var ALPHA_NUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = ALPHA_NUMERIC_STRING.length;
  var rand = "";
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
    var txnAmount = Paytm.Money.constructWithCurrencyAndValue(
      Paytm.EnumCurrency.INR,
      "10.00"
    );
    var customerId = generateRandomString(10);
    var userInfo = new Paytm.UserInfo(customerId);
    userInfo.setEmail(req.body.email);
    userInfo.setFirstName(req.body.firstName);
    userInfo.setLastName(req.body.lastName);
    userInfo.setMobile(req.body.phone);

    var paymentDetailBuilder = new Paytm.PaymentDetailBuilder(
      channelId,
      orderId,
      txnAmount,
      userInfo
    );
    var paymentDetail = paymentDetailBuilder.build();
    var response = await Paytm.Payment.createTxnToken(paymentDetail);

    let amount="10.00";
    var details = {
      mid: process.env.Merchant_Id,
      orderId,
      CHECKSUMHASH: response.responseObject.head.signature,
      txnToken: response.responseObject.body.txnToken,
      TXN_AMOUNT: amount,
      WEBSITE: "WEBSTAGING",
    };
    let dbObj = await getDBObject();
    let obj = await dbObj.db.collection(db).insertOne({
      orderId,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
    });
    dbObj.conn.close();
    console.log(details);
    res.send(details);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.post("/callback", async (req, res) => {
  try {
      console.log(req.body);
    var orderId = req.body.ORDERID;
    var readTimeout = 80000;
    var paymentStatusDetailBuilder = new Paytm.PaymentStatusDetailBuilder(
      orderId
    );
    var paymentStatusDetail = paymentStatusDetailBuilder
      .setReadTimeout(readTimeout)
      .build();
    var response = await Paytm.Payment.getPaymentStatus(paymentStatusDetail);
console.log(response);
    if (
      response.responseObject.body.resultInfo.resultStatus === "TXN_SUCCESS"
    ) {
      res.status(200);
      let dbObj = await getDBObject();
      await dbObj.db.collection(db).updateOne({"orderId": orderId}, {$set: {
        "status": "success",
        "bankid": response.responseObject.body.bankTxnId,
        "txnDate": response.responseObject.body.txnDate,
        "txnId": response.responseObject.body.txnId,
      }}, { "upsert": true });
      dbObj.conn.close();
      // const params = new URLSearchParams("/confirmation")
      // params.append("orderId", orderId);
      // params.append("orderId", orderId);
      // params.append("orderId", orderId);
      res.redirect("/confirmation/" + orderId);
      // res.send(response.responseObject.body)
    }else{
        let dbObj = await getDBObject();
        await dbObj.db.collection(db).updateOne({"orderId": orderId}, {$set: {
            "status": "failed",
        }}, { "upsert": true });
        dbObj.conn.close();
        res.redirect("/confirmation/" + orderId);
    }
  } catch (err) {
    console.log(err);
  }
});
app.get("/confirmation/:orderId", async (req, res) => {
  try {
      const orderid=req.params.orderId;
    let dbObj = await getDBObject();
    let obj = await dbObj.db.collection(db).findOne({"orderId": orderid});
    dbObj.conn.close();
    res.json({
        "orderId": obj.orderId,
        "txnId": obj.txnId,
        "txnDate": obj.txnDate,
        "amount": obj.amount,
    });
  } catch {}
});
app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`)
);
