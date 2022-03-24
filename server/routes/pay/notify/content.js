const msg = require('../../../mail/registerSuccess');

function content(status,data,email) {

    const content = status ? {
        from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
        to: process.env.NODE_ENV === "production" ? email : "graciela.keeling37@ethereal.email",
        subject: "IEEE Job Fair 2022 | Registration Successful",
        html: msg(
            {
                orderId:data.orderId,
                amount: data.txnAmount,
                paymentStatus: "success",
                txnDate: data.txnDate,
                txnId: data.txnId
            }
        )

    } : {
        from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
        to: process.env.NODE_ENV === "production" ? email : "graciela.keeling37@ethereal.email",
        subject: "IEEE Job Fair 2022 | Registration failed",
        html: msg(
            {
                orderId:data.orderId,
                amount: data.txnAmount,
                paymentStatus: "failed",
                txnDate: data.txnDate
            }
        )
    }
    return content
}

module.exports = content;