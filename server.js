const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Temporary in-memory data
let leads = [];

// Routes
app.get("/", (req, res) => {
  res.send("MNR CORE Backend Running");
});

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

// IMPORTANT: Dynamic port for Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
