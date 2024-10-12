import React, { useState } from 'react';
import './Invoice.css'; 
import { useLocation } from 'react-router-dom';

const Invoice = () => {
  const location = useLocation();
  // se obtienen los datos de la factura
  const data = location.state?.invoiceData;
  const date = location.state?.date;

  // se formatea a json el string con el json de la factura
  const invoiceData = JSON.parse(data)
  const [editInvoice, setEditInvoice] = useState({
    ...invoiceData,
    total_compra: invoiceData.productos.reduce((sum, product) => sum + product.precio_total, 0),
    fecha_facturacion: date
  });

  // revisar si invoiceData está definida para usar la información
  if (!data) {
      return <p>No hay datos de la factura disponibles.</p>;
  }

  // permite manejar los cambios hechos en la factura
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editInvoice.productos];
    updatedProducts[index][field] = field === 'precio_unitario' || field === 'cantidad' ? parseFloat(value) : value;
    updatedProducts[index].precio_total = updatedProducts[index].cantidad * updatedProducts[index].precio_unitario;

    setEditInvoice({
        ...editInvoice,
        productos: updatedProducts,
        total_compra: updatedProducts.reduce((sum, product) => sum + product.precio_total, 0),
    });
  };

  // permite manejar los cambios hechos en información del cliente
  const handleClientChange = (field, value) => {
    setEditInvoice({
        ...editInvoice,
        cliente: {
            ...editInvoice.cliente,
            [field]: value
        }
    });
  };

  return (
    <div className="invoice-container">
      <h1 className="invoice-title">Factura Instabill</h1>
      <div className="customer-info">
          <p>
              <strong>Nombre Cliente:</strong>
              <input 
                  type="text" 
                  value={editInvoice.cliente.nombre} 
                  onChange={(e) => handleClientChange('nombre', e.target.value)}
              />
          </p>
          <p>
              <strong>Dirección:</strong>
              <input 
                  type="text" 
                  value={editInvoice.cliente.direccion} 
                  onChange={(e) => handleClientChange('direccion', e.target.value)} 
              />
          </p>
          <p>
              <strong>Celular:</strong>
              <input 
                  type="text" 
                  value={editInvoice.cliente.contacto} 
                  onChange={(e) => handleClientChange('celular', e.target.value)} 
              />
          </p>
          <p> <strong>Fecha:</strong> {editInvoice.fecha_facturacion} </p>
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
              {editInvoice.productos.map((product, index) => (
                  <tr key={index}>
                      <td>
                          <input 
                              type="text" 
                              value={product.nombre}
                              onChange={(e) => handleProductChange(index, 'nombre', e.target.value)} 
                          />
                      </td>
                      <td>
                          <input 
                              type="number" 
                              value={product.cantidad} 
                              onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)} 
                              min="1"
                          />
                      </td>
                      <td>
                          <input 
                              type="number" 
                              value={product.precio_unitario} 
                              onChange={(e) => handleProductChange(index, 'precio_unitario', e.target.value)} 
                              step="0.01"
                          />
                      </td>
                      <td>${product.precio_total}</td>
                  </tr>
              ))}
          </tbody>
      </table>
      
      <div className="total">
          <strong>Total a Pagar:</strong> ${editInvoice.total_compra}
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