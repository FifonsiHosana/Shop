const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const { Paystack } = require("paystack-sdk");
const Checkout = require("../models/Checkout");

const secret = process.env.PAYSTACK_SECRET_KEY;
const router = express.Router();
const paystack = new Paystack(secret);

router.post("/mywebhookurl", async function (req, res) {
  //validate event
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }
    // Retrieve the request's body
    const event = req.body;
    // Do something with event
    console.log(event);

    if (event.event === "charge.success") {
      const orderId = event.data.metadata.orderId;

      const order = await Order.findById(orderId);

      //Idempotency check
      if (!order || order.isPaid) {
        return res.sendStatus(200);
      }

      
      if (order) {
        order.isPaid = true;
        order.paymentStatus = "paid";
        order.paidAt = Date.now();
        order.paymentMethod = "Paystack";
      }
      await order.save();
    }
  
  res.sendStatus(200);
});


router.post("/intializePayment", async function (req, res) {
  try {

      const { checkoutId } = req.body;
      if (!checkoutId) {
        console.log("order not found");
        return res.status(404).send("order not found/valid");
      }
      const checkout = await Checkout.findById(checkoutId).populate("user");
      const response = await paystack.transaction.initialize({
        email: checkout.user.email || "Salamatu@gmail.com",
        amount: checkout.totalPrice * 100,
        metadata: {
          orderId: checkout._id.toString(),
        },
      });
      console.log(response);
       console.log(
         "Full Paystack response:",
         JSON.stringify(response, null, 2),
       ); 
      res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"server Error"});
  }
});

module.exports = router;
