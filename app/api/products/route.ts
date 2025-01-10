import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import ProductModel, { IProduct } from "@/models/Product"
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
    try {
        await connectToDatabase();

        const products = await ProductModel.find({}).lean();
        if(!products || products.length === 0){
            return NextResponse.json({
                message: "No product found"
            }, {status: 404});
        }

        return NextResponse.json({
            products,
        }, { status: 200 });
    } catch (error) {
        console.error("Error getting products", error);
        return NextResponse.json({
            message: "Something went wrong"
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if(!session || session.user?.role !== "admin"){
            return NextResponse.json({
                message: "Unauthorized"
            }, { status: 401 });
        }

        await connectToDatabase();

        const body: IProduct = await request.json();
        const { name, description, imageUrl, variants} = await body;
        if(
            !name ||
            !description ||
            !imageUrl || 
            variants.length === 0
        ) {
            return NextResponse.json({
                message: "All fields are required",
            }, { status: 400 });
        }

        const newProduct = await ProductModel.create({
            name,
            description,
            imageUrl,
            variants,
        });
        return NextResponse.json({
            newProduct
        }, { status: 201});
    } catch (error) {
        console.error("Error creating product", error);
        return Response.json({
            message: "Something went wrong",
        }, { status: 500 })
    }
}