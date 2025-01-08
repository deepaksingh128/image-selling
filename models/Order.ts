import mongoose, { Schema, models, model } from "mongoose";

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    varient: {
        type: {
            type: String,
            required: true,
            enum: ["SQUARE", "WIDE", "PORTRAIT"]
        },
        price: { type: Number, required: true },
        license: {
            type: String,
            required: true,
            enum: ["personal", "commercial"]
        }
    },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    amount: { type: Number, required: true }, // payed by user, because price might be different from amount paid if we introduce coupon 
    status: {
        type: String,
        required: true,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    downloadUrl: { type: String },
    previewUrl: { type: String }
}, { timestamps: true });


const Order = models?.Order || model("Order", orderSchema);

export default Order;