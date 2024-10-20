import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaDownload } from 'react-icons/fa';

const GestionDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Récupérer les documents depuis l'API
        const fetchDocuments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/documents');
                setDocuments(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des documents:', error);
            }
        };

        fetchDocuments();
    }, []);

    const handleAddDocument = async (e) => {
        e.preventDefault();
        if (!selectedFile || !selectedCategory) {
            setError('Veuillez sélectionner un fichier et une catégorie.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', selectedCategory);

        try {
            const response = await axios.post('http://localhost:5000/api/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setDocuments([...documents, response.data]);
            setSelectedFile(null);
            setSelectedCategory('');
            setError('');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du document:', error);
        }
    };

    const handleDeleteDocument = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/documents/${id}`);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
        }
    };

    const handleDownload = (filePath) => {
        window.open(`http://localhost:5000${filePath}`, '_blank');
    };

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterCategory ? doc.category === filterCategory : true)
    );

    return (
        <div className="p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestion des Documents</h1>

            {/* Barre de recherche */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Rechercher un document..."
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-blue-500 transition duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Sélecteur de catégorie pour filtrer */}
            <div className="mb-6">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-blue-500 transition duration-300"
                >
                    <option value="">Toutes les catégories</option>
                    <option value="Contrats">Contrats</option>
                    <option value="Factures">Factures</option>
                    <option value="Rapports">Rapports</option>
                    <option value="Demandes">Demandes</option>
                </select>
            </div>

            {/* Formulaire pour ajouter un document */}
            <form onSubmit={handleAddDocument} className="mb-8">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Fichier</label>
                    <input
                        type="file"
                        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-blue-500 transition duration-300"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Catégorie</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-blue-500 transition duration-300"
                    >
                        <option value="">Sélectionnez une catégorie</option>
                        <option value="Contrats">Contrats</option>
                        <option value="Factures">Factures</option>
                        <option value="Rapports">Rapports</option>
                        <option value="Demandes">Demandes</option>
                    </select>
                </div>
                <button type="submit" className="bg-blue-600 text-white rounded-lg p-3 w-full hover:bg-blue-700 transition duration-300">
                    Ajouter Document
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>

            {/* Liste des documents */}
            <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-800">{doc.name}</h3>
                            <p className="text-gray-600">{doc.category}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleDownload(doc.path)}
                                className="text-blue-500 hover:text-blue-700 transition duration-300"
                            >
                                <FaDownload />
                            </button>
                            <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-red-500 hover:text-red-700 transition duration-300"
                            >
                                <FaTrashAlt />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GestionDocuments;
