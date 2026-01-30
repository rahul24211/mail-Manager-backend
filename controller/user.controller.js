import Users from "../module/user.model.js";
import jwt from "jsonwebtoken";
import Requests from "../module/request.model.js";
import { where } from "sequelize";

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

    if (user.password !== password) {
      return res.status(400).json({ message: "wroung password" });
    }

    const payload = {
      id: user.id,
      name: user.id,
      email: user.email,
      userType: user.userType,
    };

    const token = await jwt.sign(payload, "THIS IS SECRET STRING", {
      expiresIn: "365d",
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

export const registerRequest = async (req, res) => {
  const { toEmailId, subject, composeMail } = req.body;
  const userId = req.user.id;
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

    res
      .status(200)
      .json({ message: `request ${status} successfully`, data: checkRequest });
  } catch (error) {
    console.log(error.message);
  }
};

export const getAllRequests = async (req, res) => {
  // const userType = req.user.userType;

  try {
    // if (userType !== "Admin" && userType !== "HR") {
    //   return res.status(403).json({ message: "unauthorize" });
    // }

    const allRequest = await Requests.findAll({
      where: { deletedByAdmin: false, parentMailId: null },
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ["email"],
        },
      ],
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

  try {
    const mails = await Requests.findAll({ where: { userId: userId } });

    // main mails (user ki)
    // const mainMails = mails.filter(
    //   (mail) =>
    //     mail.userId === userId &&
    //     mail.parentMailId === null &&
    //     mail.deletedByUser === false,
    // );

    // // attach replies
    // const response = mainMails.map((mainMail) => {
    //   const replies = mails.filter(
    //     (reply) =>
    //       reply.parentMailId === mainMail.id && reply.deletedByUser === false,
    //   );

    res.status(200).json({
      message: "your mail fetched successfully",
      mails: mails,
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
  } catch (error) {}
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

    const AllRequest = await Requests.count();
    const AllRequestApprove = await Requests.count({
      where: { status: "Approve" },
    });
    const AllRequestPending = await Requests.count({
      where: { status: "Pending" },
    });
    const Reject = await Requests.count({ where: { status: "Reject" } });

    res.status(200).json({
      message: "Details Fetched Successfully",
      AllDetails: {
        AllUser: AllUser,
        AllRequest: AllRequest,
        AllRequestApprove: AllRequestApprove,
        AllRequestPending: AllRequestPending,
        Reject: Reject,
      },
    });
  } catch (error) {}
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
    const user = await Users.findOne({ where: { id: userId } });

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
  try {
    if (user.userType !== "Admin") {
      return res.status(403).json({ message: "Unauthorize" });
    }

    const allUsers = await Users.findAll({where : {userType : "Employee"}});
    res
      .status(200)
      .json({ message: "Users Fetched Successfully", users: allUsers });
  } catch (error) {
    console.log(error.message);
  }
};
