import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const messages=await prisma.message.findMany({where:{conversationId:id},orderBy:{createdAt:"asc"},take:300});
  return NextResponse.json({messages});
}
