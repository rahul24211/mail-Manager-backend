
import Users from "./user.model.js";
import LoginLogs from "./loginLogs.model.js";
const db = {
  Users,
  LoginLogs,
};

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
