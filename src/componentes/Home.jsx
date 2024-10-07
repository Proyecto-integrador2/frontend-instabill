import React from 'react';
import './Home.css'; // Asegúrate de que la ruta del archivo CSS sea correcta

const Home = () => {
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
        <button className="generate-btn">Generar factura</button>
        <button className="history-btn">Ver facturas</button>
      </section>
    </div>
  );
};

export default Home;
