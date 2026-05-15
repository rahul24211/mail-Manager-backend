const { Users, LoginLogs } = db;
import jwt from "jsonwebtoken";
import Requests from "../module/request.model.js";
import Notifications from "../module/notification.model.js";
import { Op, where } from "sequelize";
import { createNotification } from "../helper/sendNotification.js";
import Banners from "../module/banner.model.js";
import Address from "../module/address.model.js";
import dotenv from "dotenv";
import db from "../module/models.index.js";
import Categories from "../module/categories.model.js";
import Products from "../module/product.model.js";
import Cart from "../module/cart.model.js";

dotenv.config();

export const createUser = async (req, res) => {
  const { name, email, password, userType } = req.body;
  try {
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: "all field are required" });
    }

    if (name.length < 3) {
      return res
        .status(400)
        .json({ message: "Please Enter your name atleaset 3 charectors" });
    }

    if (userType !== "Employee") {
      return res.status(400).json({ message: "Please Enter Correct UserType" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Please Enter your Password atleaset 6 charectors and Degits",
      });
    }

    const user = await Users.findOne({ where: { email: email } });
    if (user) {
      return res.status(400).json({ message: "user is already exits" });
    }

    const newUser = await Users.create({
      name,
      email,
      password,
      userType,
      generatedBy: req.user.id,
    });

    res
      .status(201)
      .json({ message: "User Create Successfully", data: newUser });
  } catch (error) {
    console.error("ERROR", error.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "both field are required" });
    }
    const user = await Users.findOne({ where: { email: email } });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (user.status === "Inactive") {
      return res
        .status(401)
        .json({ message: "Your Status Inactive Please Content your Seniour" });
    }

    if (user.password !== password) {
      await LoginLogs.create({ userId: user.id || null, status: "FAILED" });
      return res.status(400).json({ message: "wroung password" });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
    };

    const token = await jwt.sign(payload, process.env.SECRET_STRING, {
      expiresIn: "365d",
    });

    await LoginLogs.create({
      userId: user.id,
      loginTime: Date.now(),
      status: "SUCCESS",
    });

    res.status(200).json({
      message: "login successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        userType: user.userType,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error.message);
  }
};

export const logout = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!userId) {
      return res.status(404).json({ message: "userId Missing" });
    }

    const checkUser = await Users.findByPk(userId);
    if (!checkUser) {
      return res.status(404).json({ message: "User Not Found" });
    }
    await LoginLogs.update(
      {
        logoutTime: new Date(),
      },
      {
        where: { userId: userId },
      },
    );

    res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    console.error(error.message);
  }
};

export const registerRequest = async (req, res) => {
  const { toEmailId, subject, composeMail } = req.body;
  const userId = req.user.id;
  if (composeMail.length < 10) {
    return res
      .status(400)
      .json({ message: "Message must be at least 10 characters" });
  }
  try {
    if (!toEmailId || !subject || !composeMail) {
      return res.status(400).json({ message: "all field are require" });
    }

    const checkHr = await Users.findOne({ where: { email: toEmailId } });
    if (!checkHr) {
      res.status(404).json({ message: "please enter correct hr email id" });
    }

    const newRequest = await Requests.create({
      userId: userId,
      subject,
      compose_mail: composeMail,
      status: "Pending",
      toUserId: checkHr.id,
    });
    await createNotification({
      to: checkHr.id,
      from: userId,
      tital: `${req.user.name} send mail`,
      subject: `${subject}`,
      requestId: newRequest.id,
    });

    res
      .status(201)
      .json({ message: "request register successfully", data: newRequest });
  } catch (error) {
    console.log(error.message);
  }
};

