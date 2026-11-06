import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(_request:Request,{params}:{params:Promise<{username:string}>}){
  const {username}=await params;const user=await prisma.user.findUnique({where:{username:username.toLowerCase()},select:{id:true,username:true,nickname:true,avatarUrl:true,coverUrl:true,bio:true,createdAt:true,entries:{where:{status:"PUBLISHED"},orderBy:{publishedAt:"desc"},select:{id:true,title:true,slug:true,excerpt:true,category:true,publishedAt:true,viewCount:true}}}});
  if(!user)return NextResponse.json({error:"用户不存在。"}, {status:404});
  return NextResponse.json({profile:user});
}
