import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ------------------- Place Order -------------------
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5174/";

  try {
    const { items, amount, address } = req.body;
    const userId = req.userId; // ✅ coming from auth middleware
    // Save order in DB with "pending"
    // if (!userId) {
    //   console.log("❌ No userId found in req");
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "User ID missing" });
    // }
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      payment: false,
      status: "pending",
    });

    await newOrder.save();
    // console.log("Order saved:", newOrder._id);
    // Create Razorpay order
    const options = {
      amount: amount * 100, // convert to paisa
      currency: "INR",
      receipt: `order_${newOrder._id}`,
    };
    //console.log("Creating Razorpay order with:", options);

    const razorpayOrder = await razorpay.orders.create(options);
    //console.log("Razorpay order created:", razorpayOrder);

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id, // 👈 use consistent name
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error in placeOrder:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ------------------- Verify Order -------------------
// ------------------- Verify Order -------------------
const verifyOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    console.log(" Incoming verify request body:", req.body);

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log(" Generated Expected Signature:", expectedSignature);
    console.log(" Razorpay Provided Signature:", razorpay_signature);

    if (expectedSignature === razorpay_signature) {
      await orderModel.findByIdAndUpdate(orderId, {
        payment: true,
        status: "confirmed",
      });

      console.log(" Payment verified successfully for order:", orderId);
      return res.json({ success: true, message: "Payment Verified" });
    } else {
      console.log(" Signature mismatch! Payment not verified.");
      return res.json({
        success: false,
        message: "Payment verification failed (Signature mismatch)",
      });
    }
  } catch (error) {
    console.error(" Error in verifyOrder:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ------------------- User Orders -------------------
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
// -----Listing orders for admin panel------
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ------------------- api for Update Status (Admin) -------------------
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Error in updateStatus:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//  Export all controllers
export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
