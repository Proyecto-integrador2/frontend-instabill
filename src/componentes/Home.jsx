import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Asegúrate de que la ruta del archivo CSS sea correcta
import getDataInvoice from '../utils/apiGPT.js'
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const navigate = useNavigate(); // Inicializa useNavigate
  const [transcription, setTranscription] = useState('esteban vive en la dirección calle 6 #6-18, número de celular 3017539955 compra 2 lapiceros marca kilometrico , también lleva 5 cuadernos marca norma cuadriculados a 8700 cada unidad, también un maletin que cuesta 50000, también lleva una regla a 1000, un kit de colores marca condor a 19000 y finalmente lleva 3 marcadores marca sharpie con un precio de 3000 por unidad.');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [invoiceStructure, setInvoiceStructure ] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const handleInvoiceList = () => {
    navigate('/invoiceList'); // Redirige a la página de la factura
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', audioBlob);

      try {
        setIsLoading(true);
        const response = await axios.post('http://127.0.0.1:8000/speech-to-text/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response.data.transcription);
        console.log(response);
        setTranscription(response.data.transcription); 
        setIsLoading(false);
      } catch (error) {
        console.error('Error al enviar el audio:', error);
        console.log(isLoading);
        setIsLoading(false);
      }
    };

    console.log(isLoading);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    console.log(isLoading);
    setIsRecording(false);
  };

  const fileInputRef = useRef(null);
  
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const uploadAudio = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('audio', file);
    console.log(formData)

    try {
      setIsLoadingAudio(true);
      const response = await axios.post('http://127.0.0.1:8000/speech-to-text/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data.transcription);
      console.log(response);
      setTranscription(response.data.transcription);
      setIsLoadingAudio(false);
    } catch (error) {
      console.error('Error al subir el archivo de audio:', error);
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
        title: '¿Estás seguro?',
        text: '¿Estás satisfecho con la transcripción antes de generar la factura?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, generar factura',
        cancelButtonText: 'No, revisar de nuevo',
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, generar la factura
          console.log("input GPT: ", transcription);
          const invoiceData = await getDataInvoice(transcription);
          setInvoiceStructure(invoiceData);

          const date = new Date().toLocaleString('es-CO');
          navigate('/invoice', { state: { invoiceData, date: date } });

          Swal.fire('Factura Generada', 'Tu factura ha sido creada correctamente.', 'success');
        } else {
          // Si el usuario decide no proceder
          Swal.fire('Revisión', 'Puedes revisar o editar la transcripción antes de generar la factura.', 'info');
        }
      });
    } else {
      Swal.fire('Error', 'La transcripción está vacía. Por favor, inicia o sube una grabación.', 'error');
    }
  }

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
          value={transcription} // Muestra la transcripción
          onChange={(e) => setTranscription(e.target.value)}
        />
        <div className="buttons-container">
          <button 
            className="record-btn" 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            {isRecording 
              ? 'Detener grabación' 
              : isLoading 
                ? <FontAwesomeIcon icon={faSpinner} spin /> 
                : 'Iniciar grabación'
            }
          </button>
          <button className="upload-btn" type="button" onClick={handleButtonClick} disabled={isLoadingAudio}>
            {isLoadingAudio ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Subir audio'}
          </button>
          <input
            type="file"
            accept="audio/*"
            className="upload-btn"
            onChange={uploadAudio}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </div>
      </section>

      {/* Tercera sección - Historial de Facturas */}
      <section className="history-section">
        <button className="generate-btn" onClick={handleGenerateRequestGPT}>Generar factura</button>
        <button className="history-btn" onClick={handleInvoiceList}>Ver facturas</button>
      </section>
    </div>
  );
};

export default Home;
