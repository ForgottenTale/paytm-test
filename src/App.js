
import './App.css';
import Payments from './components/payments';
import { Routes, Route, Link, BrowserRouter as Router } from "react-router-dom";
import Confirmation from './components/confirmation';
function App() {
  return (
    <div className="App">
      < Router >
        <Routes>
          <Route path="/" element={<Payments />} exact />
          <Route path="/confirmation" element={<Confirmation />} exact />

        </Routes>

      </Router >
    </div>)
}

export default App;
