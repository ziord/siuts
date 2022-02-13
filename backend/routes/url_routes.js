const express = require("express");
const urlController = require("../controllers/url_controller");
const router = express.Router();

router.post("/shorten", urlController.validateBody, urlController.shortenUrl);

router.post("/resolve", urlController.validateAlias, urlController.resolveUrl);

module.exports = router;
