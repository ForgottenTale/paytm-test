const transporter = require('../../../configs/nodemailer');
const content = require('./content');
const logger = require('../../../utils/logger');
const nodemailer = require('nodemailer');


function notify(status, data, applicant) {

    transporter.sendMail(content(status, data, applicant), (err, info) => {
        if (err) {
            logger.error(err)
            return;
        }
        logger.info("Send:" + info.response)
        if (process.env.NODE_ENV === "development"){
            logger.info(nodemailer.getTestMessageUrl(info))
        }
    })
}

module.exports = notify;

