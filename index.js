//npm module
const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("morgan");
//app module
const authRouter = require("./auth/auth.routes");
const costsRouter = require("./costs/costs.routes");

class Server {
  server = null;
  PORT = process.env.PORT || "8080";
  db = null;

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.initDb();
    this.server.listen(this.PORT, () =>
      console.log("Server listening port", this.PORT)
    );
  }
  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(logger("dev"));
    this.server.use(
      cors({
        origin: "*",
      })
    );
  }
  initRoutes() {
    this.server.use("/auth", authRouter);
    this.server.use("/api/costs", costsRouter);
    // this.server.use("/", express.static(__dirname + "/public/"));
  }
  async initDb() {
    try {
      this.db = await mongoose.connect(process.env.URL_MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      if (this.db.connections[0].db.databaseName === process.env.DB_NAME) {
        console.log("Database connection successful");
      } else {
        throw new Error("Database name not match");
      }
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }
  initServer() {
    this.server = express();
  }
}

new Server().start();
