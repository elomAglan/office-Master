import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Crée la racine de l'application React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendu de l'application principale avec React Strict Mode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Le code ci-dessous a été retiré car `reportWebVitals` n'est pas nécessaire à moins
// que tu veuilles surveiller les performances de ton application.
// Si tu veux le réutiliser un jour, tu peux réimporter et ajouter la logique de performance.

// Exemple : reportWebVitals(console.log);
// Pour plus d'informations : https://bit.ly/CRA-vitals
