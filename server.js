const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Mongo Error:", err));

/* ================= MODELS ================= */

const Company = mongoose.model("Company", {
  name: String,
  plan: String,
  status: String
});

const User = mongoose.model("User", {
  email: String,
  password: String,
  role: String,
  companyId: String
});

const Lead = mongoose.model("Lead", {
  name: String,
  phone: String,
  status: String,
  price: Number,
  companyId: String
});

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("Backend Running");
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

/* ================= CREATE ADMIN ================= */

app.get("/create-admin", async (req, res) => {
  const company = await Company.findOne({ name: "MNR Interiors" });

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

  const user = await User.findOne({ email, password });

  if (!user) return res.status(401).json({ msg: "Invalid login" });

  const company = await Company.findById(user.companyId);

  if (!company || company.status !== "active") {
    return res.status(403).json({ msg: "Subscription expired" });
  }

  res.json(user);
});

/* ================= ADD LEAD ================= */

app.post("/api/leads", async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.json(lead);
});

/* ================= GET LEADS ================= */

app.get("/api/leads/:companyId", async (req, res) => {
  const leads = await Lead.find({ companyId: req.params.companyId });
  res.json(leads);
});

/* ================= CLEAR LEADS ================= */

app.delete("/api/clear-leads", async (req, res) => {
  await Lead.deleteMany({});
  res.send("All leads deleted");
});

/* ================= ADD DUMMY LEADS ================= */

app.get("/seed-leads", async (req, res) => {
  const company = await Company.findOne({ name: "MNR Interiors" });

  if (!company) return res.send("Company not found");

  const leads = [
    { name: "Ravi Kumar", phone: "9876543210", status: "New", price: 150000 },
    { name: "Anjali Sharma", phone: "9123456780", status: "Contacted", price: 200000 },
    { name: "Suresh Reddy", phone: "9988776655", status: "Visit", price: 350000 },
    { name: "Karthik N", phone: "9012345678", status: "Quote", price: 500000 },
    { name: "Priya Singh", phone: "9871234560", status: "Closed", price: 650000 }
  ];

  const finalLeads = leads.map(l => ({
    ...l,
    companyId: company._id
  }));

  await Lead.insertMany(finalLeads);

  res.send("Dummy leads added");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
