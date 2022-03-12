
import Input from '../ui-components/input';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

export default function Payments(){
    const user= {
        email: "",
        firstName: "",
        lastName: "",
        phone: ""
      }
    
      let schema = yup.object().shape({
        email: yup.string().email().required(),
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        phone: yup.number().required()
      });
      function isDate(val) {
        // Cross realm comptatible
        return Object.prototype.toString.call(val) === '[object Date]'
      }
    
      function isObj(val) {
        return typeof val === 'object'
      }
    
      function stringifyValue(val) {
        if (isObj(val) && !isDate(val)) {
          return JSON.stringify(val)
        } else {
          return val
        }
      }
    
      function buildForm({ action, params }) {
        const form = document.createElement('form')
        form.setAttribute('method', 'post')
        form.setAttribute('action', action)
     
        Object.keys(params).forEach(key => {
          const input = document.createElement('input')
          input.setAttribute('type', 'hidden')
          input.setAttribute('name', key)
          input.setAttribute('value', stringifyValue(params[key]))
          form.appendChild(input)
        })
    
        return form
      }
    
      function post(details) {
        const form = buildForm(details)
        document.body.appendChild(form)
        form.submit()
        form.remove()
      }
      const handleUpload = async (values) => {
        try {
          const res = await axios.post("/pay", values, {
            "headers": {
              "Content-Type": "application/json"
            }
          })
          console.log(res.data)
          var details ={ 
            action : "https://securegw-stage.paytm.in/order/process",
            params : res.data
          }
          post(details);
        }
        catch (err) {
          console.log(err);
        }
    
      }
      return (
   
          <main className="main">
            <div className="eventform">
              <div className="eventform_con">
                <div className="eventdetails">
                  <p className="eventdetails_dnt">12th Mar 2022 11:00 PM IST</p>
                  <h3 className="eventdetails_title">Introduction to CryptoCurrency</h3>
                  <p className="eventdetails_des">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</p>
                </div>
                <Formik
                  initialValues={user}
                  validationSchema={schema}
                  onSubmit={(values) => { handleUpload(values) }}
                >
                  {({ values, setFieldValue, handleSubmit, errors }) => (
                    <>
                      <Input label="First Name" placeholder={"Enter your first name"} value={values} name="firstName" setFieldValue={setFieldValue} errors={errors}></Input>
                      <Input label="Last Name" placeholder={"Enter your last name"} value={values} name="lastName" setFieldValue={setFieldValue} errors={errors}></Input>
                      <Input label="Email" placeholder={"Enter your email addrees"} value={values} name="email" setFieldValue={setFieldValue} errors={errors}></Input>
                      <Input label="Phone" placeholder={"Enter your phone number"} value={values} name="phone" setFieldValue={setFieldValue} errors={errors}></Input>
                      <button className="button" onClick={handleSubmit}>Pay Rs 100/-</button>
                      {/* {JSON.stringify(errors,null,2)}
                      {JSON.stringify(values,null,2)} */}
    
                    </>
                  )}
                </Formik>
    
    
              </div>
            </div>
            {/* <div className={styles.image}>
      <Image src={"/webinar.png"}width="100%" height="100%" layout="responsive" objectFit="contain" />
    </div> */}
          </main>
        
      );
}