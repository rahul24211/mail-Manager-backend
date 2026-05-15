import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Users from "./user.model.js";

const Address = db.define("address", {
  userid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Users,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },

  phoneN: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  line1: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  line2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Address;
