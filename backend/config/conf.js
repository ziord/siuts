const mongoose = require("mongoose");

exports.connectToDB = (app, port) => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(port, () => console.log(`Listening on port ${port} ...`));
    })
    .catch((err) => {
      console.log("Failed to connect to DB");
    });
};

exports.timestampOptions = {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
};

exports.getPartialUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

exports.ngQuery = "https://www.jumia.com.ng/catalog/?q=";

exports.puncts = /['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g;
