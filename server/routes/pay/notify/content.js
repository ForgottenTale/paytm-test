const success = require('../../../mailTemplates/registerSuccess');
const failed = require('../../../mailTemplates/registerFailed');
const pending = require('../../../mailTemplates/registerPending');

function content(status, data, applicant) {

    if (status === "success") {
        return {
            from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
            to: process.env.NODE_ENV === "production" ? applicant.email : "graciela.keeling37@ethereal.email",
            subject: "IEEE Job Fair 2022 | Registration Successful",
            cc: "backup@ieeejobfair.com",
            html: success(
                {
                    name: applicant.firstName + " " + applicant.lastName,
                    orderId: data.orderId,
                    amount: data.txnAmount,
                    paymentStatus: "success",
                    txnDate: data.txnDate,
                    txnId: data.txnId,
                    email: applicant.email,
                    phone: applicant.phone

                }
            )

        }
    }

    else if (status === "pending") {

        return {
            from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
            to: process.env.NODE_ENV === "production" ? applicant.email : "graciela.keeling37@ethereal.email",
            subject: "IEEE Job Fair 2022 | Registration pending",
            cc: "backup@ieeejobfair.com",

            html: pending(
                {
                    name: applicant.firstName + " " + applicant.lastName,
                    orderId: data.id,
                    amount: data.amount,
                    paymentStatus: "pending",
                    txnDate: data.created_at,
                    email: applicant.email,
                    phone: applicant.phone
                }
            )
        }

    }
    else if (status === "failed") {
        return {
            from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
            to: process.env.NODE_ENV === "production" ? applicant.email : "graciela.keeling37@ethereal.email",
            subject: "IEEE Job Fair 2022 | Registration failed",
            cc: "backup@ieeejobfair.com",

            html: failed(
                {
                    name: applicant.firstName + " " + applicant.lastName,
                    orderId: data.orderId,
                    amount: data.txnAmount,
                    paymentStatus: "failed",
                    txnDate: data.txnDate,
                    email: applicant.email,
                    phone: applicant.phone
                }
            )
        }
    }

}

module.exports = content;