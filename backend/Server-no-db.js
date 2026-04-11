// backend/server-no-db.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Créer dossier uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Uploads directory created:', uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// ====================
// DONNÉES MOCK (FAUSSES)
// ====================
const mockUsers = [
  { id: 1, email: 'admin@educours.com', password: 'admin123', role: 'admin', name: 'Administrateur' },
  { id: 2, email: 'prof@educours.com', password: 'prof123', role: 'teacher', name: 'Professeur Test' },
  { id: 3, email: 'etudiant@educours.com', password: 'etudiant123', role: 'student', name: 'Étudiant Test' }
];

const mockCourses = [
  { id: 1, title: 'Mathématiques Avancées', description: 'Cours de mathématiques pour débutants', price: 49.99, teacherId: 2 },
  { id: 2, title: 'Programmation JavaScript', description: 'Apprenez JavaScript moderne', price: 39.99, teacherId: 2 },
  { id: 3, title: 'Design UI/UX', description: 'Cours complet de design', price: 59.99, teacherId: 2 }
];

// ====================
// ROUTES MOCK
// ====================

// Route test
app.get('/', (req, res) => {
  res.json({
    message: '✅ EduCours API (Mock Mode)',
    status: 'running',
    database: 'mock (no MongoDB)',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: 'POST /api/auth/login',
      users: 'GET /api/users',
      courses: 'GET /api/courses',
      health: 'GET /health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'EduCours API is running (MOCK MODE)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'mock_data'
  });
});

// ====================
// AUTHENTIFICATION
// ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Token JWT mock (juste pour test)
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      token: mockToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Email ou mot de passe incorrect'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role = 'student' } = req.body;
  
  // Vérifier si l'utilisateur existe déjà
  if (mockUsers.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'Un utilisateur avec cet email existe déjà'
    });
  }
  
  const newUser = {
    id: mockUsers.length + 1,
    email,
    password, // En réalité, il faudrait hasher
    name,
    role,
    createdAt: new Date()
  };
  
  mockUsers.push(newUser);
  
  const mockToken = `mock-jwt-token-${newUser.id}-${Date.now()}`;
  
  res.json({
    success: true,
    message: 'Inscription réussie',
    token: mockToken,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }
  });
});

// ====================
// ROUTES PROTÉGÉES (avec vérification token)
// ====================

// Middleware mock pour vérifier le token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token manquant'
    });
  }
  
  // Token mock simple vérification
  if (token.startsWith('mock-jwt-token-')) {
    req.userId = parseInt(token.split('-')[3]) || 1;
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Routes utilisateurs
app.get('/api/users', verifyToken, (req, res) => {
  const usersWithoutPasswords = mockUsers.map(({ password, ...user }) => user);
  res.json({
    success: true,
    data: usersWithoutPasswords,
    count: usersWithoutPasswords.length
  });
});

app.get('/api/users/profile', verifyToken, (req, res) => {
  const user = mockUsers.find(u => u.id === req.userId);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé'
    });
  }
});

// Routes cours
app.get('/api/courses', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: mockCourses,
    count: mockCourses.length
  });
});

app.get('/api/courses/:id', verifyToken, (req, res) => {
  const course = mockCourses.find(c => c.id === parseInt(req.params.id));
  if (course) {
    res.json({
      success: true,
      data: course
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Cours non trouvé'
    });
  }
});

// ====================
// AUTRES ROUTES MOCK
// ====================
app.get('/api/teachers', verifyToken, (req, res) => {
  const teachers = mockUsers.filter(u => u.role === 'teacher');
  res.json({
    success: true,
    data: teachers.map(({ password, ...t }) => t)
  });
});

app.get('/api/students', verifyToken, (req, res) => {
  const students = mockUsers.filter(u => u.role === 'student');
  res.json({
    success: true,
    data: students.map(({ password, ...s }) => s)
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// ====================
// DÉMARRAGE SERVEUR
// ====================
const PORT = process.env.MOCK_PORT || 5002;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ===========================================`);
  console.log(`🚀 EduCours API (MOCK MODE)`);
  console.log(`🚀 ===========================================`);
  console.log(`✅ Port: ${PORT}`);
  console.log(`✅ URL: http://localhost:${PORT}`);
  console.log(`📊 Base de données: MOCK (sans MongoDB)`);
  console.log(`\n📝 Comptes de test:`);
  console.log(`   👨‍💼 Admin: admin@educours.com / admin123`);
  console.log(`   👨‍🏫 Prof: prof@educours.com / prof123`);
  console.log(`   👨‍🎓 Étudiant: etudiant@educours.com / etudiant123`);
  console.log(`\n🔗 Testez: http://localhost:${PORT}/health`);
  console.log(`============================================\n`);
});