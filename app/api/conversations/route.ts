import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req:Request){
  const url=new URL(req.url);
  const q=url.searchParams.get("q")||"";
  const status=url.searchParams.get("status")||"";
  const pageId=url.searchParams.get("pageId")||"";
  const where:any={};
  if(status)where.status=status;
  if(pageId)where.page={pageId};
  if(q){
    where.OR=[
      {lastMessage:{contains:q,mode:"insensitive"}},
      {customer:{name:{contains:q,mode:"insensitive"}}},
      {customer:{platformId:{contains:q,mode:"insensitive"}}},
      {page:{pageName:{contains:q,mode:"insensitive"}}}
    ];
  }
  const conversations=await prisma.conversation.findMany({where,orderBy:{lastMessageAt:"desc"},take:100,include:{page:{select:{pageName:true,pageId:true,channel:true}},customer:{select:{name:true,platformId:true}}}});
  return NextResponse.json({conversations});
}