export const updateStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const user = req.user;

  try {
    if (user.userType !== "Admin" && user.userType !== "HR") {
      return res
        .status(400)
        .json({ message: "Only Admin and HR Can Change Status " });
    }

    let checkRequest = await Requests.findOne({
      where: { id: id },
      attributes: ["id", "userId", "subject", "compose_mail", "status"],
    });

    if (!checkRequest) {
      return res.status(404).json({ message: "request not found" });
    }
    checkRequest.status = status;
    await checkRequest.save();
    await createNotification({
      to: checkRequest.userId,
      from: user.id,
      tital: `${user.name} react your request`,
      subject: `${user.name}, ${status} your ${checkRequest.subject}`,
      requestId: checkRequest.id,
    });

    res
      .status(200)
      .json({ message: `request ${status} successfully`, data: checkRequest });
  } catch (error) {
    console.log(error.message);
  }
};

export const getAllRequests = async (req, res) => {
  // const userType = req.user.userType;
  const { search } = req.query;
  try {
    // if (userType !== "Admin" && userType !== "HR") {
    //   return res.status(403).json({ message: "unauthorize" });
    // }
    let whereCondition = {
      deletedByAdmin: false,
      parentMailId: null,
    };
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.and]: [
          { deletedByAdmin: false, parentMailId: null },
          {
            [Op.or]: [
              { "$sender.email$": { [Op.like]: `${search}%` } },
              { subject: { [Op.like]: `${search}%` } },
            ],
          },
        ],
      };
    }
    const allRequest = await Requests.findAll({
      where: whereCondition,
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ["email"],
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    const results = {
      all: allRequest,
      pending: [],
      approved: [],
      rejected: [],
    };
    allRequest.forEach((req) => {
      if (req.status === "Pending") results.pending.push(req);
      else if (req.status === "Approve") results.approved.push(req);
      else if (req.status === "Reject") results.rejected.push(req);
    });

    res
      .status(200)
      .json({ message: "request fetch successfully", data: results });
  } catch (error) {
    console.error(error.message);
  }
};

export const userMail = async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;
  try {
    let whereCondition = {
      userId: userId,
    };
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.and]: [
          { userId: userId },
          {
            [Op.or]: [
              { "$sender.email$": { [Op.like]: `${search}%` } },
              { subject: { [Op.like]: `${search}%` } },
            ],
          },
        ],
      };
    }
    const allRequest = await Requests.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      include: {
        model: Users,
        as: "sender",
        attributes: ["email"],
        required: true,
      },
    });

    const results = {
      all: allRequest,
      pending: [],
      approved: [],
      rejected: [],
    };

    allRequest.forEach((req) => {
      if (req.status === "Pending") results.pending.push(req);
      else if (req.status === "Reject") results.rejected.push(req);
      else if (req.status === "Approve") results.approved.push(req);
    });
    res.status(200).json({
      message: "your mail fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "server error" });
  }
};

