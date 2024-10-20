// Importer les dépendances
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Pour gérer l'upload de fichiers
const fs = require('fs'); // Pour manipuler les fichiers
const path = require('path');
require('dotenv').config(); // Charger les variables d'environnement depuis le fichier .env
const router = express.Router();

const app = express();
const port = 5000; // Vous pouvez choisir le port que vous voulez

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Rendre les fichiers accessibles publiquement

// Connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admin_management'
});

// Vérifier la connexion à la base de données
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

// Vérifier si la clé secrète est définie
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('La clé secrète JWT n\'est pas définie. Veuillez définir JWT_SECRET dans le fichier .env.');
    process.exit(1);
}

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Conserver le nom d'origine du fichier
    }
});
const upload = multer({ storage });

// Gestion des documents

// Route pour ajouter un document
app.post('/api/documents', upload.single('file'), (req, res) => {
    console.log('Requête de création de document reçue');
    console.log('Corps de la requête:', req.body);
    console.log('Fichier reçu:', req.file);

    const { category } = req.body;

    // Vérifiez si le fichier a été téléchargé
    if (!req.file) {
        console.error('Aucun fichier téléchargé.');
        return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
    }

    const fileName = req.file.originalname; // Utiliser le nom d'origine
    const filePath = `/uploads/${fileName}`;
    console.log(`Nom du fichier: ${fileName}, Chemin: ${filePath}`);

    const sql = 'INSERT INTO documents (name, category, path) VALUES (?, ?, ?)';
    db.query(sql, [fileName, category, filePath], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion dans la base de données:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Document ajouté avec succès, ID:', result.insertId);
        res.json({ id: result.insertId, name: fileName, category, path: filePath });
    });
});

// Route pour récupérer tous les documents
app.get('/api/documents', (req, res) => {
    const sql = 'SELECT * FROM documents';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des documents:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Route pour supprimer un document
app.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;

    // D'abord, récupérer le chemin du fichier dans la base de données pour le supprimer du serveur
    db.query('SELECT path FROM documents WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
            console.error('Document non trouvé avec l\'ID:', id);
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        const filePath = results[0].path;
        console.log(`Suppression du fichier à ce chemin: ${filePath}`);

        // Supprimer le fichier du serveur
        fs.unlink(`.${filePath}`, (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier:', err);
                return res.status(500).json({ message: 'Erreur lors de la suppression du fichier' });
            }

            // Supprimer l'entrée de la base de données
            db.query('DELETE FROM documents WHERE id = ?', [id], (err) => {
                if (err) {
                    console.error('Erreur lors de la suppression dans la base de données:', err);
                    return res.status(500).json({ error: err.message });
                }
                console.log('Document supprimé avec succès');
                res.status(204).send(); // No content
            });
        });
    });
});

// Route pour ajouter une demande
app.post('/api/demandes', upload.single('file'), (req, res) => {
    const { employee, type, description } = req.body;

    // Validation des données
    if (!employee || !type || !description) {
        return res.status(400).json({ error: 'Tous les champs (employee, type, description) sont requis.' });
    }

    let filePath = null;
    if (req.file) {
        const path = require('path');
        filePath = path.join('uploads', req.file.filename);
    }

    // Insérer la nouvelle demande
    const sqlInsert = 'INSERT INTO demandes (employee, type, description, file_path) VALUES (?, ?, ?, ?)';
    
    db.query(sqlInsert, [employee, type, description, filePath], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion dans la base de données:', err);
            return res.status(500).json({ error: 'Erreur lors de l\'insertion dans la base de données.' });
        }

        // Une fois la demande ajoutée, récupérer le nom de l'employé
        const sqlGetEmployee = 'SELECT nom FROM employes WHERE id = ?';
        
        db.query(sqlGetEmployee, [employee], (err, employeeResult) => {
            if (err) {
                console.error('Erreur lors de la récupération du nom de l\'employé:', err);
                return res.status(500).json({ error: 'Erreur lors de la récupération du nom de l\'employé.' });
            }

            if (employeeResult.length === 0) {
                return res.status(404).json({ error: 'Employé non trouvé.' });
            }

            const employeeName = employeeResult[0].nom;  // Utiliser "nom" comme sélectionné dans la requête SQL
            res.status(201).json({
                id: result.insertId,
                employee: employeeName,  // Retourne le nom de l'employé
                type,
                description,
                file_path: filePath
            });
        });
    });
});



