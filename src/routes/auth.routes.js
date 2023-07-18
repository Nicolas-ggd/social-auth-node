const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verificationHelper = require('../utils/verificationHelper');

router.post("/", authController.userAuth);
router.post("/verify", verificationHelper.verify);

module.exports = router;