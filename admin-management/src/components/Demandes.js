import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Demandes = () => {
    const [formData, setFormData] = useState({
        employee: '',
        type: '',
        description: '',
        file: null,
    });

    const [employees, setEmployees] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/employes');
                setEmployees(response.data);
            } catch (error) {
                setErrorMessage('Erreur lors de la récupération des employés.');
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        setLoading(true);

        if (!formData.employee || !formData.type || !formData.description) {
            setErrorMessage('Veuillez remplir tous les champs obligatoires.');
            setLoading(false);
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('employee', formData.employee);
        formDataToSend.append('type', formData.type);
        formDataToSend.append('description', formData.description);
        if (formData.file) {
            formDataToSend.append('file', formData.file);
        }

        try {
            const response = await axios.post('http://localhost:5000/api/demandes', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccessMessage('Votre demande a été soumise avec succès !');
            setFormData({ employee: '', type: '', description: '', file: null });
        } catch (error) {
            setErrorMessage('Erreur lors de la soumission de votre demande.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-gray-50 shadow-md rounded-lg">
            <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">Soumettre une Demande</h1>
            {successMessage && <p className="text-green-600 mb-6">{successMessage}</p>}
            {errorMessage && <p className="text-red-600 mb-6">{errorMessage}</p>}
            {loadingEmployees ? (
                <p>Chargement des employés...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="employee" className="block text-lg font-medium text-gray-700 mb-2">Employé :</label>
                        <select
                            id="employee"
                            name="employee"
                            value={formData.employee}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Sélectionnez un employé</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-lg font-medium text-gray-700 mb-2">Type de demande :</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Sélectionnez un type</option>
                            <option value="congé">Congé</option>
                            <option value="absence">Absence</option>
                            <option value="réclamation">Réclamation</option>
                            <option value="heures supplémentaires">Heures Supplémentaires</option>
                            <option value="recrutement">Recrutement</option>
                            <option value="stage">Stage</option>
                            <option value="démission">Démission</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">Description :</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="file" className="block text-lg font-medium text-gray-700 mb-2">Document ou image (facultatif) :</label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            onChange={handleFileChange}
                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.file && (
                            <p className="mt-2 text-gray-600">Fichier sélectionné : {formData.file.name}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`bg-blue-600 text-white rounded-lg p-4 w-full hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Envoi en cours...' : 'Soumettre la Demande'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Demandes;
