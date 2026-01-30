import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Users = db.define("users", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  userType: {
    type: DataTypes.ENUM("Admin", "HR", "Employee"),
    allowNull: false,
  },

  generatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active",
    allowNull: false,
  },
});

export default Users;
