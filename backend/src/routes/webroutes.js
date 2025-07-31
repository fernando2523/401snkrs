const express = require("express");
const router = express.Router();

const controller = require("../controller/dekstop");

// karyawan
router.get("/getkaryawan", controller.getKaryawan);
router.get("/getstore", controller.getStore);
router.get("/getroles", controller.getRoles);

router.post("/addkaryawan", controller.addKaryawan);
router.post("/editkaryawan", controller.editKaryawan);
router.post("/updateakun", controller.updateAkun);
router.post("/deleteakun", controller.deleteAkun);

// reseller
router.get("/getreseller", controller.getReseller);
router.post("/addreseller", controller.addReseller);
router.post("/editreseller", controller.editReseller);
router.post("/deletereseller", controller.deleteReseller);


// supplier
router.get("/getsupplier", controller.getSupplier);
router.post("/addsupplier", controller.addSupplier);
router.post("/editsupplier", controller.editSupplier);
router.post("/deletesupplier", controller.deleteSupplier);

// category
router.get("/getcategory", controller.getCategory);
router.post("/addcategory", controller.addCategory);
router.post("/editcategory", controller.editCategory);
router.post("/deletecategory", controller.deleteCategory);

// brand
router.get("/getbrand", controller.getBrand);
router.post("/addbrand", controller.addBrand);
router.post("/editbrand", controller.editBrand);
router.post("/deletebrand", controller.deleteBrand);

//store
router.get("/getstores", controller.getStores);
router.post("/addstore", controller.addStore);
router.get("/getstore_area", controller.getstore_Area);
router.post("/editstore", controller.editStore);
router.post("/deletestore", controller.deleteStore);
router.get("/getstore_warehouse", controller.getstore_Warehouse);

// warehouse
router.get("/getwarehouse", controller.getWarehouse);
router.get("/getwarehouse_product", controller.getwarehouse_product);
router.post("/getwarehousedisplayproduct", controller.getwarehousedisplayproduct);
router.post("/getwarehouseselected", controller.getWarehouseselected);
router.post("/addwarehouse", controller.addWarehouse);
router.post("/editwarehouse", controller.editWarehouse);
router.post("/deletewarehouse", controller.deleteWarehouse);

// area
router.get("/getarea", controller.getarea);
router.post("/editarea", controller.editarea);


//login
router.post("/login", controller.login);
router.post("/login_on_enter", controller.login_on_enter);

// dashboard
router.post("/getdashboard", controller.getDashboard);
router.post("/getstorekaryawan", controller.getstorekaryawan);
router.post("/getstorekaryawanedit", controller.getstorekaryawanedit);

// getstore expense
router.post("/getstoreexpense", controller.getstoreexpense);


// update password
router.post("/updatepassword", controller.updatePassword);

router.post("/getprintsales", controller.getprintsales);

router.post("/getlistbelanja", controller.getlistbelanja);
router.post("/inputlistbelanja", controller.inputlistbelanja);
router.post("/updatesupplier", controller.updatesupplier);
router.post("/updatestatus", controller.updatestatus);
router.post("/updatemprice_listbelanja", controller.updatemprice_listbelanja);
router.post("/updateacc_listbelanja", controller.updateacc_listbelanja);
router.post("/updateresi", controller.updateresi);
router.post("/deletemassal_listbelanja", controller.deletemassal_listbelanja);
router.post("/addparameter", controller.addparameter);
router.get("/getparameter", controller.getparameter);
router.post("/editparameter", controller.editparameter);
router.post("/deleteparameter", controller.deleteparameter);
router.post("/insertmassal", controller.insertmassal);

module.exports = router;
