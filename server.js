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

/* ================= CLEAR LEADS ================= */

app.delete("/api/clear-leads", async (req, res) => {
  await Lead.deleteMany({});
  res.send("All leads deleted");
});

/* ================= SEED DUMMY LEADS ================= */

app.get("/seed-leads", async (req, res) => {
  try {
    const company = await Company.findOne({ name: "MNR Interiors" });

    if (!company) {
      return res.send("Company not found");
    }

    const dummyLeads = [
      { name: "Ravi Kumar", phone: "9876543210", status: "New" },
      { name: "Anjali Sharma", phone: "9123456780", status: "Contacted" },
      { name: "Suresh Reddy", phone: "9988776655", status: "Visit" },
      { name: "Karthik N", phone: "9012345678", status: "Quote" },
      { name: "Priya Singh", phone: "9871234560", status: "Closed" },
      { name: "Arjun Mehta", phone: "9001122334", status: "New" },
      { name: "Deepika Rao", phone: "9112233445", status: "Contacted" },
      { name: "Manoj Kumar", phone: "9223344556", status: "Visit" },
      { name: "Sneha Iyer", phone: "9334455667", status: "Quote" },
      { name: "Vikram Patel", phone: "9445566778", status: "Closed" }
    ];

    const leadsWithCompany = dummyLeads.map(l => ({
      ...l,
      companyId: company._id
    }));

    await Lead.insertMany(leadsWithCompany);

    res.send("Dummy leads added successfully");
  } catch (err) {
    console.log(err);
    res.send("Error adding dummy leads");
  }
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