// Route pour récupérer les demandes avec le nom et l'email de l'employé
app.get('/api/demandes', (req, res) => {
    const sqlGetDemandes = `
        SELECT d.id, e.nom, e.prenom, e.email, d.type, d.description, d.status, d.file_path, d.employee AS employeeId
        FROM demandes d
        JOIN employes e ON d.employee = e.id
    `;

    db.query(sqlGetDemandes, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des demandes:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des demandes.' });
        }

        res.status(200).json(result);
    });
});







// Route pour mettre à jour le statut d'une demande
app.patch('/api/demandes/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const sql = 'UPDATE demandes SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
        }
        res.json({ message: 'Statut mis à jour avec succès.' });
    });
});


// Récupérer tous les employés
app.get('/api/employes', (req, res) => {
    db.query('SELECT * FROM employes', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des employés:', err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});

// Ajouter un nouvel employé
app.post('/api/employes', (req, res) => {
    const { nom, prenom, departement, poste, horaire, email } = req.body;
    db.query('INSERT INTO employes (nom, prenom, departement, poste, horaire, email) VALUES (?, ?, ?, ?, ?, ?)', 
        [nom, prenom, departement, poste, horaire, email], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'ajout d\'un employé:', err);
                return res.status(500).json({ error: err });
            }
            console.log('Employé ajouté avec succès, ID:', result.insertId);
            res.status(201).json({ id: result.insertId, nom, prenom, departement, poste, horaire, email });
    });
});

// Supprimer un employé
app.delete('/api/employes/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM employes WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Erreur lors de la suppression de l\'employé:', err);
            return res.status(500).json({ error: err });
        }
        console.log('Employé supprimé avec succès, ID:', id);
        res.status(204).send(); // No content
    });
});

// Récupérer tous les messages
app.get('/api/messages', (req, res) => {
    const query = `
        SELECT m.*, e.nom AS sender_name
        FROM messages m
        LEFT JOIN employes e ON m.sender_id = e.id
        ORDER BY m.time ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des messages:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
        }
        res.json(results);
    });
});



// Route pour récupérer les statistiques du tableau de bord
app.get('/api/dashboard', (req, res) => {
    // Requêtes SQL pour récupérer les statistiques
    const queries = {
        totalEmployees: 'SELECT COUNT(*) AS total FROM employes',
        pendingRequests: 'SELECT COUNT(*) AS total FROM demandes WHERE status = "pending"',
        unreadMessages: 'SELECT COUNT(*) AS total FROM messages WHERE read_status = 0' // Remplacez read_status par votre colonne si nécessaire
    };

    // Récupérer les données en parallèle
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(queries.totalEmployees, (err, results) => {
                if (err) return reject(err);
                resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.pendingRequests, (err, results) => {
                if (err) return reject(err);
                resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.unreadMessages, (err, results) => {
                if (err) return reject(err);
                resolve(results[0].total);
            });
        })
    ])
    .then(([totalEmployees, pendingRequests, unreadMessages]) => {
        res.json({
            totalEmployees,
            pendingRequests,
            unreadMessages
        });
    })
    .catch(err => {
        console.error('Erreur lors de la récupération des données du tableau de bord:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    });
});

// Route pour récupérer les demandes avec le statut "pending"
app.get('/api/demandes/pending', (req, res) => {
    const query = `
        SELECT demandes.id, demandes.type, demandes.description, employes.nom AS employee
        FROM demandes
        JOIN employes ON demandes.employee = employes.id
        WHERE demandes.status = "pending"
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des demandes pending:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des demandes pending' });
        }
        res.json(results); // Retourner les demandes "pending" avec le nom de l'employé
    });
});






// Envoyer un message
app.post('/api/messages', (req, res) => {
    const { sender_id, content } = req.body;

    if (!sender_id || !content) {
        return res.status(400).json({ error: 'Le sender_id et le contenu du message sont requis' });
    }

    const query = 'INSERT INTO messages (sender_id, receiver_id, content, time) VALUES (?, ?, ?, NOW())';
    db.query(query, [sender_id, null, content], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'envoi du message:', err);
            return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
        }
        res.status(201).json({ message: 'Message envoyé avec succès', messageId: result.insertId });
    });
});

app.put('/api/messages/markAsRead', (req, res) => {
    const updateQuery = 'UPDATE messages SET read_status = 1 WHERE read_status = 0'; // Met à jour tous les messages non lus

    db.query(updateQuery, (err, results) => {
        if (err) {
            console.error('Erreur lors de la mise à jour des messages:', err);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour des messages' });
        }
        res.json({ message: 'Messages marqués comme lus avec succès' });
    });
});




