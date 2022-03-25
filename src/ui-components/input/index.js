import './styles.css'

export default function DisabledInput({label,placeholder,value,onChange}) {
    return (
        <div className='inputContainer'>
            <p className="label"> {label}</p>
            <input placeholder={placeholder} value={value} onChange={onChange} className="input"/>
        
        </div>


    );
}