export const fetchMailById = async (req, res) => {
  const { id } = req.query;
  try {
    if (!id) {
      return res.status(404).json({ message: "mail is required" });
    }
    const mainMail = await Requests.findOne({
      where: { id: id },
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ["email"],
        },
        {
          model: Users,
          as: "receiver",
          attributes: ["email"],
        },
      ],
    });

    if (!mainMail) {
      return res.status(404).json({ message: "mail not found" });
    }

    const replies = await Requests.findAll({
      where: {
        parentMailId: mainMail.id,
        deletedByUser: false,
      },
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ["email"],
        },
        {
          model: Users,
          as: "receiver",
          attributes: ["email"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      message: "mail fetch by id is successfully",
      mail: {
        ...mainMail.dataValues,
        replies,
      },
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const deletedMailByUser = async (req, res) => {
  const { id } = req.query;
  try {
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    let checkMail = await Requests.findOne({ where: { id: id } });
    if (!checkMail) {
      return res.status(404).json({ message: "mail not found" });
    }

    checkMail.deletedByUser = true;
    await checkMail.save();
    return res
      .status(200)
      .json({ message: "mail delete successfully", mail: checkMail });
  } catch (error) {
    console.log(error.message);
  }
};

export const sendReply = async (req, res) => {
  const { parentMailId, composeMail } = req.body;
  try {
    if (!parentMailId || !composeMail) {
      return res
        .status(400)
        .json({ message: "parentMailId and replyMail Both Are Required" });
    }
    const originalMail = await Requests.findByPk(parentMailId);
    if (!parentMailId) {
      return res.status(404).json({ message: "mail is not found" });
    }

    const reply = await Requests.create({
      userId: req.user.id,
      toUserId: originalMail.userId,
      subject: `Re : ${originalMail.subject}`,
      compose_mail: composeMail,
      parentMailId: originalMail.id,
      status: "Reply",
    });

    await createNotification({
      to: originalMail.userId,
      from: originalMail.toUserId,
      tital: `${req.user.name} reply your reauest`,
      subject: `${originalMail.subject}`,
      requestId: originalMail.id,
    });
    res.status(200).json({ message: "Reply sent", reply });
  } catch (error) {
    console.log(error);
  }
};

// export const sendReplyByAdmin = async (req, res) => {
//   const userId = req.user.id;
//   try {
//     if (!userId) {
//       return res.status(400).json({ message: "user not fount" });
//     }
//   } catch (error) {}
// };

export const getSummary = async (req, res) => {
  try {
    const user = req.user;
    if (user.userType !== "Admin") {
      return res.status(403).json({ message: "Unauthorize Person" });
    }
    const AllUser = await Users.count({ where: { userType: "Employee" } });
    const AllRequest = await Requests.count({
      where: { status: { [Op.ne]: "Reply" } },
    });
    const AllRequestApprove = await Requests.count({
      where: { status: "Approve" },
    });
    const AllRequestPending = await Requests.count({
      where: { status: "Pending" },
    });
    const Reject = await Requests.count({ where: { status: "Reject" } });

    const replies = await Requests.count({ where: { status: "Reply" } });

    res.status(200).json({
      message: "Details Fetched Successfully",
      AllDetails: {
        AllUser: AllUser,
        AllRequest: AllRequest,
        AllRequestApprove: AllRequestApprove,
        AllRequestPending: AllRequestPending,
        Reject: Reject,
        Reply: replies,
      },
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  try {
    if (oldPassword.length < 6 || newPassword.length < 6) {
      return res.status(400).json({
        message: "old and new password must be 6 charecter & degits",
      });
    }

    let checkUser = await Users.findOne({ where: { id: userId } });
    if (checkUser.password !== oldPassword) {
      return res.status(400).json({ message: "Please Enter Correct Password" });
    }

    checkUser.password = newPassword;
    await checkUser.save();

    res.status(200).json({ message: "Password change successfully" });
  } catch (error) {
    console.log(error.message);
  }
};

export const userDetails = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const user = await Users.findOne({
      where: { id: userId },
      attributes: ["name", "email", "status", "usertype", "image"],
    });

    if (!user) {
      return res.status(400).json({ message: "User Details Not Found" });
    }

    res
      .status(200)
      .json({ message: "User Details Fetched", userDetails: user });
  } catch (error) {
    console.log(error.message);
  }
};

export const allUsers = async (req, res) => {
  const user = req.user;
  const { search } = req.query;

  let whereCondition = {
    userType: "Employee",
  };
  try {
    if (user.userType !== "Admin") {
      return res.status(403).json({ message: "Unauthorize" });
    }
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.and]: [
          { userType: "Employee" },
          {
            [Op.or]: [{ name: { [Op.like]: `${search}%` } }],
            [Op.or]: [{ email: { [Op.like]: `${search}%` } }],
          },
        ],
      };
    }
    const allUsers = await Users.findAll({
      where: whereCondition,
      include: [
        {
          model: LoginLogs,
          attributes: ["loginTime", "logoutTime", "status"],
          limit: 1,
          separate: true,
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res
      .status(200)
      .json({ message: "Users Fetched Successfully", users: allUsers });
  } catch (error) {
    console.log(error.message);
  }
};

export const getAllNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!userId) {
      return res.status(400).json({ message: "unAuthorise" });
    }

    const notification = await Notifications.findAll({
      where: { to: userId },
      attributes: ["id", "subject", "title", "requestId"],
      order: [["createdAt", "DESC"]],
    });

    res
      .status(200)
      .json({ message: "notification fetch succesuccefully", notification });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.query;
  try {
    if (!id) {
      return res.status(400).json({ message: "notificationId is required" });
    }

    const notification = await Notifications.findOne({ where: { id: id } });
    if (!notification) {
      return res.status(404).json({ message: "notification not found" });
    }

    const deletedNotificaiton = await Notifications.destroy({
      where: { id: id },
    });

    res.status(200).json({
      message: "notification delete successfully",
      deletedNotificaiton,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const mailStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const mails = await Requests.findAll({ where: { userId: userId } });

    if (!mails) {
      return res.status(404).json({ message: "Mail Not Found" });
    }

    let Approve = 0;
    let Pending = 0;
    let Reject = 0;
    let Reply = 0;

    for (const mail of mails) {
      if (mail.status === "Approve") {
        Approve++;
      } else if (mail.status === "Pending") {
        Pending++;
      } else if (mail.status === "Reject") {
        Reject++;
      } else {
        Reply++;
      }
    }

    res.status(200).json({
      message: "mail fetch successfully",
      mail: {
        totalMail: mails.length,
        approved: Approve,
        pending: Pending,
        rejected: Reject,
        reply: Reply,
      },
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const updateUserStatus = async (req, res) => {
  const { status, id } = req.body;

  try {
    if (!id || !status) {
      return res
        .status(400)
        .json({ message: "id And Status Both Are Required" });
    }

    let user = await Users.findOne({ where: { id: id } });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    user.status = status;
    await user.save();
    res.status(200).json({ message: `User ${status} successfully` });
  } catch (error) {
    console.log(error.message);
  }
};

export const addBanner = async (req, res) => {
  try {
    // multer ke baad files yahan milti hain
    // console.log(req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images required" });
    }

    const banners = req.files.map((file) => ({
      imageUrl: `/uploads/${file.filename}`,
      isActive: true,
    }));

    await Banners.bulkCreate(banners);

    res.status(201).json({
      message: "Banners uploaded successfully",
      total: banners.imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await Banners.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
      attributes: ["imageUrl", "id"],
    });

    res
      .status(200)
      .json({ message: "Banners Fetched Successfully", banners: banners });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteBanner = async (req, res) => {
  const user = req.user;
  try {
    if (user && user.userType !== "Admin") {
      return res.status(403).json({ message: "UnAuthorize Persion" });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "banner id is required" });
    }

    const banner = await Banners.destroy({ where: { id: id } });

    if (!banner) {
      return res.status(404).json({ message: "banner not found" });
    }

    res.status(200).json({ message: "Banner Delete Successfully" });
  } catch (error) {
    console.log(error.message);
  }
};

export const updateBanner = async (req, res) => {
  const { id } = req.query;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Images required" });
    }

    let banner = await Banners.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.imageUrl = `/uploads/${req.file.filename}`;
    await banner.save();

    res.status(200).json({ message: "Banner Update Successfully" });
  } catch (error) {
    console.error("Update banner error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProfilePhoto = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image Requred" });
    }

    let user = await Users.findByPk(userId);

    user.image = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      message: "profile photo update successfully",
      image: user.image,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = {};
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== "") data[key] = req.body[key];
    });

    if (!userId) {
      return res.status(400).json({ message: "UserId missing" });
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    let checkUserInAddress = await Address.findOne({
      where: { userid: userId },
    });

    if (checkUserInAddress) {
      await Address.update(data, {
        where: { userid: userId },
      });

      return res.status(200).json({ message: "updated successfully" });
    } else {
      const createAddress = await Address.create({ ...data, userid: userId });
      return res
        .status(201)
        .json({ message: "created successfully", data: createAddress });
    }
  } catch (error) {
    console.error(error.message);
  }
};

export const getAddress = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const checkAddress = await Address.findOne({ where: { userid: userId } });
    if (!checkAddress) {
      return res.status(404).json({ message: "address not found" });
    }
    res
      .status(200)
      .json({ message: "address fetched successfully", checkAddress });
  } catch (error) {
    console.log(error.message);
  }
};

