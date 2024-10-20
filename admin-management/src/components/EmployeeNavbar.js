import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';

const EmployeeNavbar = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

    // Met à jour le lien actif lorsque l'utilisateur change de route
    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location.pathname]);

    return (
        <nav style={{ 
            width: '200px', 
            padding: '20px', 
            backgroundColor: '#f5f5f5', 
            height: '100vh', 
            boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            overflowY: 'auto' 
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <i className="fa fa-user" style={{ fontSize: '24px', marginRight: '10px', color: '#007BFF' }}></i>
                <h2 style={{ margin: 0, color: '#007BFF' }}>Employé</h2>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li style={{ marginBottom: '20px' }}>
                    <Link 
                        to="/messagerie" 
                        className={`nav-button ${activeLink === '/messagerie' ? 'active' : ''}`}
                    >
                        <i className="fa fa-envelope" style={{ marginRight: '10px' }}></i>
                        Messagerie
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
                    <Link 
                        to="/demandes" 
                        className={`nav-button ${activeLink === '/demandes' ? 'active' : ''}`}
                    >
                        <i className="fa fa-paper-plane" style={{ marginRight: '10px' }}></i>
                        Demandes
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default EmployeeNavbar;
