import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { normalizeHandle } from "@/lib/handles";
import { randomBytes } from "node:crypto";
const categorySchema = z.enum(["STUDY","RESOURCE","LIFE","ARTICLE"]);
const createSchema = z.object({ title:z.string().trim().min(1).max(200), excerpt:z.string().max(500).optional(), body:z.string().min(1).max(200000), coverUrl:z.string().url().optional().or(z.literal("")), category:categorySchema, status:z.enum(["DRAFT","PUBLISHED"]).default("DRAFT") });
function slugBase(title:string){const ascii=normalizeHandle(title.normalize("NFKD").replace(/[^\x00-\x7F]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-|-$/g,""));return (ascii||"entry").slice(0,180)}
export async function GET(request:Request){
  const url=new URL(request.url);const raw=url.searchParams.get("category");const category=raw?categorySchema.safeParse(raw.toUpperCase()):null;
  if(category&&!category.success)return NextResponse.json({error:"无效分类。"}, {status:400});
  const entries=await prisma.contentEntry.findMany({where:{status:"PUBLISHED",...(category?.success?{category:category.data}:{})},orderBy:{publishedAt:"desc"},take:50,select:{id:true,title:true,slug:true,excerpt:true,coverUrl:true,category:true,viewCount:true,publishedAt:true,updatedAt:true,author:{select:{nickname:true,username:true,avatarUrl:true}},_count:{select:{comments:true,reactions:true}}}});
  return NextResponse.json({entries});
}
export async function POST(request:Request){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"}, {status:401});
  const parsed=createSchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"文章内容不完整或超出长度限制。"}, {status:400});
  const data=parsed.data;const base=slugBase(data.title);let slug=`${base}-${randomBytes(3).toString("hex")}`;
  for(let i=0;i<4&&await prisma.contentEntry.findUnique({where:{slug},select:{id:true}});i++)slug=`${base}-${randomBytes(4).toString("hex")}`;
  const entry=await prisma.contentEntry.create({data:{authorId:user.id,title:data.title,slug,excerpt:data.excerpt,body:data.body,coverUrl:data.coverUrl||null,category:data.category,status:data.status,publishedAt:data.status==="PUBLISHED"?new Date():null}});
  return NextResponse.json({entry}, {status:201});
}
