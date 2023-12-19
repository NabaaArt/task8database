const express = require("express");
const {
  adminRegister,
  adminLogin,
  viewProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  viewOrders,
  changeOrderStatus,
} = require("../models/User");
const router = express.Router();

//Dashboard API
router.post("admin/register", adminRegister);
router.post("admin/login", adminLogin);

router.get("/products/view", viewProducts);
router.post("/products/add", addProduct);
router.put("/products/update/:id", updateProduct);
router.delete("/products/delete/:id", deleteProduct);
router.get("/view", viewOrders);
router.put("/changeStatus/:id", changeOrderStatus);

module.exports = router;
