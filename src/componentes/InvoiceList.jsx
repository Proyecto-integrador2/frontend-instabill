import { useState, useEffect } from "react";
import { Eye, Edit } from "lucide-react";
import Invoice from "./Invoice"; // Asegúrate de importar el componente Invoice
import { getBills } from "../utils/bills";
import "./InvoiceList.css";

const InvoiceList = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isViewingBill, setIsViewingBill] = useState(false);

  /**
   * Función  que nos permite manejar la vista del
   * componente de la factura
   * @returns {Void}
   */
  const handleViewBill = (bill) => {
    console.log("Ver Factura:", bill);
    setSelectedBill(bill);
    setIsViewingBill(true);
  };

  /**
   * Función  que nos permite manejar la edición de la
   * vista de la factura
   * @returns {Void}
   */
  const handleEditBill = (bill) => {
    console.log("Editar Factura:", bill);
  };

  /**
   * Función  que nos permite manejar el cierre de la
   * vista de la factura
   * @returns {Void}
   */
  const handleCloseBill = () => {
    setIsViewingBill(false);
    setSelectedBill(null);
  };

  /**
   * Función  que nos permite obtener abrir un contenedor modal
   * para la vista de facturas
   * @param {Event} e
   * @returns {Void}
   */
  const handleModalClick = (e) => {
    // Si el clic está en el contenedor del modal, cierra el modal
    if (e.target.classList.contains("invoice-modal")) {
      handleCloseBill();
    }
  };

  /**
   * Función asincrónica que nos permite obtener la lista de
   * facturas guardadas en el servidor y guardarla en el
   * Local Storage.
   * @returns {Void}
   */
  const fetchBillList = async () => {
    const data = await getBills();
    localStorage.setItem("bill_list", JSON.stringify(data));
    setBills(data);
    // console.log("Bills fetched", data);
  };

  /**
   * Función  que nos permite limpiar el Local Storage
   * al cerrar o reiniciar la ventana.
   * @returns {Void}
   */
  const clearLocalStorage = () => {
    window.onbeforeunload = () => {
      localStorage.clear();
    };
  };

  useEffect(() => {
    clearLocalStorage();

    if (localStorage.getItem("bill_list")) {
      const data = JSON.parse(localStorage.getItem("bill_list"));
      setBills(data);
      // console.log("Bills got from localStorage", data);
    } else {
      fetchBillList();
    }
  }, []);

  return (
    <div className="invoice-list-container">
      <h1 className="invoice-list-title">Lista de Facturas</h1>
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
          {bills.map((bill) => (
            <tr key={bill.id_factura}>
              <td>{bill.id_factura}</td>
              <td>{bill.cliente.nombre}</td>
              <td>{bill.cliente.direccion}</td>
              <td>${bill.total_compra}</td>
              <td>
                <div className="container-btn">
                  <button
                    className="view-bill-btn"
                    onClick={() => handleViewBill(bill)}
                  >
                    <Eye className="mr-2" /> Ver
                  </button>
                  <button
                    className="edit-bill-btn"
                    onClick={() => handleEditBill(bill)}
                  >
                    <Edit className="mr-2" />
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isViewingBill && selectedBill && (
        <div className="invoice-modal" onClick={(e) => handleModalClick(e)}>
          <Invoice billData={selectedBill} onClose={handleCloseBill} />
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
