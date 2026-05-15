import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Users from "./user.model.js";
const LoginLogs = db.define("LoginLogs", {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: Users,
      key: "id",
    },
  },
  loginTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  logoutTime: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM("SUCCESS", "FAILED"),
    defaultValue: "SUCCESS",
  },
});

LoginLogs.associate = (models)=>{
    LoginLogs.belongsTo(models.Users, {
  foreignKey: "userId",
  as : "user"
});
}

export default LoginLogs;
