const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= DB ================= */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ================= MODELS ================= */

const User = mongoose.model("User", {
  email: String,
  password: String,
  role: String,
  company: String
});

const Lead = mongoose.model("Lead", {
  name: String,
  phone: String,
  status: String,
  company: String
});

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("MNR SaaS Backend Running");
});

/* ================= CREATE ADMIN ================= */

app.get("/create-admin", async (req, res) => {
  try {
    console.log("Creating admin...");

    const user = new User({
      email: "admin@mnr.com",
      password: "1234",
      role: "admin",
      company: "MNR"
    });

    await user.save();

    console.log("Admin saved:", user);

    res.send("Admin created successfully");
  } catch (err) {
    console.log("Error saving user:", err);
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

/* ================= ADD USER (ADMIN) ================= */

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ msg: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ msg: "Wrong password" });
  }

  res.json(user);
});
/* ================= GET LEADS ================= */

app.get("/api/leads/:company", async (req, res) => {
  const leads = await Lead.find({ company: req.params.company });
  res.json(leads);
});

/* ================= ADD LEAD ================= */

app.post("/api/leads", async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.json(lead);
});

/* ================= UPDATE LEAD ================= */

app.put("/api/leads/:id", async (req, res) => {
  await Lead.findByIdAndUpdate(req.params.id, req.body);
  res.json({ msg: "Updated" });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
