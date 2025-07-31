const express = require("express");
const router = express.Router();
const controller = require("../controller/sales");
const upload = require("../middleware/uploadImage");

// SALES
router.post("/products_sales", controller.productsSales);
router.post("/salesproductbarcode", controller.salesProductbarcode);
router.post("/inputsales", controller.inputSales);

//ORDER
router.post("/order", controller.order);
router.post("/ordercount", controller.orderCount);
router.post("/getheaderpesanan", controller.getHeaderpesanan);
router.post("/refund", controller.refund);
router.post("/getsizeretur", controller.getSizeretur);
router.post("/retur", controller.retur);
router.post("/returluar", controller.returLuar);
router.post("/deletepesanan", controller.deletePesanan);
router.post("/updatepesanan", controller.updatePesanan);
router.post("/gudangretur", controller.gudangretur);
router.post("/cekbarcode", controller.cekbarcode);


module.exports = router;