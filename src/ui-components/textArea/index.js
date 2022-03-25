import './styles.css'

export default function TextArea({label,placeholder,value,onChange}) {
    return (
        <div className='inputContainer'>
            <p className="label"> {label}</p>
            <textarea placeholder={placeholder} value={value} onChange={onChange} className="input"/>
        
        </div>


    );
}