import { DataTypes } from "sequelize";
import db from "../config/db.js";
const Categories = db.define("Categories", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  CName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  CDes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  CImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Categories.associate = (models) => {
  Categories.hasMany(models.Products, {
    foreignKey: "CID",
  });
};

export default Categories;
