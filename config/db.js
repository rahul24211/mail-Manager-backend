import { Sequelize } from "sequelize";

const db = new Sequelize("mydb","root","jai hanuman",{
    host : "localhost",
    dialect : "mysql",
    logging : false
})

export default db