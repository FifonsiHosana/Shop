const mongoose = require("mongoose");

const connectDB =  async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI );
        console.log("Successful MongoDB connection");
    } catch (err) {
        console.error("MongoDB connectionn failed cuh.", err);
        process.exit(1);
    }
};

module.exports= connectDB;