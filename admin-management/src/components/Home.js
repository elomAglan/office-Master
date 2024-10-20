import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; // Assurez-vous que vous avez installé Chart.js et react-chartjs-2
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({ totalEmployees: 0, pendingRequests: 0, unreadMessages: 0 });
    const [pendingRequestsList, setPendingRequestsList] = useState([]); // État pour stocker la liste des demandes en cours

    // Récupérer les données du tableau de bord
    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/dashboard');
            setStats(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des données du tableau de bord:', err);
        }
    };

    // Récupérer la liste des demandes en cours
    const fetchPendingRequests = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/demandes/pending');
            setPendingRequestsList(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des demandes pending:', err);
        }
    };

    useEffect(() => {
        fetchDashboardData();  // Récupérer les statistiques
        fetchPendingRequests(); // Récupérer les demandes en cours
    }, []);

    // Données pour le graphique
    const chartData = {
        labels: ['Employés', 'Demandes en Cours', 'Messages Non Lus'],
        datasets: [
            {
                label: 'Statistiques',
                data: [stats.totalEmployees, stats.pendingRequests, stats.unreadMessages],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)', // Couleur pour le total des employés
                    'rgba(255, 206, 86, 0.6)', // Couleur pour les demandes en cours
                    'rgba(75, 192, 192, 0.6)', // Couleur pour les messages non lus
                ],
            },
        ],
    };

    return (
        <div className="p-5 bg-gray-50 rounded shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Tableau de Bord</h1>

            {/* Graphique des statistiques */}
            <div className="bg-white p-4 rounded shadow mb-6" style={{ height: '300px' }}>
                <h2 className="font-semibold text-lg mb-4">Statistiques Visuelles</h2>
                <Bar
                    data={chartData}
                    options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Résumé des Statistiques',
                                font: {
                                    size: 18,
                                },
                            },
                        },
                    }}
                />
            </div>

            {/* Résumé des statistiques */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded shadow">
                    <h2 className="font-semibold">Total des Employés</h2>
                    <p className="text-xl font-bold">{stats.totalEmployees}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded shadow">
                    <h2 className="font-semibold">Demandes en Cours</h2>
                    <p className="text-xl font-bold">{stats.pendingRequests}</p>
                </div>
                <div className="bg-green-100 p-4 rounded shadow">
                    <h2 className="font-semibold">Messages Non Lus</h2>
                    <p className="text-xl font-bold">{stats.unreadMessages}</p>
                </div>
            </div>

            {/* Liste des demandes en cours */}
            <div className="bg-yellow-50 p-4 rounded shadow">
                <h2 className="font-semibold text-lg mb-4">Liste des Demandes en Cours</h2>
                {pendingRequestsList.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {pendingRequestsList.map((request, index) => (
                            <li key={index} className="mb-2">
                                <strong>{request.employee}</strong>: {request.type} - {request.description}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucune demande en cours.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
