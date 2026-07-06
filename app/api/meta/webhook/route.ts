import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyInbox } from "@/lib/realtime";

export async function GET(req:Request){
  const url=new URL(req.url);
  const mode=url.searchParams.get("hub.mode");
  const token=url.searchParams.get("hub.verify_token");
  const challenge=url.searchParams.get("hub.challenge");
  if(mode==="subscribe" && token===process.env.META_VERIFY_TOKEN && challenge){
    return new Response(challenge,{status:200});
  }
  return new Response("Forbidden",{status:403});
}

export async function POST(req:Request){
  const payload=await req.json();
  const entries=Array.isArray(payload.entry)?payload.entry:[];
  for(const entry of entries){
    const pageId=String(entry.id||"");
    const events=[...(entry.messaging||[]), ...(entry.standby||[])];
    for(const ev of events){
      await handleEvent(pageId, ev, payload.object || "page");
    }
  }
  return NextResponse.json({ok:true});
}

async function handleEvent(pageId:string, ev:any, objectType:string){
  if(!pageId || !ev?.sender?.id) return;
  if(ev?.message?.is_echo) return;
  const senderId=String(ev.sender.id);
  const page=await prisma.pageConnection.findUnique({where:{pageId}});
  if(!page) return;
  const channel=page.channel || (objectType==="instagram"?"instagram":"messenger");
  const text=ev?.message?.text || ev?.postback?.title || ev?.postback?.payload || (ev?.message?.attachments?.length?"[Attachment]":"");
  if(!text && !ev?.message?.attachments?.length) return;
  const createdAt=ev.timestamp ? new Date(Number(ev.timestamp)) : new Date();
  const customer=await prisma.customer.upsert({
    where:{platformId_channel:{platformId:senderId,channel}},
    update:{},
    create:{platformId:senderId,channel}
  });
  let conv=await prisma.conversation.findFirst({where:{pageDbId:page.id,customerId:customer.id,channel}});
  if(!conv){
    conv=await prisma.conversation.create({data:{pageDbId:page.id,customerId:customer.id,channel,status:"OPEN",lastMessage:text,lastMessageAt:createdAt,lastCustomerMessageAt:createdAt}});
  }
  const message=await prisma.message.create({data:{conversationId:conv.id,direction:"incoming",text,metaMessageId:ev?.message?.mid||null,senderPlatformId:senderId,raw:ev,createdAt}});
  await prisma.conversation.update({where:{id:conv.id},data:{lastMessage:text,lastMessageAt:createdAt,lastCustomerMessageAt:createdAt,status:"OPEN"}});
  await notifyInbox("new-message",{conversationId:conv.id,messageId:message.id});
}
