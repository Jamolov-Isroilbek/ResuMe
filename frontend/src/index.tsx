import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/styles.css';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ToastContainer />
    <App />
  </React.StrictMode>
);