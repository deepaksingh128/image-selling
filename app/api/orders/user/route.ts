import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import OrderModel from "@/models/Order";
import { connectToDatabase } from "@/lib/db";


export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({
                message: "Unauthorized"
            }, { status: 401 })
        }
        const id = session.user.id;
        await connectToDatabase();

        const orders = await OrderModel.find({ userId: id })
        .populate({
            path: "productId",
            select: "name imageUrl",
            options: { strictPopulate: false}
        })
        .sort({ createdAt: -1})
        .lean()

        if(!orders){
            return NextResponse.json({
                message: "No orders found"
            }, { status: 400 })
        }

        return NextResponse.json({
            orders,
        }, { status: 200 })
    } catch (error) {
        console.error("Error fetching orders", error);
        return NextResponse.json({
            message: "Something went wrong"
        }, { status: 500 });
    }
}