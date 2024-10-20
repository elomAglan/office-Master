import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Parametres = () => {
    const [roles] = useState([
        { id: 1, nom: 'Directeur' },
        { id: 2, nom: 'Secrétaire' },
        { id: 3, nom: 'Employé' },
    ]); // Rôles par défaut
    const [users, setUsers] = useState([]); // Liste des utilisateurs
    const [selectedUser, setSelectedUser] = useState(null); // Utilisateur sélectionné
    const [selectedRole, setSelectedRole] = useState(''); // Rôle sélectionné
    const [error, setError] = useState(''); // Gestion des erreurs

    // Fonction pour récupérer les utilisateurs depuis l'API
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users');
            setUsers(response.data); // Mettre à jour la liste des utilisateurs
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            setError('Erreur lors de la récupération des utilisateurs.'); // Afficher une erreur si nécessaire
        }
    };

    // Fonction pour attribuer un rôle à un utilisateur
    const handleAssignRole = async () => {
        if (selectedUser && selectedRole) {
            try {
                const response = await axios.post('http://localhost:5000/api/assign-role', {
                    userId: selectedUser.id,
                    role: selectedRole
                });

                if (response.status === 200) {
                    // Après l'attribution, rafraîchir les utilisateurs depuis l'API
                    await fetchUsers();
                    setSelectedUser(null);
                    setSelectedRole('');
                    setError(''); // Réinitialiser les erreurs
                }
            } catch (error) {
                console.error('Erreur lors de l\'attribution du rôle:', error);
                setError('Erreur lors de l\'attribution du rôle.');
            }
        } else {
            setError('Veuillez sélectionner un utilisateur et un rôle.');
        }
    };

    // Utiliser useEffect pour charger les utilisateurs lors du chargement du composant
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Paramètres</h1>

            {/* Afficher les erreurs */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Gestion des rôles */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Gestion des Rôles</h2>
                <ul className="list-disc pl-5 mb-4">
                    {roles.map((role) => (
                        <li key={role.id} className="text-gray-800">{role.nom}</li>
                    ))}
                </ul>
            </div>

            {/* Attribuer un rôle à un utilisateur */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Attribuer un rôle</h2>
                <div className="flex flex-col md:flex-row items-center mb-4">
                    <select
                        onChange={(e) => setSelectedUser(users.find(user => user.id === parseInt(e.target.value)))}
                        className="border border-gray-300 rounded p-3 w-full md:w-1/2 mb-4 md:mb-0 md:mr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
                    >
                        <option value="">Sélectionnez un utilisateur</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.email} (Actuel: {user.role ? user.role : 'Aucun rôle'})
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="border border-gray-300 rounded p-3 w-full md:w-1/3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
                    >
                        <option value="">Sélectionnez un rôle</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.nom}>{role.nom}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleAssignRole}
                    className="bg-green-500 text-white rounded-lg p-3 w-full hover:bg-green-600 transition duration-300"
                >
                    Attribuer
                </button>
            </div>

            {/* Liste des utilisateurs */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Liste des Utilisateurs</h2>
                <ul className="space-y-4">
                    {users.map(user => (
                        <li key={user.id} className="p-4 bg-gray-100 rounded-lg shadow-md">
                            <span className="block font-semibold">{user.email}</span>
                            <span className="block text-gray-600">Rôle: <strong>{user.role ? user.role : 'Aucun rôle'}</strong></span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Parametres;
