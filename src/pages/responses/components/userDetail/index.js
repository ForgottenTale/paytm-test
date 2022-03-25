import './styles.scss';
import DisabledInput from '../../../../ui-components/disabledInput';

export default function UserDetails({ data, setShow }) {

    return (
        <div className='userDetails' >
            <div className='userDetails_overlay'  onClick={() => setShow(false)}>

            </div>
            <div className='userDetails_con' >
                <DisabledInput label="Order Id" value={data.orderId}/>
                <DisabledInput label="Name" value={data.firstName + " " + data.lastName}/>
                <DisabledInput label="Email" value={data.email}/>
                <DisabledInput label="Phone" value={data.phone}/>
                <DisabledInput label="Institute" value={data.institute}/>
                <DisabledInput label="Branch" value={data.branch}/>
                <DisabledInput label="CGPA" value={data.CGPA}/>
                <DisabledInput label="Passout Year" value={data.yearofPassout}/>
                <DisabledInput label="Payment Status" value={data.paymentStatus}/>
                <DisabledInput label="Backlogs" value={data.backlog}/>
                <div onClick={()=>window.open(`/${data.resume}`)}>
                <DisabledInput label="Resume Link" value={data.resume} />

                </div>
            </div>
        </div>
    )
}