
import './styles.scss';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Error from '../../components/error';
import Input from '../../ui-components/search';
import Loader from '../../components/loader';
import { useParams } from 'react-router-dom';
import UserDetails from './components/userDetail';
import SendIcon from '../../icons/send';
import DownloadIcon from '../../icons/download';
import Mail from './components/mail';

export default function Responses() {
    const [errorMsg, setErrorMsg] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [show, setShow] = useState(false);
    const [showMail, setShowMail] = useState(false);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("")
    const [applicant, setApplicant] = useState({});
    const header = ["OrderId", "Name", "Email", "Phone", "Institute", "Branch", "CGPA", "Passout Year", "Payment Status", "Action"];
    const { formId } = useParams();

    useEffect(() => {
        async function getData() {
            setLoading(true);
            try {
                const res = await axios.get(`/api/form/responses?formId=${formId}`)
                console.log(res.data)
                setLoading(false);
                setData(res.data);
            }
            catch (err) {
                setError(true)
                setErrorMsg(err.response !== undefined ? err.response.data.error : err)

            }
        }

        getData()
    }, [formId])


    return (
        <div className="responses">
            {showMail ? <Mail setShowMail={setShowMail} /> : null}
            {show ? <UserDetails data={applicant} setShow={setShow} /> : null}
            {error ? <Error setError={setError} msg={errorMsg} /> : null}

            {
                loading ? <Loader msg="Loading data" /> :
                    <div>
                        <h3>Responses</h3>
                        <div className="responses_tools">
                            <Input onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for users, email address..." />
                            <div className="responses_buttons">
                                <div className="responses_button" onClick={() => setShowMail(true)}><SendIcon /><p>Send mail</p></div>
                                <div className="responses_button"><DownloadIcon /><p>Download CSV</p></div>
                            </div>

                        </div>
                        <div className="table">
                            <div className='table_row'>
                                {header.map((val, key) => <div key={key} className='table_header'>
                                    {val}
                                </div>)}
                            </div>
                            {data.filter((n) => {
                                if (`${n.firstName + " " + n.lastName}`.includes(searchTerm) || n.email.includes(searchTerm) || n.paymentStatus.includes(searchTerm) || n.orderId.includes(searchTerm)) {
                                    return n;
                                } else {
                                    return null;
                                }
                            })

                                .map((val, key) => <div key={key} className='table_row' onClick={() => { setApplicant(val); setShow(true) }}>
                                    <div className='table_item'>{val.orderId}</div>
                                    <div className='table_item'>{val.firstName + " " + val.lastName}</div>
                                    <div className='table_item'>{val.email}</div>
                                    <div className='table_item'>{val.phone}</div>
                                    <div className='table_item'>{val.institute}</div>
                                    <div className='table_item'>{val.branch}</div>
                                    <div className='table_item'>{val.CGPA}</div>
                                    <div className='table_item'>{val.yearofPassout}</div>
                                    <div className='table_item'>{val.paymentStatus}</div>


                                </div>)}

                        </div>
                    </div>
            }
        </div>
    );
}