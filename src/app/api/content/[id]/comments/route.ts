import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
const schema=z.object({body:z.string().trim().min(1).max(5000),parentId:z.string().uuid().optional()});
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const comments=await prisma.comment.findMany({where:{entryId:id,parentId:null},orderBy:{createdAt:"asc"},include:{author:{select:{id:true,nickname:true,username:true,avatarUrl:true}},replies:{orderBy:{createdAt:"asc"},include:{author:{select:{id:true,nickname:true,username:true,avatarUrl:true}}}}}});
  return NextResponse.json({comments});
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录后评论。"}, {status:401});
  const {id}=await params;const entry=await prisma.contentEntry.findFirst({where:{id,status:"PUBLISHED"},select:{id:true,authorId:true,title:true,slug:true}});
  if(!entry)return NextResponse.json({error:"文章不存在。"}, {status:404});
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"评论内容无效。"}, {status:400});
  let recipientId=entry.authorId;
  if(parsed.data.parentId){const parent=await prisma.comment.findFirst({where:{id:parsed.data.parentId,entryId:id},select:{id:true,authorId:true}});if(!parent)return NextResponse.json({error:"回复目标不存在。"}, {status:404});recipientId=parent.authorId;}
  const comment=await prisma.comment.create({data:{entryId:id,authorId:user.id,body:parsed.data.body,parentId:parsed.data.parentId}});
  if(recipientId!==user.id)await prisma.notification.create({data:{recipientId,actorId:user.id,type:parsed.data.parentId?"REPLY":"COMMENT",title:parsed.data.parentId?"有人回复了文章":"有人评论了你的文章",body:parsed.data.body.slice(0,450),targetUrl:`/entry/${entry.slug}`}});
  return NextResponse.json({comment},{status:201});
}
