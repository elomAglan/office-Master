// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation(); 
    const [activeLink, setActiveLink] = useState(location.pathname); 

    const handleLinkClick = (path) => {
        setActiveLink(path); 
    };

    return (
        <nav style={{ 
            width: '200px', 
            padding: '20px', 
            backgroundColor: '#f5f5f5', 
            height: '100vh', 
            boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
            position: 'fixed', // Fixe la barre de navigation
            top: 0, // Aligne en haut de la page
            left: 0, // Aligne à gauche
            overflowY: 'auto' // Permet de faire défiler si nécessaire
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <i className="fa fa-building" style={{ fontSize: '24px', marginRight: '10px', color: '#007BFF' }}></i>
                <h2 style={{ margin: 0, color: '#007BFF' }}>Office Master</h2>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li style={{ marginBottom: '20px' }}>
                    <Link 
                        to="/" 
                        className={`nav-button ${activeLink === '/' ? 'active' : ''}`}
                        onClick={() => handleLinkClick('/')}
                    >
                        <i className="fa fa-dashboard" style={{ marginRight: '10px' }}></i>
                        Accueil
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
                    <Link 
                        to="/gestion-presences" 
                        className={`nav-button ${activeLink === '/dashboard' ? 'active' : ''}`}
                        onClick={() => handleLinkClick('/dashboard')}
                    >
                        <i className="fa fa-cogs" style={{ marginRight: '10px' }}></i>
                        Reunions
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
                    <Link 
                        to="/gestion-documents" 
                        className={`nav-button ${activeLink === '/gestion-documents' ? 'active' : ''}`}
                        onClick={() => handleLinkClick('/gestion-documents')}
                    >
                        <i className="fa fa-file" style={{ marginRight: '10px' }}></i>
                        Documents
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
                    <Link 
                        to="/gestion-demandes" 
                        className={`nav-button ${activeLink === '/demandes' ? 'active' : ''}`}
                        onClick={() => handleLinkClick('/demandes')}
                    >
                        <i className="fa fa-paper-plane" style={{ marginRight: '10px' }}></i>
                        Demandes
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
                    <Link 
                        to="/messagerie" 
                        className={`nav-button ${activeLink === '/messagerie' ? 'active' : ''}`}
                        onClick={() => handleLinkClick('/messagerie')}
                    >
                        <i className="fa fa-envelope" style={{ marginRight: '10px' }}></i>
                        Messagerie
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
                    <Link 
                        to="/gestion-employes" 
                        className={`nav-button ${activeLink === '/gestion-employes' ? 'active' : ''}`}
                        onClick={() => handleLinkClick('/gestion-employes')}
                    >
                        <i className="fa fa-users" style={{ marginRight: '10px' }}></i>
                        Employés
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
    <Link 
        to="/parametres" 
        className={`nav-button ${activeLink === '/parametres' ? 'active' : ''}`}
        onClick={() => handleLinkClick('/parametres')}
    >
        <i className="fa fa-cog" style={{ marginRight: '10px' }}></i> {/* Icône pour les paramètres */}
        Paramètres
    </Link>
</li>

            </ul>
        </nav>
    );
};

export default Navbar;