// Récupérer les utilisateurs avec leurs rôles
app.get('/api/users', (req, res) => {
    const query = 'SELECT id, email, role FROM users'; 
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des utilisateurs:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results); // Renvoie la liste des utilisateurs
    });
});


// Attribuer un rôle à un utilisateur (comme tu l'as déjà)
app.post('/api/assign-role', (req, res) => {
    const { userId, role } = req.body;
    const query = 'UPDATE users SET role = ? WHERE id = ?';

    db.query(query, [role, userId], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'attribution du rôle:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ message: 'Rôle attribué avec succès' });
    });
});


// Inscription
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    // Vérification de l'email
    if (!email || !password) {
        console.error('Email et mot de passe sont requis.');
        return res.status(400).json({ error: 'Email et mot de passe sont requis.' });
    }

    // Vérification si l'email existe déjà
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'email:', err);
            return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email.' });
        }
        if (results.length > 0) {
            console.error('Email déjà utilisé.');
            return res.status(400).json({ error: 'Email déjà utilisé.' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
                return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur.' });
            }
            console.log('Utilisateur inscrit avec succès, ID:', result.insertId);
            res.status(201).json({ id: result.insertId, email });
        });
    });
});

// Connexion

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Vérification de l'email et du mot de passe
    if (!email || !password) {
        console.error('Email et mot de passe sont requis.');
        return res.status(400).json({ error: 'Email et mot de passe sont requis.' });
    }

    // Recherche de l'utilisateur par email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Erreur lors de la recherche de l\'utilisateur:', err);
            return res.status(500).json({ error: 'Erreur lors de la recherche de l\'utilisateur.' });
        }

        // Vérification si l'utilisateur existe
        if (results.length === 0) {
            console.error('Email ou mot de passe incorrect.');
            return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
        }

        const user = results[0];

        // Vérification du mot de passe
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.error('Email ou mot de passe incorrect.');
            return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
        }

        // Vérification du rôle de l'utilisateur
        if (!['Directeur', 'Secrétaire', 'Employé'].includes(user.role)) {
            console.error('Rôle invalide.');
            return res.status(403).json({ error: 'Rôle invalide. Accès refusé.' });
        }

        // Génération du token JWT
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Utilisateur connecté avec succès, ID:', user.id);

        // Réponse avec les informations de l'utilisateur et le token
        res.status(200).json({ id: user.id, email: user.email, role: user.role, token });
    });
});



// Fonctionnalité de gestion des réunions
app.post('/api/reunions', (req, res) => {
    const { motif, date, heure, lieu, participants } = req.body;

    // Validation des données
    if (!motif || !date || !heure || !lieu || !participants || participants.length === 0) {
        return res.status(400).json({ error: 'Tous les champs (motif, date, heure, lieu, participants) sont requis.' });
    }

    // Insertion dans la table reunions
    const sqlReunion = 'INSERT INTO reunions (motif, date, heure, lieu) VALUES (?, ?, ?, ?)';
    
    db.query(sqlReunion, [motif, date, heure, lieu], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion de la réunion dans la base de données:', err);
            return res.status(500).json({ error: 'Erreur lors de la création de la réunion.' });
        }

        const reunionId = result.insertId;

        // Insertion des participants dans la table reunion_participants
        const sqlParticipants = 'INSERT INTO reunion_participants (reunion_id, participant_email) VALUES ?';
        const participantsValues = participants.map(email => [reunionId, email]);

        db.query(sqlParticipants, [participantsValues], (err, resultParticipants) => {
            if (err) {
                console.error('Erreur lors de l\'insertion des participants dans la base de données:', err);
                return res.status(500).json({ error: 'Erreur lors de l\'ajout des participants.' });
            }

            res.json({ id: reunionId, motif, date, heure, lieu, participants });

            // Envoi d'un email aux participants
            console.log(`Email envoyé aux participants: ${participants}`);
        });
    });
});

// Récupérer toutes les réunions avec participants
app.get('/api/reunions', (req, res) => {
    const sql = `
        SELECT r.*, GROUP_CONCAT(p.participant_email) AS participants
        FROM reunions r
        LEFT JOIN reunion_participants p ON r.id = p.reunion_id
        GROUP BY r.id
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des réunions:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des réunions.' });
        }
        res.json(results);
    });
});


// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
