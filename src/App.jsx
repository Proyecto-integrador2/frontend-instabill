import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./componentes/Home";
import Invoice from "./componentes/Invoice";
import "./App.css";
import InvoiceList from "./componentes/InvoiceList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/invoiceList" element={<InvoiceList />} />
      </Routes>
    </Router>
  );
}

export default App;
