import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import OrderModel from "@/models/Order";
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest){
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest("hex")
        
        if (expectedSignature !== signature) {
            return NextResponse.json({
                message: "Invalid Signature"
            }, { status: 400 });
        }

        const event = JSON.parse(body);
        if(event.event === "payment.captured") {
            const payment = event.payload.payment.entity;

            const order = await OrderModel.findOneAndUpdate(
                { razorpayOrderId: payment.order_id},
                {   razorpayPaymentId: payment.id,
                    status: "completed"
                }
            ).populate([
                { path: "productId", select: "name"},
                { path: "userId", select: "email" }
            ]);

            if (order) {
                const transporter = nodemailer.createTransport({
                    host: process.env.MAILTRAP_HOST,
                    port: Number(process.env.MAILTRAP_PORT),
                    auth: {
                        user: process.env.MAILTRAP_USERNAME,
                        pass: process.env.MAILTRAP_PASSWORD
                    }
                });

                await transporter.sendMail({
                    from: "deepaksingh12836@gmail.com",
                    to: order.userId.email,
                    subject: "Order Completed",
                    text: `Your order ${order.productId.name} has been
                    placed successfully`
                });

                return NextResponse.json({
                    message: "success"
                }, { status: 200 });
            }
        }
    } catch (error) {
        console.log("Error in webhook", error);
        return NextResponse.json({
            message: "Something went wrong"
        }, { status: 500 });
    }
}