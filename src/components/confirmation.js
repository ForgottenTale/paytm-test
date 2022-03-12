import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "./loader";
import Error from "./error";
import { useParams } from 'react-router-dom';

export default function Confirmation() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(async () => {
        try {
            const res = await axios.get(`/api/confirmation/${id}`);
            console.log(res)
        }
        catch (err) {
            setError(true)
            setErrorMsg(err.response !== undefined ? String(err) : String(err))
            // setLoading(false);
        }
    }, [])

    return (
        <main className="main">
            <div className="eventform">
                {error ? <Error setError={setError} msg={errorMsg} /> : null}
                {loading ?
                    <Loader msg="Loading receipt details" /> :
                    <div className="eventform_con">
                        <div className="eventdetails">
                            <p className="eventdetails_dnt">Event Registration Confirmation</p>
                            <h3 className="eventdetails_title">Introduction to CryptoCurrency</h3>
                            <p className="eventdetails_des">Thank you for registering for the event. A copy of the receipt has been sent to your registered email</p>
                            {/* <p className="confirm"></p> */}
                        </div>
                        <div className="paymentDetails">
                            <p className="paymentDetails_title">Payment Details</p>
                            <div className="paymentDetails_grid">
                                <p>Order Id</p> <p>TMX1234G1</p>
                                <p>Payment Status</p> <p>Success</p>
                                <p>Amount</p> <p>Rs 10.00</p>
                                <p>Date</p> <p>12th Mar 2022 11:00 PM IST</p>

                            </div>
                        </div>
                        <div className="paymentDetails">
                            <p className="paymentDetails_title">Event Details</p>
                            <div className="paymentDetails_grid">
                                <p>Date and Time</p> <p>12th Mar 2022 11:00 PM IST</p>
                                <p>Venue</p> <p>Kottayam, Kerala</p>
                                {/* <p>Amount</p> <p>Rs 10.00</p>
                            <p>Date</p> <p>12th Mar 2022 11:00 PM IST</p> */}

                            </div>

                        </div>
                    </div>
                }
            </div>
        </main>
    );
}