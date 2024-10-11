import React, { useState } from 'react';
import './Invoice.css'; 
import { useLocation } from 'react-router-dom';

const Invoice = () => {
  const location = useLocation();
  // se obtienen los datos de la factura
  const invoiceData = location.state?.invoiceData;
  const [editInvoice, setEditInvoice] = useState(invoiceData);

  // se formatea a json el string con el json de la factura
  const formatedInvoiceData = JSON.parse(invoiceData)
  console.log(formatedInvoiceData)

  // revisar si invoiceData está definida para usar la información
  if (!invoiceData) {
    return <p>No hay datos de la factura disponibles.</p>;
  }

  // permite manejar los cambios hechos en la factura
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...invoiceData.productos];
    updatedProducts[index][field] = field === 'precio_unitario' || field === 'cantidad' ? parseFloat(value) : value;
    updatedProducts[index].total = updatedProducts[index].cantidad * updatedProducts[index].precio_unitario;

    setEditInvoice({
        ...invoiceData,
        productos: updatedProducts,
        total_compra: updatedProducts.reduce((sum, product) => sum + product.total, 0),
    });
  };

  return (
    <div className="invoice-container">
      <h1 className="invoice-title">Factura Instabill</h1>
      <div className="customer-info">
        <p><strong>Cliente:</strong> {formatedInvoiceData.cliente} </p>
        <p><strong>Dirección:</strong> {formatedInvoiceData.direccion} </p>
        <p><strong>Telefono:</strong> {formatedInvoiceData.celular} </p>
      </div>
      
      <table className="invoice-table">
        <thead>
            <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            {formatedInvoiceData.productos.map((producto, index) => (
                <tr key={index}>
                    <td>{producto.producto}</td>
                    <td>{producto.cantidad}</td>
                    <td>${producto.precio_unitario.toFixed(2)}</td>
                    <td>${producto.total.toFixed(2)}</td>
                </tr>
            ))}
        </tbody>
      </table>
            
      <div className="total">
          <strong>Total a Pagar:</strong> ${formatedInvoiceData.total_compra.toFixed(2)}
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
