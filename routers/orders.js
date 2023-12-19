const express = require("express");
const { userRegister,userLogin ,viewProducts ,placeOrder} = require("../models/Orders");
const router = express.Router();


router.post("/users/register",userRegister);
router.post("/users/login",userLogin);
router.get("/products/view",viewProducts);
router.post("/add",placeOrder);





module.exports = router;