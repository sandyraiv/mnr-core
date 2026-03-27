const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.get("/create-admin", async (req, res) => {
  const user = new User({
    email: "admin@mnr.com",
    password: "1234",
    role: "admin"
  });

  await user.save();

  res.send("Admin created");
});

/* ================= DATA ================= */

// USERS
let users = [
  { email: "admin@mnr.com", password: "1234", role: "admin" }
];

// LEADS
let leads = [];

// QUOTATIONS
let quotations = [];

// PRICING
let pricing = [];

/* ================= ROUTES ================= */

// TEST
app.get("/", (req, res) => {
  res.send("MNR CORE Backend Running");
});

/* ---------- LOGIN ---------- */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) return res.status(401).json({ message: "Invalid" });

  res.json(user);
});

/* ---------- USERS ---------- */
app.post("/api/users", (req, res) => {
  users.push(req.body);
  res.json({ message: "User Added" });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

/* ---------- LEADS ---------- */
app.get("/api/leads", (req, res) => {
  res.json(leads);
});

app.post("/api/leads", (req, res) => {
  const lead = {
    ...req.body,
    _id: Date.now().toString(),
    status: "New"
  };
  leads.push(lead);
  res.json(lead);
});

app.put("/api/leads/:id", (req, res) => {
  leads = leads.map(l =>
    l._id === req.params.id ? { ...l, ...req.body } : l
  );
  res.json({ message: "Updated" });
});

/* ---------- QUOTATION ---------- */
app.post("/api/quotation", (req, res) => {
  const quote = {
    ...req.body,
    _id: Date.now().toString()
  };
  quotations.push(quote);
  res.json(quote);
});

/* ---------- PRICING ---------- */
app.post("/api/pricing", (req, res) => {
  const item = {
    ...req.body,
    _id: Date.now().toString()
  };
  pricing.push(item);
  res.json(item);
});

app.get("/api/pricing", (req, res) => {
  res.json(pricing);
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
