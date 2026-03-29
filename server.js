const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= DB ================= */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Mongo Error:", err));

/* ================= MODELS ================= */

// COMPANY (SR Tech controls this)
const Company = mongoose.model("Company", {
  name: String,
  plan: String, // basic / pro / premium
  status: String, // active / expired
  createdAt: { type: Date, default: Date.now }
});

// USERS (inside company)
const User = mongoose.model("User", {
  email: String,
  password: String,
  role: String, // admin / sales
  companyId: String
});

// LEADS (company-wise)
const Lead = mongoose.model("Lead", {
  name: String,
  phone: String,
  status: String,
  companyId: String
});

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("SR Tech SaaS Backend Running");
});

/* ================= CREATE COMPANY ================= */

app.get("/create-company", async (req, res) => {
  const company = new Company({
    name: "MNR Interiors",
    plan: "premium",
    status: "active"
  });

  await company.save();

  res.json(company);
});

/* ================= CREATE ADMIN USER ================= */

app.get("/create-admin", async (req, res) => {
  const company = await Company.findOne({ name: "MNR Interiors" });

  if (!company) {
    return res.send("Create company first");
  }

  const user = new User({
    email: "admin@mnr.com",
    password: "1234",
    role: "admin",
    companyId: company._id
  });

  await user.save();

  res.send("Admin created");
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ msg: "User not found" });

  if (user.password !== password)
    return res.status(401).json({ msg: "Wrong password" });

  const company = await Company.findById(user.companyId);

  if (!company || company.status !== "active") {
    return res.status(403).json({ msg: "Subscription expired" });
  }

  res.json({
    email: user.email,
    role: user.role,
    companyId: user.companyId
  });
});

/* ================= ADD USER ================= */

app.post("/api/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

/* ================= GET LEADS ================= */

app.get("/api/leads/:companyId", async (req, res) => {
  const leads = await Lead.find({ companyId: req.params.companyId });
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
  console.log("🚀 Server running on port " + PORT);
});
