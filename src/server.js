const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
const interviewRoutes = require("./routes/interviewRoutes")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err))

app.use("/api/auth",authRoutes)

app.use("/api/interview",interviewRoutes)

app.get("/",(req,res)=>{

res.send("AI Interview Backend Running")

})

const PORT = 5000

app.listen(PORT,()=>{

console.log(`Server running on port ${PORT}`)

})