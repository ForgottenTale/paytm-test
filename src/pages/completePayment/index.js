
import axios from 'axios';
import Loader from '../../components/loader';
import { useEffect, useState } from 'react';
import Error from '../../components/error';
import loadScript from '../../utils/razorpayScript';
import { useNavigate } from 'react-router-dom';
import src from '../../assets/celebrate.gif'

import { useParams } from 'react-router-dom';

export default function CompletePayment() {
    const { id } = useParams();

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [paymentSus, setPaymentSus] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);


    useEffect(() => {
        async function getData() {
            try {
                var data = await axios.get(`/api/pay/razorpay/orderDetails?orderId=${id}`)
                console.log(data)
                if (data.data.status !== "paid") {
                    displayRazorpay(data.data, data.data.userDetails)
                }
                else {
                    setPaymentSus(true)
                }
                // displayRazorpay()

            }
            catch (err) {
                setError(true)
                setErrorMsg(err.response !== undefined ? err.response.data.error : err)
                setLoading(false);
            }
        }
        getData()
    }, [])


    async function displayRazorpay(data, values) {
        console.log(values)
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?')
            return
        }

        const options = {
            key: data.key,
            currency: data.currency,
            amount: String(data.amount),
            order_id: data.id,
            name: 'IEEE Job Fair 2022',
            description: 'Thank you for registering',

            handler: async (response) => {
                try {
                    await axios.post("/api/pay/razorpay/verify", response)
                    navigate(`/confirmation/jobfair/${response.razorpay_order_id}`)
                } catch (err) {
                    setError(true)
                    setErrorMsg(err.response !== undefined ? err.response.data.error : err)
                    setLoading(false);
                }

            },
            prefill: {
                name: values.name,
                email: values.email,
                contact: `+91${values.phone}`
            }
        }
        const paymentObject = new window.Razorpay(options)
        paymentObject.open()
        paymentObject.on('payment.failed', async (response) => {
            console.log(response)
            try {
                await axios.post("/api/pay/razorpay/failed", response.error)
                navigate(`/confirmation/jobfair/${response.error.metadata.order_id}`)
                paymentObject.close()
            } catch (err) {
                setError(true)
                setErrorMsg(err.response !== undefined ? err.response.data.error : err)
                setLoading(false);
            }
        });
    }


    return (
        <div >
            {error ? <Error setError={setError} msg={errorMsg} /> : null}
            {loading ?

                <>
                    <Loader msg="Don&apos;t refresh this page. Redirecting to payment processing service ..." />

                </>
                : null}
            {paymentSus ? <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}>
                {/* <img src={src} alt="celebrate"/> */}
                <p>Payment already made</p>

            </div>
                : null}

        </div>


    )
}
