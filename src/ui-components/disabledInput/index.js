import './styles.css'

export default function DisabledInput({label,placeholder,value,onClick}) {
    return (
        <div className='inputContainer'>
            <p className="label"> {label}</p>
            <input placeholder={placeholder} disabled value={value} onClick={onClick} className="input"/>
        
        </div>


    );
}