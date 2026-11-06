import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
async function isAdmin(){return (await getCurrentUser())?.role==="ADMIN";}
export async function GET(){if(!await isAdmin())return NextResponse.json({error:"需要管理员权限。"},{status:403});const entries=await prisma.contentEntry.findMany({orderBy:{updatedAt:"desc"},take:200,select:{id:true,title:true,slug:true,category:true,status:true,createdAt:true,updatedAt:true,author:{select:{nickname:true,username:true}}}});return NextResponse.json({entries});}
export async function PATCH(request:Request){if(!await isAdmin())return NextResponse.json({error:"需要管理员权限。"},{status:403});const p=z.object({id:z.string().uuid(),status:z.enum(["DRAFT","PUBLISHED","ARCHIVED"])}).safeParse(await request.json());if(!p.success)return NextResponse.json({error:"参数无效。"},{status:400});const entry=await prisma.contentEntry.update({where:{id:p.data.id},data:{status:p.data.status,publishedAt:p.data.status==="PUBLISHED"?new Date():p.data.status==="DRAFT"?null:undefined}});return NextResponse.json({entry:{id:entry.id,status:entry.status}});}
export async function DELETE(request:Request){if(!await isAdmin())return NextResponse.json({error:"需要管理员权限。"},{status:403});const p=z.object({id:z.string().uuid()}).safeParse(await request.json());if(!p.success)return NextResponse.json({error:"内容 ID 无效。"},{status:400});await prisma.contentEntry.delete({where:{id:p.data.id}});return NextResponse.json({ok:true});}
