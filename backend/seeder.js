const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Products");
const User = require("./models/User");
const Cart = require("./models/Cart");
const products = require("./data/products");

dotenv.config();

//Connnect to mongoDB
mongoose.connect(process.env.MONGO_URI);

//function to seed data

const seedData = async () => {
    try{
        //clear existing data
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        //create default admin
        const createdUser = await User.create({
            name:"Admin User",
            email:"admin@example.com",
            password:"1234567",
            role:"admin",
        });

        // Assign default ID to eachproduct

        const userID = createdUser._id;

        const sampleProducts = products.map((product)=>{
            return {...product, user: userID};
        });

        // Insert the products into the DB
        await Product.insertMany(sampleProducts);
        console.log("Seeding succesful!");
        process.exit();
    }catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();