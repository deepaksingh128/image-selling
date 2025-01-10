import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import OrderModel from "@/models/Order";
import { Currency } from "lucide-react";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request){

    try {
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({
                message: "Unauthorized",
            }, { status: 401 });
        }

        const { productId, varient } = await request.json();
        await connectToDatabase();

        // create order (razorpay)
        const order = await razorpay.orders.create({
            amount: varient.price * 100,
            currency: "USD",
            receipt: `receipt-${Date.now()}`,
            notes: {
                productId: productId.toString()
            }
        });

        const newOrder = await OrderModel.create({
            userId: session.user.id,
            productId,
            varient,
            razorpayOrderId: order.id,
            amount: varient.price * 100,
            status: "pending"
        });
        
        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            dbOrderId: newOrder._id
        });

    } catch (error) {
        console.error("Error while creating order", error);
        return NextResponse.json({
            message: "Something went wrong"
        }, { status: 500 });
    }
}