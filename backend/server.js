const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const config = require("./config/conf");
const urlRoutes = require("./routes/url_routes");
const productRoutes = require("./routes/product_routes");
require("dotenv").config();

const BUILD = path.join(path.dirname(__dirname), "frontend", "build");

const app = express();
config.connectToDB(app, process.env.PORT);

// set up middlewares
app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());

if (process.env.NODE_ENV === "prod") {
  app.use(express.static(BUILD));
  app.use("*", (req, res) => {
    res.sendFile(path.join(BUILD, "index.html"));
  });
} else {
  app.get("/", (req, res) => res.send("Waiting for production..."));
}

app.use("/api/url", urlRoutes);
app.use("/api/product", productRoutes);
