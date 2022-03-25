import './styles.scss';
import SearchIcon from '../../icons/search';

export default function Input({label,placeholder,onChange}) {
    return (
        <div className='search_container'>
            <SearchIcon className="search_icon" />
            <input placeholder={placeholder} onChange={onChange} className="search_input"/>
            {/* <p className="errorMsg">{getIn(errors, name)!==undefined?getIn(errors, name):""}</p> */}
        </div>


    );
}