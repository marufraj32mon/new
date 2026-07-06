import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptText } from "@/lib/crypto";
import { sendMetaTextMessage } from "@/lib/meta";
import { notifyInbox } from "@/lib/realtime";

export async function POST(req:Request){
  const body=await req.json();
  const conversationId=String(body.conversationId||"");
  const text=String(body.text||"").trim();
  const agentName=String(body.agentName||"Staff").trim() || "Staff";
  if(!conversationId||!text)return NextResponse.json({error:"conversationId and text are required"},{status:400});
  const conv=await prisma.conversation.findUnique({where:{id:conversationId},include:{page:true,customer:true}});
  if(!conv)return NextResponse.json({error:"Conversation not found"},{status:404});
  const pageToken=decryptText(conv.page.accessTokenEnc);
  const meta=await sendMetaTextMessage({pageToken,recipientId:conv.customer.platformId,text});
  const msg=await prisma.message.create({data:{conversationId:conv.id,direction:"outgoing",text,agentName,metaMessageId:meta?.message_id||null,raw:meta}});
  await prisma.conversation.update({where:{id:conv.id},data:{lastMessage:text,lastMessageAt:new Date(),assignedTo:agentName,status:conv.status==="OPEN"?"PENDING":conv.status}});
  await notifyInbox("message-sent",{conversationId:conv.id,messageId:msg.id});
  return NextResponse.json({ok:true,message:msg});
}
