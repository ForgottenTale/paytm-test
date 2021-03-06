require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose')
const cors = require("cors");
const logger = require("./server/utils/logger");
const { connectToPaytm } = require('./server/modules/paytm');
const fs = require('fs')

const payRoute = require('./server/routes/pay');
const formRoute = require('./server/routes/form');
const app = express();
const port = process.env.PORT || 5000



app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(__dirname + '/public'));


app.get("/api/test", (req, res) => {
  return res.send("Hi")
})

app.use("/api/pay", payRoute);
app.use("/api/form", formRoute);



app.get("/about", function (req, res) {

    res.sendFile("index.html", { root: path.join(__dirname, "./build/") });
  
});

app.route('/files/*')
  .get((req, res) => {
    res.sendFile(process.cwd() + decodeURI(req.url));
  })

app.get('*', (req, res) => {
  res.sendFile(process.cwd() + '/build/index.html');
})

mongoose.connect(process.env.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(port, (err) => {
    logger.info(`> Connected to MongoDB`)
    connectToPaytm()
    if (err) throw err
    logger.info(`> Ready on http://localhost:${port}`)
  }))
  .catch((err) => logger.error(err))

