const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
res.json({
success: true,
message: "Kissan Mitra Backend is running!",
});
});

app.get("/api/health", (req, res) => {
res.status(200).json({
success: true,
message: "Backend health check successful",
});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Kissan Mitra backend running on port ${PORT}`);
});
