console.log(`Starting server.js`);
const express = require("express");
const path = require("path");

const app = express();
// const staticFilesDir = path.join(__dirname, "build"); // Adjust the directory as per your project structure
const staticFilesDir = __dirname;

app.use(express.static(staticFilesDir));

app.get("*", (req, res) => {
  // Custom server-side logic or routes can be defined here
  res.sendFile(path.join(staticFilesDir, "index.html"));
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
