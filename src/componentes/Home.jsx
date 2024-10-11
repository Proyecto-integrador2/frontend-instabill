import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Asegúrate de que la ruta del archivo CSS sea correcta
import getDataInvoice from '../utils/apiGPT.js'

const Home = () => {
  const navigate = useNavigate(); // Inicializa useNavigate
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
        const response = await axios.post('http://127.0.0.1:8000/speech-to-text/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response.data.transcription);
        console.log(response);
        setTranscription(response.data.transcription); // Asegúrate de que el backend envíe la transcripción en este formato
      } catch (error) {
        console.error('Error al enviar el audio:', error);
      }
    };

    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
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

    try {
      const response = await axios.post('http://127.0.0.1:8000/speech-to-text/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data.transcription);
      console.log(response);
      setTranscription(response.data.transcription); // Asegúrate de que el backend envíe la transcripción en este formato
    } catch (error) {
      console.error('Error al subir el archivo de audio:', error);
    }
  };

  /**
   * Maneja la generación de la estructura de la factura invocando la función
   * que hace consultas a la api de OpenAI partiendo del texto de la transcripción
   */
  const handleGenerateRequestGPT = async () => {
    if (transcription.length > 5) {
      console.log("input GPT: ", transcription)
      const billData = await getDataInvoice(transcription);
      console.log("output GPT: ", billData)
      navigate('/invoice');
    } else {
      alert('La transcripción está vacía. Por favor, inicia o sube una grabación.');
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
          disabled
        />
        <div className="buttons-container">
          <button 
            className="record-btn" 
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? 'Detener grabación' : 'Iniciar grabación'}
          </button>
          <button className="upload-btn" type="button" onClick={handleButtonClick}>
            Subir audio
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
