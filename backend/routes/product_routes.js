const express = require("express");
const productController = require("../controllers/product_controller");
const router = express.Router();

router.post("/search", productController.findProduct);

module.exports = router;
