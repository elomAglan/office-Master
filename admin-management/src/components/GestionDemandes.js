import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GestionDemandes = () => {
    const [demandes, setDemandes] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/demandes');
                setDemandes(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des demandes:', error);
            }
        };

        fetchDemandes();
    }, []);

    const sendEmail = async (email, status, demandeDetails) => {
        const subject = `Votre demande a été ${status}`;
        const htmlContent = `
            <p>Bonjour,</p>
            <p>Votre demande de ${demandeDetails.type} a été ${status}.</p>
            <p><strong>Description :</strong> ${demandeDetails.description}</p>
            <p>Cordialement,</p>
            <p>Le Directeur</p>
        `;

        try {
            await axios.post(
                'https://api.sendinblue.com/v3/smtp/email',
                {
                    sender: { email: 'orguezyb@gmail.com' },
                    to: [{ email }],
                    subject,
                    htmlContent,
                },
                {
                    headers: {
                        'api-key': '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',
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Email envoyé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
        }
    };

    const handleAccept = async (id, demandeDetails) => {
        setLoading(true);
        try {
            const updateRequest = axios.patch(`http://localhost:5000/api/demandes/${id}`, { status: 'accepted' });
            const email = demandeDetails.email; // Utilisation de l'email récupéré directement

            const emailRequest = sendEmail(email, 'acceptée', demandeDetails);
            await Promise.all([updateRequest, emailRequest]);

            setDemandes(demandes.filter(demande => demande.id !== id));
            setMessage('Demande acceptée et email envoyé avec succès');
            clearMessageAfterDelay();
        } catch (error) {
            console.error('Erreur lors de l\'acceptation de la demande ou de l\'envoi de l\'email:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id, demandeDetails) => {
        setLoading(true);
        try {
            const updateRequest = axios.patch(`http://localhost:5000/api/demandes/${id}`, { status: 'rejected' });
            const email = demandeDetails.email; // Utilisation de l'email récupéré directement

            const emailRequest = sendEmail(email, 'rejetée', demandeDetails);
            await Promise.all([updateRequest, emailRequest]);

            setDemandes(demandes.filter(demande => demande.id !== id));
            setMessage('Demande rejetée et email envoyé avec succès');
            clearMessageAfterDelay();
        } catch (error) {
            console.error('Erreur lors du rejet de la demande ou de l\'envoi de l\'email:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearMessageAfterDelay = () => {
        setTimeout(() => {
            setMessage(null);
        }, 3000);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des Demandes</h1>

            {message && (
                <div className="mb-4 p-4 text-white bg-green-500 rounded">
                    {message}
                </div>
            )}

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {demandes.map(demande => (
                            <tr key={demande.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{demande.nom} {demande.prenom}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{demande.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{demande.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{demande.status || 'En attente'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {demande.file_path ? (
                                        <a href={`http://localhost:5000/${demande.file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Voir Document
                                        </a>
                                    ) : (
                                        'Aucun Document'
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <button onClick={() => handleAccept(demande.id, demande)} className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 mr-2" disabled={loading}>
                                        {loading ? 'Chargement...' : 'Accepter'}
                                    </button>
                                    <button onClick={() => handleReject(demande.id, demande)} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600" disabled={loading}>
                                        {loading ? 'Chargement...' : 'Rejeter'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionDemandes;
