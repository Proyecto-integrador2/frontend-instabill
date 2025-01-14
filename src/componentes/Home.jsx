import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css"; // Asegúrate de que la ruta del archivo CSS sea correcta
import getDataInvoice from "../utils/apiGPT.js";
import {
  Mic,
  Upload,
  FileText,
  Play,
  StopCircle,
  Loader2,
  ReceiptText,
} from "lucide-react";
import InvoiceList from "./InvoiceList.jsx";
import Swal from "sweetalert2";

const Home = () => {
  const navigate = useNavigate(); // Inicializa useNavigate
  const [transcription, setTranscription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("record");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  /** Redirige a la página de la lista de facturas.
   * */
  const handleInvoiceList = () => {
    navigate("/invoiceList");
  };

  /** Inicia la grabación de audio y envía el archivo grabado a un endpoint de la API para convertirlo a texto.
   * */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
          setIsLoading(true);
          const response = await axios.post(
            import.meta.env.VITE_URL_DOCKER + "/speech-to-text/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          setTranscription(response.data.transcription);
        } catch (error) {
          console.error("Error al enviar el audio:", error);
        } finally {
          setIsLoading(false);
        }
      };

      setIsRecording(true);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
    }
  };

  /** Detiene la grabación de audio y envía el archivo grabado a un endpoint de la API para convertirlo a texto.
   * */
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    console.log(isLoading);
    setIsRecording(false);
  };

  const fileInputRef = useRef(null);

  /** Simula un clic en el input de archivo, permitiendo al usuario seleccionar un archivo de audio desde su dispositivo.
   * */
  const handleAudioUpload = () => {
    fileInputRef.current.click();
  };

  /** Maneja el evento de carga de un archivo de audio seleccionado por el usuario.
   * Envía el archivo a un endpoint de la API para convertirlo a texto.
   * Actualiza el estado transcription con la respuesta del servidor.
   */
  const uploadAudio = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("audio", file);
    console.log(formData);

    try {
      setIsLoadingAudio(true);
      const response = await axios.post(
        import.meta.env.VITE_URL_DOCKER + "/speech-to-text/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data.transcription);
      console.log(response);
      setTranscription(response.data.transcription);
      setIsLoadingAudio(false);
    } catch (error) {
      console.error("Error al subir el archivo de audio:", error);
      setIsLoadingAudio(false);
    }
  };

  /**
   * Maneja la generación de la estructura de la factura invocando la función
   * que hace consultas a la api de OpenAI partiendo del texto de la transcripción
   */
  const handleGenerateRequestGPT = async () => {
    if (transcription.length > 5) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Estás satisfecho con la transcripción antes de generar la factura?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, generar factura",
        cancelButtonText: "No, revisar de nuevo",
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, generar la factura
          setIsProcessing(true);
          console.log("input GPT: ", transcription);
          const invoiceData = await getDataInvoice(transcription);

          const date = new Date().toLocaleString("es-CO");
          setIsProcessing(false);
          navigate("/invoice", { state: { invoiceData, date: date } });

          Swal.fire(
            "Factura Generada",
            "Tu factura ha sido creada correctamente.",
            "success"
          );
        } else {
          // Si el usuario decide no proceder
          Swal.fire(
            "Revisión",
            "Puedes revisar o editar la transcripción antes de generar la factura.",
            "info"
          );
        }
      });
    } else {
      Swal.fire(
        "Error",
        "La transcripción está vacía. Por favor, inicia o sube una grabación.",
        "error"
      );
    }
  };

  return (
    <div className="container mx-auto p-2">
      <ReceiptText className="mx-auto mb-2 h-12 w-12 text-gray-900" />
      <h1 className="flex justify-center align-middle text-5xl font-bold text-center mb-6 text-gray-900">
        InstaBill
      </h1>
      <p className="text-2xl mb-8 text-center text-gray-500">
        ¿Qué deseas hacer?
      </p>
      <div className="w-full p-8 border rounded-md border-gray-300">
        <div className="flex mb-4 space-x-2">
          <button
            onClick={() => setActiveTab("record")}
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === "record"
                ? "bg-white text-gray-900"
                : "bg-white text-gray-400"
            }`}
          >
            Nueva Factura
          </button>
          <button
            onClick={() => setActiveTab("bills")}
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === "bills"
                ? "bg-white text-gray-900"
                : "bg-white text-gray-400"
            }`}
          >
            Ver Facturas
          </button>
        </div>
        {activeTab === "record" && (
          <div className="border rounded-lg p-4 shadow-sm border-gray-300">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-700">
                Habla o Sube un Audio con tus Productos
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center mt-4 mr-10 space-x-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    isRecording
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {isRecording ? (
                    <StopCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <Mic className="mr-2 h-4 w-4" />
                  )}
                  {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
                </button>
                <button
                  onClick={handleAudioUpload}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    isLoadingAudio
                      ? "bg-pink-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {isLoadingAudio ? (
                    <React.Fragment>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo Audio...
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Audio
                    </React.Fragment>
                  )}
                  <input
                    id="audioUpload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={uploadAudio}
                  />
                </button>
              </div>
              {isRecording && (
                <div className="text-center text-sm text-gray-500">
                  Grabando... Habla de manera clara.
                </div>
              )}
              <div className="border-t pt-4 border-gray-300">
                <h3 className="font-semibold text-2xl text-gray-700 mb-4">
                  Transcripción de la Factura
                </h3>
                <textarea
                  className="textarea-field"
                  placeholder="Aquí aparecerá la transcripción del audio..."
                  value={transcription} // Muestra la transcripción
                  onChange={(e) => setTranscription(e.target.value)}
                  style={{
                    marginLeft: "10px",
                    width: "450px",
                    height: "242px",
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row justify-center mt-4 mr-6 space-x-4">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-md flex items-center justify-center"
                onClick={handleGenerateRequestGPT}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <React.Fragment>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando Factura...
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <FileText className="mr-2 h-4 w-4" />
                    Generar Factura
                  </React.Fragment>
                )}
              </button>
            </div>
          </div>
        )}
        {activeTab === "bills" && (
          /*<div className="border rounded-lg p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Your Bills</h2>
                <p className="text-gray-600">
                  View and manage your generated bills
                </p>
              </div>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                  <span>Bill #1234 - $45.00</span>
                  <button className="text-blue-500">
                    <FileText className="h-4 w-4" />
                  </button>
                </li>
                <li className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                  <span>Bill #1235 - $32.50</span>
                  <button className="text-blue-500">
                    <FileText className="h-4 w-4" />
                  </button>
                </li>
                <li className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                  <span>Bill #1236 - $78.25</span>
                  <button className="text-blue-500">
                    <FileText className="h-4 w-4" />
                  </button>
                </li>
              </ul>
            </div>*/
          <InvoiceList />
        )}
      </div>
    </div>
  );
};

export default Home;
