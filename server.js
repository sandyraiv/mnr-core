const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* ===== DB ===== */
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("Mongo Error:",err));

/* ===== MODELS ===== */

const Company = mongoose.model("Company", {
  name:String, plan:String, status:String
});

const User = mongoose.model("User", {
  email:String, password:String, role:String, companyId:String
});

const Employee = mongoose.model("Employee", {
  name:String, email:String, companyId:String
});

const Lead = mongoose.model("Lead", {
  name:String,
  phone:String,
  status:String,
  price:Number,
  requirement:String,
  employeeId:String,
  companyId:String
});

const Quotation = mongoose.model("Quotation", {
  leadId:String,
  amount:Number,
  details:String,
  companyId:String,
  createdAt:{type:Date, default:Date.now}
});

/* ===== ROOT ===== */
app.get("/",(req,res)=>res.send("Backend Running"));

/* ===== CREATE COMPANY ===== */
app.get("/create-company", async (req,res)=>{
  const c = new Company({name:"MNR Interiors",plan:"premium",status:"active"});
  await c.save();
  res.json(c);
});

/* ===== CREATE ADMIN ===== */
app.get("/create-admin", async (req,res)=>{
  const c = await Company.findOne();
  const u = new User({
    email:"admin@mnr.com",
    password:"1234",
    role:"admin",
    companyId:c._id
  });
  await u.save();
  res.send("Admin Created");
});

/* ===== LOGIN ===== */
app.post("/api/login", async (req,res)=>{
  const {email,password}=req.body;
  const user = await User.findOne({email,password});
  if(!user) return res.status(401).json({msg:"Invalid"});
  res.json(user);
});

/* ===== EMPLOYEE ===== */
app.post("/api/employees", async (req,res)=>{
  const e = new Employee(req.body);
  await e.save();
  res.json(e);
});

app.get("/api/employees/:companyId", async (req,res)=>{
  const data = await Employee.find({companyId:req.params.companyId});
  res.json(data);
});

/* ===== LEADS ===== */
app.post("/api/leads", async (req,res)=>{
  const l = new Lead(req.body);
  await l.save();
  res.json(l);
});

app.get("/api/leads/:companyId", async (req,res)=>{
  const data = await Lead.find({companyId:req.params.companyId});
  res.json(data);
});

app.put("/api/assign-lead/:id", async (req,res)=>{
  await Lead.findByIdAndUpdate(req.params.id,{
    employeeId:req.body.employeeId
  });
  res.send("Assigned");
});

/* ===== QUOTATION ===== */
app.post("/api/quotation", async (req,res)=>{
  const q = new Quotation(req.body);
  await q.save();
  res.json(q);
});

app.get("/api/quotation/:companyId", async (req,res)=>{
  const data = await Quotation.find({companyId:req.params.companyId});
  res.json(data);
});

/* ===== CLEAR ===== */
app.get("/api/clear-leads", async (req,res)=>{
  await Lead.deleteMany({});
  res.send("Cleared");
});

/* ===== SEED ===== */
app.get("/seed-leads", async (req,res)=>{
  const c = await Company.findOne();

  const leads = [
    {name:"Ravi",phone:"9999",status:"New",price:150000},
    {name:"Anjali",phone:"8888",status:"Quote",price:300000},
    {name:"Kiran",phone:"7777",status:"Closed",price:500000}
  ];

  const final = leads.map(l=>({...l,companyId:c._id}));

  await Lead.insertMany(final);
  res.send("Seed Done");
});

/* ===== SERVER ===== */
app.listen(10000,()=>console.log("Server running"));
