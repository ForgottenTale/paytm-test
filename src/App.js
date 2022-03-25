
import './App.css';
import Payments from './components/payments';
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import JobFair from './pages/jobfair';
import Responses from './pages/responses';
import Confirmation from './components/confirmation';

function App() {
  return (
    <div className="App">
      < Router >
        <Routes>
          <Route path="/:formId" element={<JobFair />} exact />
          <Route path="/:formId/responses" element={<Responses />} exact />
          <Route path="/confirmation/:formId/:orderId" element={<Confirmation />} exact />
          <Route path="/" element={<Payments />} exact />
        </Routes>

      </Router >
    </div>)
}

export default App;
