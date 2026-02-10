import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Notifications = db.define("notification", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
   requestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  to: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  from: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tital: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  readRecipt: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default Notifications;
