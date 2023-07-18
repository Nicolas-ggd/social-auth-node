const express = require('express');
const router = express.Router();
const resetPasswordController = require('../controllers/resetPassword.controller');

router.post("/", resetPasswordController.resetUserPassword);
router.post("/user-token", resetPasswordController.findUserWithToken);

module.exports = router;