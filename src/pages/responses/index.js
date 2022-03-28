
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

    const createCsv = () => {
        const headers = ["OrderId", "Name", "Email", "Phone", "Institute", "Backlog", "Branch", "CGPA", "Year of graduation","IEEE Member","Membership Id","Amount", "Payment Status", "Resume"];
        const rows = [headers];

        data.forEach((val) => {
            rows.push([
                val.orderId, val.firstName + " " + val.lastName, val.email, val.phone, String(val.institute), val.backlog, val.branch, val.CGPA, val.yearofPassout,val.ieeeMember?"Yes":"No",val.membershipId,val.amount, val.paymentStatus, `https://forms.ieee-mint.org/${val.resume}`
            ])
        })

        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");


        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    }
    const sendNotification = async()=>{
        try{
            await axios.post("/api/form/mail/reminder")
            setError(true)
            setErrorMsg("Payment notification mail send")
        }
        catch(err){
            setError(true)
            setErrorMsg(err.response !== undefined ? err.response.data.error : err)
        }

    }


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
                                <div className="responses_button" onClick={() => sendNotification()}><SendIcon /><p>Send notification</p></div>
                                <div className="responses_button" onClick={() => setShowMail(true)}><SendIcon /><p>Send mail</p></div>
                                <div className="responses_button" onClick={() => createCsv()}><DownloadIcon /><p>Download CSV</p></div>
                            </div>

                        </div>
                        <div className="table">
                            <div className='table_row'>
                                {header.map((val, key) => <div key={key} className='table_header'>
                                    {val}
                                </div>)}
                            </div>
                            {data.filter((n) => {
                                if (`${n.firstName + " " + n.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                                    || n.email.toLowerCase().includes(searchTerm.toLowerCase())
                                    || n.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
                                    || n.orderId.includes(searchTerm.toLowerCase())) {
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