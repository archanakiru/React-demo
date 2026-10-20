import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/global.css"; import "./styles/auth.css"; import "./styles/layout.css";
import "./styles/dashboard.css"; import "./styles/validation.css"; import "./styles/tables.css";
document.documentElement.dataset.theme = localStorage.getItem("theme") || "light";
ReactDOM.createRoot(document.getElementById("root")).render(<BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>);
