// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');
const User = require('../models/User.model');
const sendEmail = require('../utils/email');
const speakeasy = require('speakeasy');

/* =========================
   HELPERS
========================= */

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/* =========================
   AUTH PUBLIC
========================= */

exports.register = async (req, res) => {
  try {
    const { name, email, passwordHash, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const Password = await bcrypt.hash(passwordHash, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      passwordHash: Password,
      role: role || 'student',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: email,
      subject: 'Vérification email',
      html: `<p>Vérifiez votre email :</p><a href="${verifyUrl}">${verifyUrl}</a>`
    });

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Vérifiez votre email.',
      token: generateToken(user),
      user
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.messag , });
  }
};


// Vérifiez que vous avez bien ces impor

// La fonction login DOIT ressembler à ceci :
exports.login = async (req, res) => {
  try {
    const { email, passwordHash } = req.body;

    // 1. Validation
    if (!email || !passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // 2. Chercher l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // 3. Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // 4. Vérifier si le compte est vérifié
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter',
        requiresVerification: true
      });
    }

    // 5. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // 6. Générer le token JWT
    const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
    );

    // 7. Mettre à jour lastLogin
    user.lastLogin = new Date();
    await user.save();

    // 8. Envoyer la réponse
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/*exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) { return res.status(401).json({ success: false, message: 'Identifiants invalides' }) }

    const valid = await bcrypt.compare(password,User.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Identifiants invalides' });

    const isPasswordValid = await bcrypt.compare(password,use.password)
    if (!isPasswordValid)  {
      return res.status(400).json({
        success: false,
        message: 'Email ou mot de pass incorrect',
        user,
      })

    }

    const token = jwt.sign(
        { userId: user._id, email: user.email},
        process.env.JWT_SECRET,
        { expiresIn: '7d'},
        user
    )



    res.json({
      success: true,
      token: generateToken(user),
      user: {
        id: user._id,
        email: user.email,
        firtsName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    console.error('erreur login:', error)
    res.status(500).json({ success: false, message: error.message });
  }
};*/



/* =========================
   OAUTH (STUB SAFE)
========================= */

exports.googleAuth = async (req, res) => {
  res.status(501).json({ success: false, message: 'Google OAuth non implémenté' });
};

// @desc    Mettre à jour l'avatar
// @route   PUT /api/auth/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    // Vérifier si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé.'
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    // Supprimer l'ancien avatar si ce n'est pas l'avatar par défaut
    if (user.avatar && !user.avatar.includes('default-avatar')) {
      const oldAvatarPath = path.join(__dirname, '..', 'public', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Mettre à jour le chemin de l'avatar
    // Le fichier est dans: public/uploads/avatars/image/filename.jpg
    // On veut stocker: /uploads/avatars/image/filename.jpg
    const avatarRelativePath = req.file.path.replace(/\\/g, '/').replace('public/', '');

    user.avatar = `/${avatarRelativePath}`;
    await user.save();

    // URL publique pour le frontend
    const avatarUrl = `${process.env.APP_URL || 'http://localhost:3000'}${user.avatar}`;

    res.status(200).json({
      success: true,
      message: 'Avatar mis à jour avec succès.',
      avatar: user.avatar,
      avatarUrl: avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        avatarUrl: avatarUrl
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour avatar:', error);

    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file && req.file.path) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'avatar.'
    });
  }
};

exports.facebookAuth = async (req, res) => {
  res.status(501).json({ success: false, message: 'Facebook OAuth non implémenté' });
};

/* =========================
   EMAIL
========================= */

exports.verifyEmail = async (req, res) => {
  const user = await User.findOne({
    emailVerificationToken: req.params.token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Token invalide ou expiré' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email vérifié' });
};

exports.resendVerificationEmail = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

/* =========================
   PASSWORD
========================= */

exports.forgotPassword = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.resetPassword = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

/* =========================
   SESSION / TOKEN
========================= */

exports.refreshToken = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Déconnecté' });
};

exports.logoutAllDevices = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.checkToken = async (req, res) => {
  res.json({ success: true, user: req.user });
};

/* =========================
   PROFILE
========================= */

exports.updateProfile = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true });
  res.json({ success: true, user });
};

exports.updateAvatar = async (req, res) => {
  res.status(501).json({ success: false, message: 'Upload avatar non implémenté' });
};

exports.changePassword = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

/* =========================
   2FA
========================= */

exports.enable2FA = async (req, res) => {
  res.status(501).json({ success: false, message: '2FA non implémenté' });
};

exports.disable2FA = async (req, res) => {
  res.status(501).json({ success: false, message: '2FA non implémenté' });
};

exports.verify2FA = async (req, res) => {
  res.status(501).json({ success: false, message: '2FA non implémenté' });
};

/* =========================
   SESSIONS & SECURITY
========================= */

exports.getSessions = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.revokeSession = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.getSecurityNotifications = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.markSecurityNotificationAsRead = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

/* =========================
   ADMIN
========================= */

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, users });
};

exports.adminUpdateUser = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.suspendUser = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.banUser = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.reactivateUser = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.getLoginLogs = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.getUserLoginLogs = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};

exports.getAuthStats = async (req, res) => {
  res.status(501).json({ success: false, message: 'Non implémenté' });
};