export const AddCategories = async (req, res) => {
  const { CName, CDes } = req.body;
  try {
    const user = req.user;
    if (user.userType !== "Admin") {
      return res.status(401).json({ message: "Not Authorize !" });
    }
    if (!CName) {
      return res.status(400).json({ message: "CName is requried" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Image Missing,Please Fill Image" });
    }
    const checkCategory = await Categories.findOne({ where: { CName: CName } });
    if (checkCategory) {
      return res
        .status(400)
        .json({ message: "This Category is Already Exiest" });
    }

    // ((checkCategory.CName = CName),
    //   (checkCategory.CDes = CDes),
    //   (checkCategory.CImage = `/uploads/${req.file.filename}`));

    // await checkCategory.save();

    const AddC = await Categories.create({
      CName,
      CDes,
      CImage: `/uploads/${req.file.filename}`,
    });

    res.status(201).json({ message: "Category Add Successfully", Data: AddC });
  } catch (error) {
    console.error(error.message);
  }
};

export const getCategories = async (req, res) => {
  try {
    const { search } = req.query;
    let whereCondition = {
      isDeleted: false,
    };

    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.and]: [
          { isDeleted: false },
          {
            [Op.or]: [{ CName: { [Op.like]: `${search}%` } }],
          },
        ],
      };
    }
    const FCategories = await Categories.findAll({
      where: whereCondition,
    });
    res
      .status(200)
      .json({ message: "Categories Fetched Successfully", FCategories });
  } catch (error) {
    console.error(error.message);
  }
};

