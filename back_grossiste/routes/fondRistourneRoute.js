const express = require("express");
const router = express.Router();

const fondRistourneController = require("../controllers/fondRistourneController");

router.get('/fonds', fondRistourneController.getFondRistourneDetails);

module.exports = router;
