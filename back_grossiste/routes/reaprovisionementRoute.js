// Route: routes/refacturationRoutes.js
const express = require('express');
const router = express.Router();
const { addRefacturation ,getRefacturations,getRefacturationsPeriode} = require('../controllers/reaprovisionnementController');

router.post('/add', addRefacturation);
router.get('/getAll', getRefacturations);
// Route pour récupérer le total des refacturations selon la période
router.get('/total/:periode', getRefacturationsPeriode);
module.exports = router;