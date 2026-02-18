const express = require("express");
const cors = require("cors");
const dotenv = require ("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productsRoutes = require("./routes/productsRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subcriberRoutes = require("./routes/subscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const paystackRoutes = require("./routes/paystackRoutes");


const app = express();
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf?.toString("utf8") || "";
    },
  }),
);
app.use(cors()); 



console.log(process.env.PORT)

const PORT = process.env.PORT || 3000  ;

// connect to DB
connectDB();

app.get("/",(req, res) => {
    res.send("WELCOME BIASSS");
});

//API routes
app.use("/api/users", userRoutes); 
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribe", subcriberRoutes);

//Admin routes
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

//webhook route
app.use("/api/payment", paystackRoutes)

app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
});