const express = require('express');
const ensureAuthenticated = require('../middlewares/auth'); // only import it
const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {
    res.status(200).json([
        { name: "mobile", price: 10000 },
        { name: "tv", price: 20000 }
    ]);
});

module.exports = router;
