import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
async function allowed(){return (await getCurrentUser())?.role==="ADMIN";}
export async function GET(){if(!await allowed())return NextResponse.json({error:"需要管理员权限。"},{status:403});const settings=await prisma.siteSetting.findMany();return NextResponse.json({settings});}
export async function PUT(request:Request){if(!await allowed())return NextResponse.json({error:"需要管理员权限。"},{status:403});const p=z.object({key:z.string().regex(/^[a-z0-9._-]{1,100}$/),value:z.unknown()}).safeParse(await request.json());if(!p.success)return NextResponse.json({error:"设置参数无效。"},{status:400});const setting=await prisma.siteSetting.upsert({where:{key:p.data.key},create:{key:p.data.key,value:p.data.value as never},update:{value:p.data.value as never}});return NextResponse.json({setting});}
