import axios from "axios";

//const baseURL = "http://127.0.0.1:8000/";
const baseURL = "http://localhost:80";

const axiosInstance = axios.create({
  baseURL: baseURL,
});

export default axiosInstance;
