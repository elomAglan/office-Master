import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setToken, setRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            const { token, role } = response.data; // Récupération du token et du rôle de la réponse
            setToken(token);
            setRole(role); // Définit le rôle dans le state

            localStorage.setItem('token', token);
            localStorage.setItem('role', role); // Enregistrer le rôle dans le stockage local

            // Redirection en fonction du rôle de l'utilisateur
            switch (role) {
                case 'Directeur':
                    navigate('/'); // Page d'accueil pour les directeurs
                    break;
                case 'Secrétaire':
                    navigate('/gestion-employes'); // Redirige vers la page gestion employés
                    break;
                case 'Employé':
                    navigate('/messagerie'); // Redirige vers la messagerie
                    break;
                default:
                    console.error('Rôle inconnu:', role);
                    setError('Rôle inconnu. Veuillez contacter l\'administrateur.');
                    break;
            }
        } catch (error) {
            setError('Erreur lors de la connexion. Vérifiez vos identifiants.');
            console.error('Erreur lors de la connexion:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-5 max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Connexion</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500' : ''}`} 
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500' : ''}`} 
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>

            <p className="text-center mt-4">
                Je n'ai pas de compte ?{' '}
                <Link to="/register" className="text-blue-500 hover:underline">
                    Inscrivez-vous ici
                </Link>
            </p>
        </div>
    );
};

export default Login;
