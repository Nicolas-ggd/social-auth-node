const express = require('express');
const router = express.Router();
const logoutController = require('../controllers/logout.controller');

router.post('/', logoutController.userLogout);

module.exports = router;