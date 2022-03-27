const success = require('../../../mailTemplates/registerSuccess');
const failed = require('../../../mailTemplates/registerFailed');

function content(status, data, applicant) {

    const content = status ? {
        from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
        to: process.env.NODE_ENV === "production" ? applicant.email : "graciela.keeling37@ethereal.email",
        subject: "IEEE Job Fair 2022 | Registration Successful",
        html: success(
            {
                name: applicant.firstName + " " + applicant.lastName,
                orderId: data.orderId,
                amount: data.txnAmount,
                paymentStatus: "success",
                txnDate: data.txnDate,
                txnId: data.txnId,
                email:applicant.email,
                phone:applicant.phone

            }
        )

    } : {
        from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
        to: process.env.NODE_ENV === "production" ? applicant.email : "graciela.keeling37@ethereal.email",
        subject: "IEEE Job Fair 2022 | Registration failed",
        html: failed(
            {
                name: applicant.firstName + " " + applicant.lastName,
                orderId: data.orderId,
                amount: data.txnAmount,
                paymentStatus: "failed",
                txnDate: data.txnDate,
                email:applicant.email,
                phone:applicant.phone
            }
        )
    }
    return content
}

module.exports = content;