export const updateFCImage = async (req, res) => {
  try {
    const { id } = req.query;
    const user = req.user;
    if (user.userType !== "Admin") {
      return res.status(401).json({ message: "Not Authorize Person" });
    }
    const checkFCImage = await Categories.findOne({ where: { id: id } });
    if (!checkFCImage) {
      return res.status(404).json({ message: "Image Not Found" });
    }
    checkFCImage.CImage = `/uploads/${req.file.filename}`;
    await checkFCImage.save();
    res.status(200).json({ message: "Image Update Successfully" });
  } catch (error) {
    console.error(error.message);
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.query;
  try {
    const user = req.user;
    if (user.userType !== "Admin") {
      return res.status(401).json({ message: "Not Authorize Person" });
    }
    const checkFCImage = await Categories.findOne({ where: { id: id } });
    if (!checkFCImage) {
      return res.status(404).json({ message: "Category Id Not Found" });
    }
    checkFCImage.isDeleted = true;
    await checkFCImage.save();
    res.status(200).json({ message: "Category Delete Successfully" });
  } catch (error) {
    console.error(error.message);
  }
};

export const addProduct = async (req, res) => {
  const { CId, PName, Description, Price, Language } = req.body;
  try {
    if (!CId) {
      return res.status(400).json({ message: "Category Id Is Required" });
    }
    if (!PName) {
      return res.status(400).json({ message: "Product Name Is Required" });
    }
    if (!Price) {
      return res.status(400).json({ message: "Please Enter Price" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Image Missing,Please Fill Image" });
    }
    const checkProduct = await Products.findOne({ where: { PName: PName } });
    if (checkProduct) {
      return res
        .status(400)
        .json({ message: "This Product Is Already Exists" });
    }
    const addP = await Products.create({
      CId,
      PName,
      Description,
      laguage: Language,
      Price,
      Image: `/uploads/${req.file.filename}`,
    });
    res.status(201).json({ message: "Product Add Successfully", addP });
  } catch (error) {
    console.error(error.message);
  }
};

export const getProductByC = async (req, res) => {
  try {
    const { id, search } = req.query;
    if (!id) {
      return res.status(400).json({ message: "id Is Required" });
    }
    let whereCondition = {
      CID: id,
      isDeleted: false,
    };

    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.and]: [
          { CID: id },
          {
            [Op.or]: [{ PName: { [Op.like]: `${search}%` } }],
          },
        ],
      };
    }
    const fetchProduct = await Products.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "Cid",
        "PName",
        "Description",
        "language",
        "Price",
        "Image",
        "Stock",
      ],
    });
    res
      .status(200)
      .json({ message: "Product Is Fetched Successfully", fetchProduct });
  } catch (error) {
    console.error(error.message);
  }
};

