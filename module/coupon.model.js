import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Coupon = db.define(
  "Coupon",
  {
    coupon_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discount_type: {
      type: DataTypes.ENUM("flat", "percentage"),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    min_order_discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "Coupon",
    timestamps: true,
  },
);

export default Coupon;
