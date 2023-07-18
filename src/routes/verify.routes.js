const express = require('express');
const router = express.Router();
const verificationHelper = require('../utils/verificationHelper');

router.post('/', verificationHelper.verify);
router.post('/resendVerificationCode', verificationHelper.resendVerificationCode);

module.exports = router;