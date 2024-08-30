const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

// Auth Routes

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.delete('/logout', authController.logout)

module.exports = router;