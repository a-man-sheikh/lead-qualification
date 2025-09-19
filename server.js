const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/config");

dotenv.config({ path: ".env" });



const hostname = process.env.HOST_NAME || "localhost";
const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, hostname, () => {
    console.log(` Server running at http://${hostname}:${port}`);
  });
});
