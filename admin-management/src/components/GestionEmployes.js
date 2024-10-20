import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt } from 'react-icons/fa'; // Icône pour la suppression

const GestionEmployes = () => {
    const [employes, setEmployes] = useState([]);
    const [newEmploye, setNewEmploye] = useState({
        nom: '',
        prenom: '',
        departement: '',
        poste: '',
        horaire: '',
        email: ''
    });
    const [showModal, setShowModal] = useState(false); // État pour la modale

    // Récupérer la liste des employés
    useEffect(() => {
        const fetchEmployes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/employes');
                setEmployes(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des employés:', error);
            }
        };

        fetchEmployes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmploye({ ...newEmploye, [name]: value });
    };

    const handleAddEmploye = async (e) => {
        e.preventDefault();

        const { nom, prenom, departement, poste, horaire } = newEmploye;
        if (!nom || !prenom || !departement || !poste || !horaire) {
            alert('Veuillez remplir tous les champs requis (sauf l\'email).');
            return; // Ne pas soumettre si des champs requis sont vides
        }

        try {
            const response = await axios.post('http://localhost:5000/api/employes', newEmploye);
            setEmployes([...employes, response.data]);
            setNewEmploye({ nom: '', prenom: '', departement: '', poste: '', horaire: '', email: '' });
            setShowModal(false); // Cacher la modale après ajout
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'employé:', error);
        }
    };

    const handleDeleteEmploye = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/employes/${id}`);
            setEmployes(employes.filter(employe => employe.id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'employé:', error);
        }
    };

    const handleCloseModal = (e) => {
        if (e.target.id === "modal-overlay") {
            setShowModal(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-blue-700 text-center">Gestion des Employés</h1>

            {/* Bouton pour afficher la modale */}
            <div className="text-center mb-6">
                <button
                    onClick={() => setShowModal(true)} // Afficher la modale
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-md transition duration-300 ease-in-out"
                >
                    Ajouter un employé
                </button>
            </div>

            {/* Modale d'ajout d'employé */}
            {showModal && (
                <div 
                    id="modal-overlay" 
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50" 
                    onClick={handleCloseModal}
                >
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Ajouter un employé</h2>
                        <form onSubmit={handleAddEmploye}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="nom">Nom</label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={newEmploye.nom}
                                        onChange={handleInputChange}
                                        placeholder="Nom"
                                        className="shadow-md appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="prenom">Prénom</label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={newEmploye.prenom}
                                        onChange={handleInputChange}
                                        placeholder="Prénom"
                                        className="shadow-md appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="departement">Département</label>
                                    <input
                                        type="text"
                                        name="departement"
                                        value={newEmploye.departement}
                                        onChange={handleInputChange}
                                        placeholder="Département"
                                        className="shadow-md appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="poste">Poste</label>
                                    <input
                                        type="text"
                                        name="poste"
                                        value={newEmploye.poste}
                                        onChange={handleInputChange}
                                        placeholder="Poste"
                                        className="shadow-md appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="horaire">Horaire</label>
                                    <input
                                        type="text"
                                        name="horaire"
                                        value={newEmploye.horaire}
                                        onChange={handleInputChange}
                                        placeholder="Horaire"
                                        className="shadow-md appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newEmploye.email}
                                        onChange={handleInputChange}
                                        placeholder="Email (optionnel)"
                                        className="shadow-md appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
                            >
                                Ajouter l'employé
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Liste des employés */}
            <div className="max-w-6xl mx-auto mt-8">
                <h2 className="text-3xl font-semibold mb-4 text-blue-600">Liste des Employés</h2>
                <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Nom</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Prénom</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Département</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Poste</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Horaire</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Email</th>
                            <th className="py-3 px-4"></th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {employes.map((employe) => (
                            <tr key={employe.id} className="hover:bg-gray-100 transition duration-150 ease-in-out">
                                <td className="py-3 px-4">{employe.nom}</td>
                                <td className="py-3 px-4">{employe.prenom}</td>
                                <td className="py-3 px-4">{employe.departement}</td>
                                <td className="py-3 px-4">{employe.poste}</td>
                                <td className="py-3 px-4">{employe.horaire}</td>
                                <td className="py-3 px-4">{employe.email}</td>
                                <td className="py-3 px-4">
                                    <button onClick={() => handleDeleteEmploye(employe.id)}>
                                        <FaTrashAlt className="text-red-600 hover:text-red-800" />
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

export default GestionEmployes;
