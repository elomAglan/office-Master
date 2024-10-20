// models/Demande.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assurez-vous que ce chemin est correct

const Demande = sequelize.define('Demande', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    employee: {
        type: DataTypes.INTEGER, // Supposons que vous stockez l'ID de l'employé
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending', // Statut par défaut
    }
}, {
    timestamps: false, // Si vous n'utilisez pas les timestamps créés automatiquement
});

// Exporte le modèle
module.exports = Demande;