export const updateProductImage = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.query;
    if (user.userType !== "Admin") {
      return res.status(401).json({ message: "Not Authorize Person" });
    }
    if (!id) {
      return res.status(400).json({ message: "id Is Required" });
    }
    const checkProduct = await Products.findByPk(id);
    if (!checkProduct) {
      return res.status(404).json({ message: "Product Not Found" });
    }
    checkProduct.Image = `/uploads/${req.file.filename}`;
    await checkProduct.save();
    res.status(200).json({ message: "Product Image Update successfully" });
  } catch (error) {
    console.error(error.message);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const user = req.user;
    if (user.userType !== "Admin") {
      return res.status(401).json({ message: "Not Authorize Person" });
    }
    if (!id) {
      return res.status(400).json({ message: "Id Missing" });
    }
    const findProduct = await Products.findByPk(id);
    if (!findProduct) {
      return res.status(404).json({ message: "Product Not Found" });
    }
    findProduct.isDeleted = true;
    await findProduct.save();
    res.status(200).json({ message: "Food Delete Successfully" });
  } catch (error) {
    console.error(error.message);
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ message: "userId missing" });
    }
    if (!productId) {
      return res.status(404).json({ message: "productId missing" });
    }
    const checkProduct = await Products.findByPk(productId);
    if (!checkProduct) {
      return res.status(404).json({ message: "product not found" });
    }
    let checkCart = await Cart.findOne({ where: { product_id: productId } });
    if (checkCart) {
      checkCart.quantity = checkCart.quantity + quantity;
      let subtotal = checkCart.quantity * checkProduct.Price;
      checkCart.subtotal = checkCart.subtotal + subtotal;
      if (subtotal > 500) {
        checkCart.deliveryFees = 0;
      }
      let totalPrice = subtotal * checkCart.quantity - deliveryFees - discount;
      checkCart.total_price = totalPrice;
      await checkCart.save();
      return res
        .status(200)
        .json({ message: "Add to Cart Successfully", checkCart });
    } else {
      const addCrat = await Cart.create({
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        price: checkProduct.Price,
        subtotal: quantity * checkProduct.Price,
       total_price : checkProduct.Price * quantity
      });
      return res
        .status(201)
        .json({ message: "Add to Cart Successfully", addCrat });
    }
  } catch (error) {
    console.error(error.message);
  }
};

export const getCartDetails = async (req, res) => {
  try {
    const user = req.user;
    const fetchCartDetails = await Cart.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Products,
          attributes: ["PName", "Image", "Description", "language", "Price"],
        },
      ],
    });
    if (!fetchCartDetails) {
      return res.status(401).json({ message: "Anuthorize user" });
    }
    res
      .status(200)
      .json({ message: "Cart Details Fetch Successfully", fetchCartDetails });
  } catch (error) {
    console.error(error.message);
  }
};

export const updateCart = async (req, res) => {
  try {
    const { cartDetails } = req.body;
    for (const item of cartDetails) {
      const totalPrice = item.quantity * item.price;
      await Cart.update(
        {
          quantity: item.quantity,
          total_price: totalPrice,
        },
        { where: { cart_id: item.cart_id } },
      );
    }
    res.status(201).json({ message: "Cart Updated Successfully" });
  } catch (error) {
    console.error(error.message);
  }
};

export const deleteCartProduct = async (req, res) => {
  try {
    const { cart_id } = req.query;
    if (!cart_id) {
      return res.status(400).json({ message: "cart_id is missing" });
    }
    const deleteCartProduct = await Cart.destroy({
      where: { cart_id: cart_id },
    });
    res.status(200).json({ message: "Remove successfully" });
  } catch (error) {
    console.error(error.message);
  }
};
