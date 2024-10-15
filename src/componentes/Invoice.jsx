import React, { useState } from "react";
import "./Invoice.css";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Invoice = () => {
  const location = useLocation();
  // se obtienen los datos de la factura
  const data = location.state?.invoiceData;
  const date = location.state?.date;

  // se formatea a json el string con el json de la factura
  const invoiceData = JSON.parse(data);
  const [editInvoice, setEditInvoice] = useState({
    ...invoiceData,
    total_compra: invoiceData.productos.reduce(
      (sum, product) => sum + (product.precio_total || 0),
      0
    ),
    fecha_facturacion: date,
  });

  // revisar si invoiceData está definida para usar la información
  if (!data) {
    return <p>No hay datos de la factura disponibles.</p>;
  }

  // permite manejar los cambios hechos en la factura
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editInvoice.productos];
    updatedProducts[index][field] =
      field === "precio_unitario" || field === "cantidad"
        ? parseFloat(value)
        : value;
    updatedProducts[index].precio_total =
      (updatedProducts[index].cantidad || 0) *
      (updatedProducts[index].precio_unitario || 0);

    setEditInvoice({
      ...editInvoice,
      productos: updatedProducts,
      total_compra: updatedProducts.reduce(
        (sum, product) => sum + product.precio_total,
        0
      ),
    });
  };

  // permite manejar los cambios hechos en información del cliente
  const handleClientChange = (field, value) => {
    setEditInvoice({
      ...editInvoice,
      cliente: {
        ...editInvoice.cliente,
        [field]: value,
      },
    });
  };

  const generatePDF = () => {
    const invoiceElement = document.querySelector(".invoice-container");

    // Ocultar los botones antes de generar el PDF
    const buttons = document.querySelectorAll(".download-btn, .save-btn");
    buttons.forEach((button) => (button.style.display = "none"));

    html2canvas(invoiceElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("portrait", "in", "letter");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width; // Image original width
      const imgHeight = canvas.height; // Image original height

      // Scale image to fit in the PDF while maintaining aspect ratio
      const ratio = imgWidth / imgHeight;
      const pdfWidth = pageWidth * 0.9; // e.g., 90% of page width
      const pdfHeight = pdfWidth / ratio; // Calculate height based on aspect ratio

      // Calculate coordinates to center the image
      const xOffset = (pageWidth - pdfWidth) / 2;
      const yOffset = (pageHeight - pdfHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, pdfWidth, pdfHeight);

      // Mostrar los botones de nuevo después de generar el PDF
      buttons.forEach((button) => (button.style.display = "block"));

      // Descargar el PDF
      pdf.save("factura.pdf");
    });
  };

  return (
    <div className="invoice-container">
      <h1 className="invoice-title">Factura InstaBill</h1>
      <div className="customer-info">
        <p className="customer-name">
          <strong>Nombre Cliente:</strong>
          <input
            type="text"
            value={editInvoice.cliente.nombre}
            onChange={(e) => handleClientChange("nombre", e.target.value)}
            style={{ marginLeft: "5px" }}
          />
        </p>
        <p className="customer-address">
          <strong>Dirección:</strong>
          <input
            type="text"
            value={editInvoice.cliente.direccion}
            onChange={(e) => handleClientChange("direccion", e.target.value)}
          />
        </p>
        <p className="customer-contact">
          <strong>Contacto:</strong>
          <input
            type="text"
            value={editInvoice.cliente.contacto}
            onChange={(e) => handleClientChange("contacto", e.target.value)}
          />
        </p>
        <p className="invoice-date">
          {" "}
          <strong>Fecha:</strong> {editInvoice.fecha_facturacion}{" "}
        </p>
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
                  onChange={(e) =>
                    handleProductChange(index, "nombre", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={product.cantidad}
                  onChange={(e) =>
                    handleProductChange(index, "cantidad", e.target.value)
                  }
                  min="1"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={product.precio_unitario}
                  onChange={(e) =>
                    handleProductChange(
                      index,
                      "precio_unitario",
                      e.target.value
                    )
                  }
                  step="100"
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

      {/* Botones */}
      <div className="container-btn">
        <button className="download-btn" onClick={generatePDF}>
          Descargar PDF
        </button>
        <button
          className="save-btn"
          onClick={() => console.log("Guardar factura en la base de datos")}
        >
          Guardar Factura
        </button>
      </div>
    </div>
  );
};

export default Invoice;
