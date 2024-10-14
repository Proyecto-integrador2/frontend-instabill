const headers = {
    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY_GPT}`,
    'Content-Type': 'application/json'
  };

/**
 * realiza una solicitud a la API de OpenAI para convertir una descripción de compra en un JSON estructurado
 * la función utiliza el modelo gpt-3.5-turbo para procesar la descripción de la compra
 * al asistente de GPT también se le da un rol para que actúe como tal
 * 
 * @param {string} dataInvoice - descripción de la compra que se desea convertir a JSON.
 * @returns {Promise<string|null>} - retorna una promesa que, si tiene éxito, resuelve con un string en formato JSON
 * con los detalles de la compra, o null en caso de error.
 * 
 * @example
 * const descripcion = "el cliente Andres López que vive en la dirección calle 5 #6-18, número de celular 3205007858 compra 3 lapiceros marca Kilometrico a 2500 por unidad..."
 * const resultado = await getDataInvoice(descripcion)
 * console.log(resultado); // retorna un JSON con la estructura de la factura.
 */
async function getDataInvoice(dataInvoice){
    const data = {
        model: "gpt-3.5-turbo",
        messages: [
            {
            role: "system",
            content: "Eres un asistente que convierte descripciones de compras en JSON con comillas dobles. Estructura: {cliente: {nombre:, direccion:, contacto:}, productos: [{nombre:, cantidad:, precio_unitario:, precio_total:}, ]}. Si cantidad o precio_unitario no son datos asigna un 0"
            },
            {
            role: "user",
            content: dataInvoice
            }
        ]
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if(!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        return jsonResponse.choices[0].message.content;

    } catch(error) {
        console.error("Hubo un problema con la solicitud", error);
        return null;
    }
}

export default getDataInvoice