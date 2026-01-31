import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Users from "./user.model.js";

const Requests = db.define("requests", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },

  toUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },

  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  compose_mail: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM("Pending", "Approve", "Reject","Reply"),
    allowNull: false,
    defaultValue: "Pending",
  },

  deletedByUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  deletedByAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  parentMailId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "requests",
      key: "id",
    },
    onDelete: "CASCADE",
  },
});

// sender
Requests.belongsTo(Users, {
  foreignKey: "userId",
  as: "sender",
});

// receiver
Requests.belongsTo(Users, {
  foreignKey: "toUserId",
  as: "receiver",
});

export default Requests;
