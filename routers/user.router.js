import express from "express";
import { verifyToken } from "../midillware/verifyToken.js";
import {
  addAddress,
  addBanner,
  AddCategories,
  addProduct,
  addToCart,
  allUsers,
  changePassword,
  createUser,
  deleteBanner,
  deleteCartProduct,
  deleteCategory,
  deletedMailByUser,
  deleteNotification,
  deleteProduct,
  fetchMailById,
  getAddress,
  getAllNotifications,
  getAllRequests,
  getBanners,
  getCartDetails,
  getCategories,
  getProductByC,
  getSummary,
  login,
  logout,
  mailStats,
  registerRequest,
  sendReply,
  updateBanner,
  updateCart,
  updateFCImage,
  updateProductImage,
  updateProfilePhoto,
  updateStatus,
  updateUserStatus,
  userDetails,
  userMail,
} from "../controller/user.controller.js";
import { upload } from "../midillware/multer.js";

const router = express.Router();

router.post("/createuser", verifyToken, createUser);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.post("/registerRequest", verifyToken, registerRequest);
router.patch("/updatestatus/:id", verifyToken, updateStatus);
router.get("/getallrequest", verifyToken, getAllRequests);
router.get("/usermails", verifyToken, userMail);
router.get("/fetchmailbyid", verifyToken, fetchMailById);
router.patch("/deletemailbyuser", verifyToken, deletedMailByUser);
router.post("/sendreply", verifyToken, sendReply);
router.get("/getsummary", verifyToken, getSummary);
router.patch("/changepassword", verifyToken, changePassword);
router.get("/userdetails", verifyToken, userDetails);
router.get("/allusers", verifyToken, allUsers);
router.get("/getallnotification", verifyToken, getAllNotifications);
router.delete("/deletenotification", verifyToken, deleteNotification);
router.get("/mailstats", verifyToken, mailStats);
router.patch("/updateuserstatus", verifyToken, updateUserStatus);
router.post("/addbanner", verifyToken, upload.array("images", 6), addBanner);
router.get("/getbanners", verifyToken, getBanners);
router.delete("/deletebanner", verifyToken, deleteBanner);
router.put("/updatebanner", verifyToken, upload.single("image"), updateBanner);
router.patch(
  "/updateprofilephoto",
  verifyToken,
  upload.single("image"),
  updateProfilePhoto,
);

router.post("/addaddress", verifyToken, addAddress);
router.get("/getaddress", verifyToken, getAddress);
router.post("/addcategory", verifyToken, upload.single("image"), AddCategories);
router.get("/getcategories", getCategories);
router.put(
  "/updatefcimage",
  verifyToken,
  upload.single("image"),
  updateFCImage,
);
router.patch("/deletecategory", verifyToken, deleteCategory);
router.post("/addproduct", verifyToken, upload.single("image"), addProduct);
router.get("/getproductbyc", verifyToken, getProductByC);
router.patch(
  "/updateproductimage",
  verifyToken,
  upload.single("image"),
  updateProductImage,
);
router.patch("/deleteproduct", verifyToken, deleteProduct);
router.post("/addtocart", verifyToken, addToCart);
router.get("/getcartdetails", verifyToken,getCartDetails)
router.patch("/updatecart",verifyToken,updateCart)
router.delete("/deletecartproduct",verifyToken,deleteCartProduct)
export default router;
