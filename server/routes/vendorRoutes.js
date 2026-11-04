const express = require('express');
const router = express.Router();
const { getVendors } = require('../controllers/solarController');

router.get('/', getVendors);

module.exports = router;
