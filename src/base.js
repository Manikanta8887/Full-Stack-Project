// // const baseurl = "https://touchlive-backend-1.onrender.com"
// const baseurl = "http://localhost:5000"

// export default baseurl

// src/base.js
const baseurl = import.meta.env.VITE_API_URL;
export default baseurl;
