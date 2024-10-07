import React from 'react';
import './Invoice.css'; 
const Invoice = () => {
  return (
    <div className="invoice-container">
      <h1 className="invoice-title">Título Factura</h1>
      <div className="customer-info">
        <p><strong>Nombre Cliente:</strong> Juan Pérez</p>
        <p><strong>Dirección:</strong> Calle Ejemplo #123</p>
      </div>
      
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Producto 1</td>
            <td>2</td>
            <td>$10.00</td>
            <td>$20.00</td>
          </tr>
          <tr>
            <td>Producto 2</td>
            <td>1</td>
            <td>$15.00</td>
            <td>$15.00</td>
          </tr>
          <tr>
            <td>Producto 3</td>
            <td>3</td>
            <td>$7.00</td>
            <td>$21.00</td>
          </tr>
        </tbody>
      </table>
      
      <div className="total">
        <strong>Total a Pagar:</strong> $56.00
      </div>

      <textarea 
        className="additional-info" 
        placeholder="Información adicional..." 
      ></textarea>
      
      <button className="generate-btn">Generar Factura</button>
    </div>
  );
};

export default Invoice;
