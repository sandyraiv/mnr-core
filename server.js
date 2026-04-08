const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Mongo Connected"))
.catch(err=>console.log(err));

/* MODELS */
const User = mongoose.model("User", {
  email:String,
  password:String,
  role:String
});

const Lead = mongoose.model("Lead", {
  name:String,
  phone:String,
  status:String,
  price:Number,
  employee:String
});

/* LOGIN */
app.post("/api/login", async (req,res)=>{
  const {email,password} = req.body;

  let user = await User.findOne({email,password});
  if(!user){
    user = await User.create({email,password,role:"admin"});
  }

  res.json(user);
});

/* LEADS */
app.get("/api/leads", async (req,res)=>{
  const data = await Lead.find();
  res.json(data);
});

/* ASSIGN */
app.put("/api/assign/:id", async (req,res)=>{
  await Lead.findByIdAndUpdate(req.params.id,{
    employee:req.body.employee
  });
  res.send("Assigned");
});

/* SEED */
app.get("/seed", async (req,res)=>{
  await Lead.deleteMany({});

  await Lead.insertMany([
    {name:"Luxury Villa",phone:"9999",status:"New",price:250000},
    {name:"2BHK Interior",phone:"8888",status:"Quote",price:180000},
    {name:"Office Setup",phone:"7777",status:"Closed",price:500000}
  ]);

  res.send("Demo Ready");
});

app.listen(10000, ()=>console.log("Server running"));
