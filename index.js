// import express from "express";
// import db from "./config/db.js";
// import router from "./routers/user.router.js";
// import cors from "cors";

// const app = express();
// app.use(express.json());
// app.use(
//   cors({
//     origin: ["http://localhost:5173", `${process.env.C_URL}`],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true,
//   }),
// );
// import "./module/user.model.js";
// import "./module/request.model.js";

// db.authenticate()
//   .then(() => console.log("MYSQL CONNECTED"))
//   .catch((error) => console.log("DB_ERROR", error));

// // db.sync({alter : true})
// //   .then(() => console.log("DATABASE SYCN SUCCESSFULLY"))
// //   .catch((error) => console.log("ERROR", error));

// app.use("/", router);
// app.listen(
//   `${process.env.PORT}`,
//   console.log(`server is sunning port : ${process.env.PORT}`),
// );

import express from "express";
import db from "./config/db.js";
import router from "./routers/user.router.js";
import cors from "cors";

const app = express();
app.use(express.json());

const allowedOrigins = ["http://localhost:5173", process.env.C_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman / server-to-server requests ke liye
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS NOT ALLOWED"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

// ✅ Models import (IMPORTANT for table creation)
// import "./module/user.model.js";
// import "./module/request.model.js";

db.authenticate()
  .then(() => console.log("MYSQL CONNECTED"))
  .catch((error) => console.log("DB_ERROR", error));

// ❗ Production me sync mat chalao
db.sync({ alter: true });

app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
