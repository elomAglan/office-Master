import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Messagerie = ({ currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');

    // Récupérer tous les messages
    const fetchMessages = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/messages');
            setMessages(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des messages:', err);
        }
    };

    // Marquer tous les messages comme lus
    const markMessagesAsRead = async () => {
        try {
            await axios.put('http://localhost:5000/api/messages/markAsRead');
        } catch (err) {
            console.error('Erreur lors de la mise à jour des messages:', err);
        }
    };

    useEffect(() => {
        fetchMessages();
        markMessagesAsRead();

        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Envoyer un message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (currentMessage.trim()) {
            const messageData = {
                sender_id: currentUser.id,
                content: currentMessage,
            };

            try {
                await axios.post('http://localhost:5000/api/messages', messageData);
                fetchMessages();
                setCurrentMessage('');
            } catch (err) {
                console.error('Erreur lors de l\'envoi du message:', err);
            }
        }
    };

    return (
        <div className="flex flex-col h-screen p-5 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center">Messagerie</h1>
            <div className="bg-white shadow-md rounded-md p-4 flex-grow mb-4 overflow-y-auto">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex items-start mb-4 ${msg.sender_id === currentUser.id ? 'justify-end' : ''}`}>
                            {msg.sender_id !== currentUser.id && (
                                <div className="text-xs font-semibold text-gray-600 mr-2">
                                    {msg.sender_name}
                                </div>
                            )}
                            <div className={`bg-${msg.sender_id === currentUser.id ? 'green' : 'blue'}-500 text-white rounded-lg p-2 inline-block shadow`}>
                                {msg.content}
                            </div>
                            <div className="text-xs text-gray-500 ml-2">{new Date(msg.time).toLocaleTimeString()}</div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center">Aucun message pour le moment.</p>
                )}
            </div>
            <form className="flex" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="border rounded p-2 flex-grow mr-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300 ease-in-out">
                    Envoyer
                </button>
            </form>
        </div>
    );
};

export default Messagerie;
