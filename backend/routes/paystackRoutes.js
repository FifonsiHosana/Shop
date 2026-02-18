const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const { Paystack } = require("paystack-sdk");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");

const router = express.Router();
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

const finalizeCheckoutFromPayment = async ({ checkoutId, paymentDetails }) => {
  const checkout = await Checkout.findById(checkoutId);

  if (!checkout) {
    return { status: "not_found" };
  }

  const existingOrder = await Order.findOne({ checkoutId: checkout._id });
  if (existingOrder) {
    return { status: "already_processed", order: existingOrder, checkout };
  }

  const paidAt = new Date();

  const newOrder = await Order.create({
    user: checkout.user,
    checkoutId: checkout._id,
    orderItems: checkout.checkoutItems,
    shippingAddress: checkout.shippingAddress,
    paymentMethod: "Paystack",
    totalPrice: checkout.totalPrice,
    isPaid: true,
    paidAt,
    paymentStatus: "paid",
    paymentDetails,
    isDelivered: false,
  });

  checkout.isPaid = true;
  checkout.paymentStatus = "paid";
  checkout.paidAt = paidAt;
  checkout.paymentDetails = paymentDetails;
  checkout.isFinalized = true;
  checkout.finalizedAt = paidAt;
  await checkout.save();

  await Cart.findOneAndDelete({ user: checkout.user });

  return { status: "created", order: newOrder, checkout };
};

router.post("/mywebhookurl", async function (req, res) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return res.status(500).send("Server misconfigured");
  }

  const rawPayload = req.rawBody || JSON.stringify(req.body);

  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawPayload)
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    console.error("Invalid Paystack webhook signature");
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;
  console.log("Paystack webhook event:", event.event);

  if (event.event !== "charge.success") {
    return res.sendStatus(200);
  }

  const checkoutId = event.data?.metadata?.orderId;

  if (!checkoutId) {
    console.error("Missing checkoutId in Paystack webhook metadata", event.data);
    return res.sendStatus(200);
  }

  try {
    const result = await finalizeCheckoutFromPayment({
      checkoutId,
      paymentDetails: event.data,
    });

    if (result.status === "not_found") {
      console.error("Checkout not found for webhook checkoutId:", checkoutId);
      return res.sendStatus(200);
    }

    if (result.status === "already_processed") {
      console.log("Webhook ignored: checkout already processed", checkoutId);
      return res.sendStatus(200);
    }

    console.log("Webhook order created:", result.order._id.toString());
  } catch (error) {
    console.error("Webhook processing error:", error);
  }

  return res.sendStatus(200);
});

router.post("/intializePayment", async function (req, res) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "PAYSTACK_SECRET_KEY is not configured" });
    }

    const { checkoutId } = req.body;
    if (!checkoutId) {
      return res.status(400).json({ message: "checkoutId is required" });
    }

    const checkout = await Checkout.findById(checkoutId).populate("user");
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    const frontendUrl = process.env.FRONTEND_URL;
    const callback_url = frontendUrl
      ? `${frontendUrl}/order-confirmation?checkoutId=${checkout._id.toString()}`
      : undefined;

    const response = await paystack.transaction.initialize({
      email: checkout.user.email || "fallback@email.com",
      amount: checkout.totalPrice * 100,
      metadata: {
        orderId: checkout._id.toString(),
      },
      callback_url,
    });

    return res.status(201).json(response.data);
  } catch (error) {
    console.error("Paystack initialize error:", error?.response?.data || error);
    return res.status(500).json({ message: "Server Error" });
  }
});

router.post("/verifyPayment", async function (req, res) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "PAYSTACK_SECRET_KEY is not configured" });
    }

    const { reference, checkoutId } = req.body;

    if (!reference || !checkoutId) {
      return res
        .status(400)
        .json({ message: "reference and checkoutId are required" });
    }

    const verification = await paystack.transaction.verify({ reference });
    const data = verification?.data;

    if (!data || data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful", data });
    }

    const metadataCheckoutId = data?.metadata?.orderId;
    if (metadataCheckoutId && metadataCheckoutId !== checkoutId) {
      return res.status(400).json({ message: "checkoutId mismatch in metadata" });
    }

    const result = await finalizeCheckoutFromPayment({
      checkoutId,
      paymentDetails: data,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ message: "Checkout not found" });
    }

    return res.status(200).json({
      message:
        result.status === "already_processed"
          ? "Payment already processed"
          : "Payment verified and order created",
      orderId: result.order?._id,
      checkoutId,
      status: result.status,
    });
  } catch (error) {
    console.error("Paystack verify error:", error?.response?.data || error);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
