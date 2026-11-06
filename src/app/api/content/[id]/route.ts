import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
const schema=z.object({title:z.string().trim().min(1).max(200).optional(),excerpt:z.string().max(500).nullable().optional(),body:z.string().min(1).max(200000).optional(),coverUrl:z.string().url().nullable().optional(),category:z.enum(["STUDY","RESOURCE","LIFE","ARTICLE"]).optional(),status:z.enum(["DRAFT","PUBLISHED","ARCHIVED"]).optional()});
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"}, {status:401});
  const {id}=await params;const existing=await prisma.contentEntry.findUnique({where:{id},select:{id:true,authorId:true,publishedAt:true}});
  if(!existing)return NextResponse.json({error:"内容不存在。"}, {status:404});
  if(existing.authorId!==user.id&&user.role!=="ADMIN")return NextResponse.json({error:"无权修改此内容。"}, {status:403});
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"提交内容格式不正确。"}, {status:400});
  const data=parsed.data;const entry=await prisma.contentEntry.update({where:{id},data:{...data,...(data.status==="PUBLISHED"&&!existing.publishedAt?{publishedAt:new Date()}:{}),...(data.status==="DRAFT"?{publishedAt:null}:{})}});
  return NextResponse.json({entry});
}
export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"}, {status:401});
  const {id}=await params;const existing=await prisma.contentEntry.findUnique({where:{id},select:{id:true,authorId:true}});
  if(!existing)return NextResponse.json({error:"内容不存在。"}, {status:404});
  if(existing.authorId!==user.id&&user.role!=="ADMIN")return NextResponse.json({error:"无权删除此内容。"}, {status:403});
  await prisma.contentEntry.delete({where:{id}});return NextResponse.json({ok:true});
}
