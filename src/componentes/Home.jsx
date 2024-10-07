import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Asegúrate de que la ruta del archivo CSS sea correcta

const Home = () => {
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleGenerateInvoice = () => {
    navigate('/invoice'); // Redirige a la página de la factura
  };

  const handleInvoiceList = () => {
    navigate('/invoiceList'); // Redirige a la página de la factura
  };
  

  return (
    <div className="home-container">
      {/* Primera sección - Texto de bienvenida */}
      <section className="welcome-section">
        <h1 className="welcome-text">Bienvenido a Instabill</h1>
        <p className="question-text">¿Qué deseas hacer?</p>
      </section>

      {/* Segunda sección - Nueva Factura */}
      <section className="invoice-section">
        <input 
          type="text" 
          placeholder="Aquí aparecerá la transcripción del audio..." 
          className="input-field" 
          disabled 
        />
        <div className="buttons-container">
          <button className="record-btn">Iniciar grabación</button>
          <button className="upload-btn">Subir audio</button>
        </div>
      </section>

      {/* Tercera sección - Historial de Facturas */}
      <section className="history-section">
      <button className="generate-btn" onClick={handleGenerateInvoice}>Generar factura</button>
        <button className="history-btn" onClick={handleInvoiceList}>Ver facturas</button>
      </section>
    </div>
  );
};

export default Home;
