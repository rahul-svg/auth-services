const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

// Auth Routes

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.delete('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.post('/verify-email', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);
// router.get('/me', authMiddleware, authController.getMe);
// router.post('/change-password', authMiddleware, authController.changePassword);


module.exports = router;