const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let leads = [];

app.post("/api/leads", (req, res) => {
  const lead = { ...req.body, _id: Date.now().toString(), status: "New" };
  leads.push(lead);
  res.json(lead);
});

app.get("/api/leads", (req, res) => {
  res.json(leads);
});

app.put("/api/leads/:id", (req, res) => {
  leads = leads.map(l => l._id === req.params.id ? { ...l, ...req.body } : l);
  res.json({ msg: "Updated" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
