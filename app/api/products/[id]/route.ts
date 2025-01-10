import { connectToDatabase } from "@/lib/db";
import ProductModel from "@/models/Product"
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }>}
) {
    try {
        const { id } = await props.params;
        await connectToDatabase();

        const product = await ProductModel.findById(id);
        if(!product){
            return NextResponse.json({
                message: "No product found"
            }, { status: 404 })
        }

        return NextResponse.json({
            product,
        }, { status: 200 })

    } catch (error) {
        console.error("Error getting product", error);
        return NextResponse.json({
            message: "An unexpected error occured while fetching this product"
        }, { status: 500 });
    }
}