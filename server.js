const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Mongo Connected"))
.catch(err=>console.log(err));

/* ===== MODEL ===== */
const Lead = mongoose.model("Lead", {
  name:String,
  phone:String,
  status:String,
  price:Number
});

/* ===== ROOT ===== */
app.get("/", (req,res)=>{
  res.send("Backend Running");
});

/* ===== GET LEADS (NO FILTER) ===== */
app.get("/api/leads", async (req,res)=>{
  const data = await Lead.find();
  res.json(data);
});

/* ===== ASSIGN ===== */
app.put("/api/assign-lead/:id", async (req,res)=>{
  res.send("Assigned (demo)");
});

/* ===== CLEAR ===== */
app.get("/api/clear-leads", async (req,res)=>{
  await Lead.deleteMany({});
  res.send("Cleared");
});

/* ===== SEED ===== */
app.get("/seed-leads", async (req,res)=>{
  const leads = [
    {name:"Ravi",phone:"9999",status:"New",price:150000},
    {name:"Anjali",phone:"8888",status:"Quote",price:300000},
    {name:"Kiran",phone:"7777",status:"Closed",price:500000}
  ];

  await Lead.insertMany(leads);
  res.send("Demo Data Added");
});

/* ===== SERVER ===== */
app.listen(10000, ()=>console.log("Server running"));
