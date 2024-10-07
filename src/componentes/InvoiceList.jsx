import React, { useState } from 'react';
import Invoice from './Invoice'; // Asegúrate de importar el componente Invoice
import './InvoiceList.css'; 

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewingInvoice, setIsViewingInvoice] = useState(false);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewingInvoice(true);
  };

  const handleCloseInvoice = () => {
    setIsViewingInvoice(false);
    setSelectedInvoice(null);
  };

  const handleModalClick = (e) => {
    // Si el clic está en el contenedor del modal, cierra el modal
    if (e.target.classList.contains('invoice-modal')) {
      handleCloseInvoice();
    }
  };

  // Ejemplo de facturas
  const exampleInvoices = [
    { id: 1, customerName: 'Juan Pérez', customerAddress: 'Calle Ejemplo #123', totalAmount: '$56.00' },
    { id: 2, customerName: 'María Gómez', customerAddress: 'Calle Ejemplo #456', totalAmount: '$30.00' },
    { id: 3, customerName: 'Pedro Martínez', customerAddress: 'Calle Ejemplo #789', totalAmount: '$75.00' },
  ];

  const handleEditInvoice = (invoice) => {
    // Aquí puedes agregar la lógica para editar la factura
    console.log('Editar factura:', invoice);
  };

  return (
    <div className="invoice-list-container">
      <h1>Lista de Facturas</h1>
      <table className="invoice-list-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Cliente</th>
            <th>Dirección</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {exampleInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.customerName}</td>
              <td>{invoice.customerAddress}</td>
              <td>{invoice.totalAmount}</td>
              <td>
                <button onClick={() => handleViewInvoice(invoice)}>Ver</button>
                <button onClick={() => handleEditInvoice(invoice)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isViewingInvoice && (
        <div className="invoice-modal" onClick={handleModalClick}>
          <Invoice invoice={selectedInvoice} onClose={handleCloseInvoice} />
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
