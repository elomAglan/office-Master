import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Modification ici
import Navbar from './components/Navbar';
import SecretaryNavbar from './components/SecretaryNavbar';
import EmployeeNavbar from './components/EmployeeNavbar';
import Home from './components/Home';
import GestionPresences from './components/GestionReunions';
import Parametres from './components/Parametres';
import Demandes from './components/Demandes';
import GestionDemandes from './components/GestionDemandes'; 
import GestionEmployes from './components/GestionEmployes';
import Messagerie from './components/Messagerie';
import GestionDocuments from './components/GestionDocuments';
import Login from './api/Login';
import Register from './api/register';

const App = () => {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // État pour currentUser

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            const decoded = jwtDecode(savedToken); // Utilisation de jwtDecode
            setCurrentUser(decoded); // Mise à jour de l'état currentUser
            setRole(decoded.role); // Assurez-vous que le rôle est récupéré à partir du token
        }
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

    const PrivateRoute = ({ children }) => {
        return token ? children : <Navigate to="/login" />;
    };

    const renderNavbar = () => {
        switch (role) {
            case 'Directeur':
                return <Navbar />;
            case 'Secrétaire':
                return <SecretaryNavbar />;
            case 'Employé':
                return <EmployeeNavbar />;
            default:
                return null; // Pas de barre de navigation si le rôle est inconnu
        }
    };

    return (
        <Router>
            <div style={{ display: 'flex' }}>
                {/* Vérifie si le token est présent et si l'utilisateur n'est pas sur la page de connexion ou d'inscription */}
                {token && !['/login', '/register'].includes(window.location.pathname) && renderNavbar()}
                <div style={{ marginLeft: token ? '220px' : '0', padding: '20px', flexGrow: 1 }}>
                    <Routes>
                        <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                        <Route path="/gestion-presences" element={<PrivateRoute><GestionPresences /></PrivateRoute>} />
                        <Route path="/gestion-documents" element={<PrivateRoute><GestionDocuments /></PrivateRoute>} />
                        <Route path="/demandes" element={<PrivateRoute><Demandes /></PrivateRoute>} />
                        <Route path="/gestion-demandes" element={<PrivateRoute><GestionDemandes /></PrivateRoute>} /> 
                        <Route path="/gestion-employes" element={<PrivateRoute><GestionEmployes /></PrivateRoute>} />
                        <Route path="/messagerie" element={<PrivateRoute><Messagerie currentUser={currentUser} /></PrivateRoute>} />
                        <Route path="/parametres" element={<PrivateRoute><Parametres /></PrivateRoute>} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
