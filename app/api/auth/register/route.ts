import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/User"

export async function POST (request: NextRequest) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({
                message: "Email and Password are required!"
            }, { status: 400 })
        }

        await connectToDatabase();

        const existingUser = await UserModel.findOne({email});
        if(existingUser){
            return NextResponse.json({
                message: "User already exist with this email"
            }, { status: 400});
        }

        await UserModel.create({
            email,
            password,
            role: "user"
        });

        return NextResponse.json({
            message: "User registered successfully",
        }, { status: 201 })
    } catch (error) {
        console.error("Registration Error", error);
        return NextResponse.json({
            message: "Failed to register the user",
        }, { status: 500 })
    }
}