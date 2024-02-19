const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const ReateController = require("../Controllers/ReateController");
router.get("/", UserController.getAllUsers); // Only Admin
router.get("/Profile/:userId", UserController.getProfile); // Only Admin
router.get("/:userId", UserController.getUser); 

router.put("/:userId", UserController.EditProfile); 
router.delete("/:userId", UserController.DeleteProfile); // both Admin and User

router.post("/Basket/:productId", UserController.add_to_Basket);
router.delete("/Basket/:productId", UserController.delete_from_Basket);
router.get("/Basket/:userId", UserController.get_Basket);

router.post("/Favorit/:productId", UserController.add_to_Favorit);
router.delete("/Favorit/:productId", UserController.delete_from_Favorit);
router.get("/Favorit/:userId", UserController.get_Favorite);

// userId through body 
router.post("/RateProduct/:productId", ReateController.RateProduct);
router.delete("/RateProduct/:userId", ReateController.Delete_RateProduct);
router.post("/CommentProduct/:userId", UserController.CommentProduct);
router.delete("/CommentProduct/:userId", UserController.Delete_CommentProduct);
router.get("/getRate/:productId", UserController.get_product_Rate);
router.get("/getComment/:productId", UserController.getComment);

router.get("/getRate/:storeId", UserController.getRate);
router.post("/RateStore/:userId", UserController.RateStore);
router.delete("/RateStore/:userId", UserController.RateStore);

router.post("/:userId/Create", UserController.CreateStore);


module.exports = router;
