import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptText } from "@/lib/crypto";

export async function GET(){
  const pages=await prisma.pageConnection.findMany({orderBy:{createdAt:"desc"},select:{id:true,pageId:true,pageName:true,channel:true,isActive:true,createdAt:true}});
  return NextResponse.json({pages});
}
export async function POST(req:Request){
  const body=await req.json();
  const pageName=String(body.pageName||"").trim();
  const pageId=String(body.pageId||"").trim();
  const channel=String(body.channel||"messenger").trim();
  const accessToken=String(body.accessToken||"").trim();
  if(!pageName||!pageId||!accessToken)return NextResponse.json({error:"pageName, pageId and accessToken are required"},{status:400});
  const page=await prisma.pageConnection.upsert({
    where:{pageId},
    update:{pageName,channel,accessTokenEnc:encryptText(accessToken),isActive:true},
    create:{pageName,pageId,channel,accessTokenEnc:encryptText(accessToken)}
  });
  return NextResponse.json({ok:true,page:{id:page.id,pageId:page.pageId,pageName:page.pageName,channel:page.channel}});
}
