// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
      name: `${user.firstName} ${user.lastName}`
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
    const { firstName, lastName, email, password, role, phone, city, isEmailVerified } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = isEmailVerified ? undefined : crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      city,
      role: role || 'student',
      isEmailVerified: isEmailVerified === true,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationToken ? Date.now() + 24 * 60 * 60 * 1000 : undefined
    });

    if (!isEmailVerified) {
      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      await sendEmail({
        to: email,
        subject: 'Vérification email',
        html: `<p>Vérifiez votre email :</p><a href="${verifyUrl}">${verifyUrl}</a>`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Vérifiez votre email.',
      data: {
        token: generateToken(user),
        user
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};


// Vérifiez que vous avez bien ces impor

// La fonction login DOIT ressembler à ceci :
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // 2. Chercher l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

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
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter',
        requiresVerification: true
      });
    }

    // 5. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

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
          isVerified: user.isEmailVerified,
          isActive: user.isActive
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
   EMAIL - VERIFICATION CODE STORAGE
========================= */

// In-memory storage for verification codes (in production, use Redis)
const verificationCodes = new Map();

// Generate 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* =========================
   EMAIL
========================= */

// Send verification code via email
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email requis' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store code in memory
    verificationCodes.set(email, {
      code,
      expiresAt,
      attempts: 0
    });

    // Log the code in development for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 CODE DE VÉRIFICATION POUR ${email}`);
      console.log(`   Code: ${code}`);
      console.log(`   ⏱️  Expire dans: 15 minutes\n`);
    }

    // Send code via email
    await sendEmail({
      to: email,
      subject: 'Votre code de vérification EDUCOURS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Code de vérification</h2>
          <p>Bonjour ${firstName || 'Utilisateur'},</p>
          <p>Voici votre code de vérification:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: #4F46E5; letter-spacing: 5px; font-family: monospace;">${code}</h1>
          </div>
          <p style="color: #666; margin-top: 20px;">
            Ce code expire dans 15 minutes.
          </p>
          <p style="color: #666; font-size: 12px;">
            Si vous n'avez pas demandé ce code, ignorez cet email.
          </p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Code de vérification envoyé',
      expiresIn: 900 // 15 minutes in seconds
    });

  } catch (error) {
    console.error('Erreur sendVerificationCode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du code'
    });
  }
};

// Verify code and create account
exports.verifyCode = async (req, res) => {
  try {
    const { email, code, firstName, lastName, password, role, phone, city } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email et code requis'
      });
    }

    // Check if code exists and is not expired
    const stored = verificationCodes.get(email);
    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'Aucun code de vérification pour cet email'
      });
    }

    if (stored.expiresAt < Date.now()) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Code expiré. Veuillez en demander un nouveau'
      });
    }

    if (stored.code !== code) {
      stored.attempts += 1;
      if (stored.attempts >= 3) {
        verificationCodes.delete(email);
        return res.status(400).json({
          success: false,
          message: 'Trop de tentatives. Code supprimé. Demandez-en un nouveau'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Code incorrect (${3 - stored.attempts} tentatives restantes)`
      });
    }

    // Code is valid - create user
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      city,
      role: role || 'student',
      isEmailVerified: true, // Mark as verified since code was verified
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined
    });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Bienvenue sur EDUCOURS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Bienvenue ${firstName}!</h2>
          <p>Votre compte a été créé avec succès.</p>
          <p>Vous pouvez maintenant vous connecter à votre tableau de bord et commencer votre parcours d'apprentissage.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="
            background-color: #4F46E5; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
            margin-top: 20px;
          ">Accédez au tableau de bord</a>
        </div>
      `
    });

    // Clear the code
    verificationCodes.delete(email);

    res.status(201).json({
      success: true,
      message: 'Email vérifié. Compte créé avec succès',
      data: {
        token: generateToken(user),
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isEmailVerified
        }
      }
    });

  } catch (error) {
    console.error('Erreur verifyCode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
};

// Verify email link (for link-based verification)
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Email vérifié avec succès' 
    });
  } catch (error) {
    console.error('Erreur verifyEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà vérifié'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Vérification email - EDUCOURS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Vérifiez votre email</h2>
          <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email:</p>
          <a href="${verifyUrl}" style="
            background-color: #4F46E5; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
          ">Vérifier mon email</a>
          <p style="color: #666; margin-top: 20px;">
            Ce lien expire dans 24 heures.
          </p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Email de vérification renvoyé'
    });

  } catch (error) {
    console.error('Erreur resendVerificationEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du renvoi de l\'email'
    });
  }
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

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -emailverificationToken -resetPasswordToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ 
      success: true, 
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isEmailVerified,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
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