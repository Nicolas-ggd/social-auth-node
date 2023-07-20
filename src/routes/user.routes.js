const express = require('express')
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/find-by-email', userController.findUser);

module.exports = router;