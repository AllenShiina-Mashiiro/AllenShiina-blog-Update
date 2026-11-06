import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
async function isAdmin(){return (await getCurrentUser())?.role==="ADMIN";}
export async function GET(){if(!await isAdmin())return NextResponse.json({error:"需要管理员权限。"},{status:403});const announcements=await prisma.announcement.findMany({orderBy:{createdAt:"desc"},take:100});return NextResponse.json({announcements});}
export async function POST(request:Request){if(!await isAdmin())return NextResponse.json({error:"需要管理员权限。"},{status:403});const p=z.object({title:z.string().trim().min(1).max(200),body:z.string().trim().min(1).max(10000)}).safeParse(await request.json());if(!p.success)return NextResponse.json({error:"标题或内容无效。"},{status:400});const announcement=await prisma.announcement.create({data:p.data});return NextResponse.json({announcement},{status:201});}
export async function PATCH(request:Request){if(!await isAdmin())return NextResponse.json({error:"需要管理员权限。"},{status:403});const p=z.object({id:z.string().uuid(),isActive:z.boolean()}).safeParse(await request.json());if(!p.success)return NextResponse.json({error:"参数无效。"},{status:400});const announcement=await prisma.announcement.update({where:{id:p.data.id},data:{isActive:p.data.isActive}});return NextResponse.json({announcement});}
export async function DELETE(request:Request){if(!await isAdmin())return NextResponse.json({error:"需要管理员权限。"},{status:403});const p=z.object({id:z.string().uuid()}).safeParse(await request.json());if(!p.success)return NextResponse.json({error:"参数无效。"},{status:400});await prisma.announcement.delete({where:{id:p.data.id}});return NextResponse.json({ok:true});}
