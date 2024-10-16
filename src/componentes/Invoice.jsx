import React, { useState, useEffect  } from "react";
import "./Invoice.css";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import { postBill } from "../utils/bills";
import { ArrowLeftFromLine } from "lucide-react";

const Invoice = ({ billData }) => {
  const navigate = useNavigate(); 
  const location = useLocation();
  // Se obtienen los datos de la factura
  const data = location.state?.invoiceData;
  const date = location.state?.date;

  let invoiceData = null;

  // Si hay data, se formatea a JSON el string con el JSON de la factura
  if (data) {
    invoiceData = JSON.parse(data);
  }
  // Si billData está definido y data no, entonces usar billData como información
  else if (billData) {
    invoiceData = billData;
  }

  // Revisar si tanto billData y Data están definidos para usar la información
  else if (!billData && !data) {
    return <p>No hay datos de la factura disponibles.</p>;
  }

  const [editInvoice, setEditInvoice] = useState({
    ...invoiceData,
    total_compra: invoiceData.productos.reduce(
      (sum, product) =>
        parseFloat(sum) + (parseFloat(product.precio_total) || 0),
      0
    ),
    fecha_facturacion: date,
  });
  const validateInvoice = () => {
    const missingFields = [];

    // Validar datos del cliente
    if (!editInvoice.cliente.nombre) missingFields.push("Falta el Nombre del cliente");
    if (!editInvoice.cliente.direccion) missingFields.push("Falta la Dirección del cliente");
    if (!editInvoice.cliente.contacto) missingFields.push("Falta el Contacto del cliente");

    // Validar productos
    editInvoice.productos.forEach((product, index) => {
        if (!product.nombre) {
            missingFields.push(`Nombre del producto ${index + 1}`);
        } else {
            // Si el nombre del producto es conocido pero faltan otros datos
            }if ((!product.cantidad || product.cantidad <= 0) & (!product.precio_unitario || product.precio_unitario <= 0)) {
                missingFields.push(`Al producto ${product.nombre} le falta el precio unitario y la cantidad`);
            }else if (!product.precio_unitario || product.precio_unitario <= 0) {
              missingFields.push(`Al producto ${product.nombre} le falta el precio unitario`);
            }else{
              missingFields.push(`Al producto ${product.nombre} le falta la cantidad`);
            }
    });

    // Generar el mensaje a pronunciar
    if (missingFields.length > 0) {
        const message = ` ${missingFields.join(", ")}. No te olvides de añadir esa informacion`;
        speak(message);
    } else {
        const message = "La factura se ha generado correctamente. Revisa la información antes de guardar.";
        speak(message);
    }
};

  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    validateInvoice();
  }, []);

  console.log(editInvoice);

  // Permite manejar los cambios hechos en la factura
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

  const handleBack = () => {
    navigate("/")
  }

  const generatePDF = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Estás seguro que deseas descargar la factura?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, descargar factura",
      cancelButtonText: "No, devolver",
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, descargar la factura
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

          // Escalar la imagen para que se ajuste al tamaño del PDF
          const ratio = imgWidth / imgHeight;
          const pdfWidth = pageWidth * 0.9;
          const pdfHeight = pdfWidth / ratio; // Calcular la altura basado en el aspect ratio

          // Calcular las coordenadas para centrar la imagen
          const xOffset = (pageWidth - pdfWidth) / 2;
          const yOffset = (pageHeight - pdfHeight) / 2;

          pdf.addImage(imgData, "PNG", xOffset, yOffset, pdfWidth, pdfHeight);

          // Mostrar los botones de nuevo después de generar el PDF
          buttons.forEach((button) => (button.style.display = "block"));

          try {
            // Descargar el PDF
            pdf.save("factura.pdf");
            Swal.fire({
              title: "Factura Guardada con Éxito",
              text: "Tu factura ha sido guardada correctamente.",
              icon: "success",
            });
            navigate("/");
          } catch (error) {
            console.error("No se pudo descargar la factura: ", error);
            Swal.fire({
              title: "Error al Descargar la Factura",
              text: "Ocurrió un error al descargar la factura. Vuelve a intentarlo.",
              icon: "error",
            });
          }
        });
      } else {
        // Si el usuario decide no proceder
        Swal.fire({
          title: "Revisión",
          text: "Puedes revisar y ajustar la factura antes de descargarla.",
          icon: "info",
        });
      }
    });
  };

  const handleSavePDF = async () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Estás seguro que deseas guardar la factura?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar factura",
      cancelButtonText: "No, devolver",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, guardar los datos de la factura
        await postBill(editInvoice)
          .then(() => {
            Swal.fire({
              title: "Factura Guardada con Éxito",
              text: "Tu factura ha sido guardada correctamente.",
              icon: "success",
            });
          })
          .catch((error) => {
            Swal.fire({
              title: "Error al Enviar la Factura",
              text: "Ocurrió un error al enviar la factura. Vuelve a intentarlo.",
              icon: "error",
            });
          });
      } else {
        // Si el usuario decide no proceder
        Swal.fire({
          title: "Revisión",
          text: "Puedes revisar y ajustar la factura antes de guardarla.",
          icon: "info",
        });
      }
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
        <button className="back-btn" onClick={handleBack}>
          <ArrowLeftFromLine className="icon" />
        </button>
        <button className="download-btn" onClick={generatePDF}>
          Descargar PDF
        </button>
        <button className="save-btn" onClick={handleSavePDF}>
          Guardar Factura
        </button>
      </div>
    </div>
  );
};

export default Invoice;