import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Banners = db.define(
  "banners",
  {
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  },
);

export default Banners;
