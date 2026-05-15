import { DataTypes } from "sequelize";
import db from "../config/db.js";
const Products = db.define("Products", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  CId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Categories",
      key: "id",
    },
  },
  PName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Description: { type: DataTypes.TEXT },
  Price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  Status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active",
  },
  Image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Stock: {
    type: DataTypes.ENUM("In-Stock", "Out-Stock"),
    defaultValue: "In-Stock",
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
Products.associate = (models) => {
  Products.belongsTo(models.Categories, {
    foreignKey: "CID",
  });
};
export default Products;
