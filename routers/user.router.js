import express from "express";
import { verifyToken } from "../midillware/verifyToken.js";
import {
  allUsers,
  changePassword,
  createUser,
  deletedMailByUser,
  deleteNotification,
  fetchMailById,
  getAllNotifications,
  getAllRequests,
  getSummary,
  login,
  mailStats,
  registerRequest,
  sendReply,
  updateStatus,
  updateUserStatus,
  userDetails,
  userMail,
} from "../controller/user.controller.js";

const router = express.Router();

router.post("/createuser", verifyToken, createUser);
router.post("/login", login);
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

export default router;
