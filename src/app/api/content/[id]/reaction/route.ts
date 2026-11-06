import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"}, {status:401});
  const {id}=await params;const entry=await prisma.contentEntry.findFirst({where:{id,status:"PUBLISHED"},select:{id:true,authorId:true,slug:true}});
  if(!entry)return NextResponse.json({error:"文章不存在。"}, {status:404});
  const existing=await prisma.reaction.findUnique({where:{entryId_userId:{entryId:id,userId:user.id}}});
  if(existing){await prisma.reaction.delete({where:{id:existing.id}});return NextResponse.json({active:false});}
  await prisma.reaction.create({data:{entryId:id,userId:user.id}});
  if(entry.authorId!==user.id)await prisma.notification.create({data:{recipientId:entry.authorId,actorId:user.id,type:"LIKE",title:"有人喜欢了你的文章",targetUrl:`/entry/${entry.slug}`}});
  return NextResponse.json({active:true});
}
