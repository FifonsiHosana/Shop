const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const { Paystack } = require("paystack-sdk");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");

// const secret = process.env.PAYSTACK_SECRET_KEY;
const router = express.Router();
// const paystack = new Paystack(secret);

// router.post("/mywebhookurl", async function (req, res) {
//   //validate event
//   const hash = crypto
//     .createHmac("sha512", secret)
//     .update(JSON.stringify(req.body))
//     .digest("hex");
//   if (hash !== req.headers["x-paystack-signature"]) {
//     return res.status(401).send("Invalid signature");
//   }
//   // Retrieve the request's body
//   const event = req.body;
//   // Do something with event
//   console.log(event);

//   if (event.event === "charge.success") {
//     const checkoutId = event.data.metadata.orderId;
//     const checkout = await Checkout.findById(checkoutId);
//     const order = await Order.findById(checkoutId);

//     //Idempotency check
//     if (!order || order.isPaid) {
//       return res.sendStatus(200);
//     }

//     const newOrder = await Order.create({
//       user: checkout.user,
//       checkoutId: checkout._id,
//       orderItems: checkout.checkoutItems,
//       shippingAddress: checkout.shippingAddress,
//       paymentMethod: "Paystack",
//       totalPrice: checkout.totalPrice,
//       isPaid: true,
//       paidAt: Date.now(),
//       paymentStatus: "paid",
//       paymentDetails: event.data,
//       isDelivered: false,
//     });
//     checkout.isPaid = true;
//     checkout.paymentStatus = "paid";
//     checkout.finalizedAt = Date.now();
//     await checkout.save();
//     // if (order) {
//     //   order.isPaid = true;
//     //   order.paymentStatus = "paid";
//     //   order.paidAt = Date.now();
//     //   order.paymentMethod = "Paystack";
//     // }
//     // await order.save();
//   }

//   res.sendStatus(200);
//   console.log("Order created:", newOrder._id);
// });

router.post("/mywebhookurl", async function (req, res) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return res.status(500).send("Server misconfigured");
  }

  const rawPayload = req.rawBody || JSON.stringify(req.body);
  // Validate signature
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawPayload)
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;
  console.log("Paystack event", event.event);

  if (event.event === "charge.success") {
    const checkoutId = event?.data?.metadata?.orderId;
    if (!checkoutId) {
      console.error("Missing checkout id in webhook metadata", event.data);
      return res.sendStatus(200);
    }

    try {
      const checkout = await Checkout.findById(checkoutId);

      if (!checkout) {
        console.error("Checkout not found:", checkoutId);
        return res.sendStatus(200);
      }

      const existingOrder = await Order.findOne({ checkoutId: checkout._id });
      if (existingOrder) {
        console.log("Order already exists, skipping");
        return res.sendStatus(200);
      }

      const newOrder = await Order.create({
        user: checkout.user,
        checkoutId: checkout._id,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: "Paystack",
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: Date.now(),
        paymentStatus: "paid",
        paymentDetails: event.data,
        isDelivered: false,
      });

      checkout.isPaid = true;
      checkout.paymentStatus = "paid";
      checkout.paidAt = Date.now();
      checkout.paymentDetails = event.data;
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();
      await Cart.findOneAndDelete({ user: checkout.user });
      console.log("Order created:", newOrder._id);
    } catch (error) {
      console.error("Webhook error:", error);
    }
  }else{
    console.log("Webhook did not fire event not successful:",event);
    res.sendStatus(500);
  }

  res.sendStatus(200);
});

router.post("/intializePayment", async function (req, res) {
  try {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) {
          return res
            .status(500)
            .json({ message: "PAYSTACK_SECRET_KEY is not configured" });
        }
        const paystack = new Paystack(secret);

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
    console.log("Full Paystack response:", JSON.stringify(response, null, 2));
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server Error" });
  }
});

module.exports = router;
