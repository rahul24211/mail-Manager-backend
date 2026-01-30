import express from "express";
import db from "./config/db.js";
import router from "./routers/user.router.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: `${process.env.C_URL}`,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

db.authenticate()
  .then(() => console.log("MYSQL CONNECTED"))
  .catch((error) => console.log("DB_ERROR", error));

// db.sync({alter : true})
//   .then(() => console.log("DATABASE SYCN SUCCESSFULLY"))
//   .catch((error) => console.log("ERROR", error));

app.use("/", router);
app.listen(`${process.env.PORT}`, console.log(`server is sunning port : ${process.env.PORT}`));
