/* src/api/axios.js
import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:5000/api",
});*/

import axios from "axios";

const API = axios.create({
  baseURL: "https://hotel-backend-2-g911.onrender.com/api",
});

export default API;

