import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GestionReunions = () => {
    const [motif, setMotif] = useState('');
    const [date, setDate] = useState('');
    const [heure, setHeure] = useState('');
    const [lieu, setLieu] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [reunions, setReunions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [employes, setEmployes] = useState([]);

    // Fetch data for reunions and employees
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch reunions and employees data concurrently
                const [reunionsResponse, employesResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/reunions'),
                    axios.get('http://localhost:5000/api/employes'),
                ]);
                // Set fetched data in state
                setReunions(reunionsResponse.data);
                setEmployes(employesResponse.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                setErrorMessage('Erreur lors de la récupération des données');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array to run this only once when component mounts

    // Handle participant selection
    const handleParticipantChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedParticipants(value);
    };

    const handleSelectAll = () => {
        setSelectedParticipants(
            selectedParticipants.length === employes.length ? [] : employes.map(employe => employe.email)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        const newReunion = { motif, date, heure, lieu, participants: selectedParticipants };

        try {
            // Post new reunion
            const response = await axios.post('http://localhost:5000/api/reunions', newReunion);
            setReunions([...reunions, response.data]);

            // Envoyer des emails aux participants avec Brevo
            const emailData = {
                sender: { email: 'orguezyb@gmail.com' },  // L'email de l'expéditeur
                to: selectedParticipants.map(email => ({ email })),
                subject: `Invitation à une réunion: ${motif}`,
                htmlContent: `
                    <p>Bonjour,</p>
                    <p>Vous êtes invité à une réunion.</p>
                    <p><strong>Motif :</strong> ${motif}</p>
                    <p><strong>Date :</strong> ${date}</p>
                    <p><strong>Heure :</strong> ${heure}</p>
                    <p><strong>Lieu :</strong> ${lieu}</p>
                    <p>Cordialement,</p>
                    <p>Le Directeur</p>
                `,
            };

            const brevoResponse = await axios.post(
                'https://api.brevo.com/v3/smtp/email', // URL de l'API Brevo
                emailData,
                {
                    headers: {
                        'api-key': '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', // Remplacez par votre clé API Brevo
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (brevoResponse.status === 201) {
                setSuccessMessage('Réunion créée et email envoyé avec succès !');
            } else {
                throw new Error('Erreur lors de l\'envoi de l\'email.');
            }

        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Erreur inconnue');
            console.error('Erreur lors de la création de la réunion ou de l\'envoi de l\'email:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Gestion des Réunions</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <input 
                        type="text" 
                        placeholder="Motif de la réunion" 
                        value={motif} 
                        onChange={(e) => setMotif(e.target.value)} 
                        required 
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        required 
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <input 
                        type="time" 
                        value={heure} 
                        onChange={(e) => setHeure(e.target.value)} 
                        required 
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                        type="text" 
                        placeholder="Lieu de la réunion" 
                        value={lieu} 
                        onChange={(e) => setLieu(e.target.value)} 
                        required 
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Participant selection */}
                <div className="space-y-2">
                    <button 
                        type="button" 
                        onClick={handleSelectAll} 
                        className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {selectedParticipants.length === employes.length ? 'Désélectionner Tout' : 'Sélectionner Tout'}
                    </button>
                    <select 
                        multiple 
                        value={selectedParticipants} 
                        onChange={handleParticipantChange} 
                        className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {employes.map(employe => (
                            <option key={employe.id} value={employe.email}>
                                {employe.nom} {employe.prenom} ({employe.email})
                            </option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Création en cours...' : 'Créer la Réunion'}
                </button>
            </form>

            {/* Success/Error messages */}
            {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
            {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}

            {/* Existing reunions */}
            <h2 className="text-xl font-semibold text-gray-800 mt-10">Réunions existantes</h2>
            <ul className="mt-4 space-y-4">
                {reunions.map(reunion => (
                    <li key={reunion.id} className="p-4 border border-gray-300 rounded-lg">
                        <p><strong>Motif :</strong> {reunion.motif}</p>
                        <p><strong>Date :</strong> {reunion.date} à {reunion.heure}</p>
                        <p><strong>Lieu :</strong> {reunion.lieu}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GestionReunions;
