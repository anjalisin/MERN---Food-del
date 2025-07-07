import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto"; // Add this at the top if not already

const verifyOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Log incoming data for debugging (optional)
    console.log("Verifying Razorpay order:", req.body);

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Step 1: Create the expected signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Step 2: Compare signatures
    if (expectedSignature !== razorpay_signature) {
      console.warn("Signature mismatch!", {
        expectedSignature,
        received: razorpay_signature,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Step 3: Update order status to 'confirmed'
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      {
        payment: true,
        status: "confirmed",
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error verifying order:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    const { userId, items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      amount, // in USD
      address,
      status: "pending",
    });
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Convert amount to INR paise
    const razorpayAmount = Math.round(amount * 100); // ₹ → paise

    const razorpayOrder = await razorpay.orders.create({
      amount: razorpayAmount,
      currency: "INR",
      receipt: newOrder._id.toString(),
      payment_capture: 1,
    });

    res.json({
      success: true,
      orderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { placeOrder, verifyOrder };
