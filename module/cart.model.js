import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Users from "./user.model.js";
import Products from "./product.model.js";

const Cart = db.define("Cart", {
    cart_id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    user_id : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    product_id : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    quantity : {
        type : DataTypes.INTEGER,
        defaultValue : 1,
    },
    price : {
        type : DataTypes.DECIMAL(10,2),
        allowNull : false
    },
    total_price : {
        type : DataTypes.DECIMAL(10,2),
        allowNull :false
    },
    subtotal : {
        type : DataTypes.DECIMAL(10,2)
    },
    discount : {
        type : DataTypes.DECIMAL(10,2),
        defaultValue : 0
    },
    deliveryFees : {
        type : DataTypes.DECIMAL(10,2),
        defaultValue : 0
    }
})

Cart.belongsTo(Users, {
    foreignKey : "user_id"
});

Cart.belongsTo(Products,{
    foreignKey : "product_id"
})

export default Cart