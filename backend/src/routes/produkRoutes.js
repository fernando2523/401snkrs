const express = require("express");
const router = express.Router();
const controller = require("../controller/produk");
const upload = require("../middleware/uploadImage");

// PRODUCT
router.post("/getproduk", controller.getProduk);
router.post("/getnamaware", controller.getNamaware);
router.post("/addproduk", upload.single("file"), controller.addProduk);
router.post("/editproduk", upload.single("file"), controller.editProduk);
router.post("/deleteproduk", controller.deleteProduk);
router.post("/getsizesales", controller.getSizesales);
router.post("/gethistoriposelected", controller.getHistoriposelected);
router.post("/repeatstok", controller.repeatStok);
router.post("/gethargabeliso", controller.getHargabeliso);
router.post("/gethistorisoselected", controller.getHistorisoselected);
router.post("/stockopname", controller.stockOpname);
router.post("/transferstok", controller.transferStok);
router.post("/print_stockopname", controller.print_Stockopname);
router.get("/gethistoripo", controller.getHistoripo);
router.post("/get_sizepo", controller.get_Sizepo);
router.post("/editpo", controller.editPo);
router.post("/deleteitem", controller.deleteItem);
router.post("/deletepo", controller.deletePo);
router.get("/gethistoriso", controller.getHistoriso);
router.post("/getstore_sales", controller.getStore_sales);
router.post("/getstore_dashboard", controller.getStore_dashboard);
router.post("/getstore_sales_online", controller.getStore_sales_online);
router.post("/getwarehouse_sales", controller.getWarehouse_sales);
router.post("/getwarehouse_sales_online", controller.getWarehouse_sales_online);
router.post("/getarehousebarcode", controller.getWarehousebarcode);


// data po
router.post("/getpo", controller.getPo);
router.post("/getpotransfer", controller.getPotransfer);
router.post("/getuserpo", controller.getuserpo);
router.post("/getusertransfer", controller.getusertransfer);

// data so
router.post("/getso", controller.getSo);

// data barcode
router.post("/getprodukbarcode", controller.getProdukbarcode);
router.post("/getidpo", controller.getIdpo);
router.post("/getsizebarcode", controller.getSizebarcode);

// mutasi stok
router.post("/getmutation", controller.getMutation);
router.post("/settlement_stock", controller.settlementStock);

// asset
router.post("/get_asset", controller.get_Asset);
router.post("/gethistoripoasset", controller.getHistoripoasset);

// retur refund
router.post("/getretur", controller.getRetur);
router.post("/getrefund", controller.getRefund);

// upprice
router.post("/get_upprice", controller.get_upprice);
router.get("/gethistoripo_transfer", controller.getHistoripotransfer);

router.post("/getprodukdisplay", controller.getProdukdisplay);
router.post("/getstoredisplay", controller.getstoredisplay);

router.post("/add_display", controller.addDisplay);
router.post("/delete_display", controller.deleteDisplay);

router.post("/cariwares", controller.cariwares);
router.post("/getwarehousetransfers", controller.getwarehousetransfer);
router.post("/cariwaresretur", controller.cariwaresretur);

router.post("/getusersales", controller.getusersales);

router.post("/getpodefect", controller.getpodefect);
router.post("/transferstokdefect", controller.transferStokdefect);
router.post("/editpo_defect", controller.editPo_defect);
router.post("/deleteitemdefect", controller.deleteItemdefect);
router.post("/get_Sizepodefect", controller.get_Sizepodefect);

router.post("/getdeleteorder", controller.getdeleteorder);
router.post("/editstockopname", controller.editstockopname);
router.post("/deleteitemso", controller.deleteitemso);
router.post("/edittransfer", controller.edittransfer);
router.post("/deleteitempo", controller.deleteitempo);

router.post("/getsizereturmodel", controller.getsizereturmodel);
router.post("/getproduktukarmodel", controller.getproduktukarmodel);
router.post("/tukermodel", controller.tukermodel);
router.post("/getreturmodel", controller.getreturmodel);
router.post("/edithargamodalsales", controller.edithargamodalsales);

router.post("/notabarang", controller.notabarang);
router.get("/getstore", controller.getstore);

module.exports = router;