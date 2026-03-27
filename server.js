const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= MONGO CONNECT ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

/* ================= MODELS ================= */

const User = mongoose.model("User", {
  email: String,
  password: String,
  role: String
});

const Lead = mongoose.model("Lead", {
  name: String,
  phone: String,
  status: String,
  amount: Number
});

const Pricing = mongoose.model("Pricing", {
  section: String,
  item: String,
  price: Number
});

/* ================= TEST ================= */

app.get("/check", (req, res) => {
  res.send("Check route working");
});

app.get("/", (req, res) => {
  res.send("MNR CORE Backend Running");
});

/* ================= CREATE ADMIN ================= */

app.get("/create-admin", async (req, res) => {
  try {
    const existing = await User.findOne({ email: "admin@mnr.com" });

    if (existing) return res.send("Admin already exists");

    const user = new User({
      email: "admin@mnr.com",
      password: "1234",
      role: "admin"
    });

    await user.save();

    res.send("Admin created");
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (!user) return res.status(401).json({ msg: "Invalid" });

  res.json(user);
});

/* ================= LEADS ================= */

app.get("/api/leads", async (req, res) => {
  const data = await Lead.find();
  res.json(data);
});

app.post("/api/leads", async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.json(lead);
});

/* ================= PRICING ================= */

app.get("/api/pricing", async (req, res) => {
  const data = await Pricing.find();
  res.json(data);
});

app.post("/api/pricing", async (req, res) => {
  const item = new Pricing(req.body);
  await item.save();
  res.json(item);
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});

console.log("Updated version");
