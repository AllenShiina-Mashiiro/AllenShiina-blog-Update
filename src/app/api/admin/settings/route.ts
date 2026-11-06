import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
async function allowed(){return (await getCurrentUser())?.role==="ADMIN";}
const settingSchema=z.object({key:z.string().regex(/^[a-z0-9._-]{1,100}$/),value:z.unknown()});
export async function GET(){if(!await allowed())return NextResponse.json({error:"需要管理员权限。"},{status:403});const settings=await prisma.siteSetting.findMany();return NextResponse.json({settings});}
export async function PUT(request:Request){
 if(!await allowed())return NextResponse.json({error:"需要管理员权限。"},{status:403});
 const body=await request.json();
 const batch=z.object({entries:z.array(settingSchema).min(1).max(20)}).safeParse(body);
 if(batch.success){
  const settings=await prisma.$transaction(batch.data.entries.map(item=>prisma.siteSetting.upsert({where:{key:item.key},create:{key:item.key,value:item.value as never},update:{value:item.value as never}})));
  return NextResponse.json({settings});
 }
 const single=settingSchema.safeParse(body);
 if(!single.success)return NextResponse.json({error:"设置参数无效。"},{status:400});
 const setting=await prisma.siteSetting.upsert({where:{key:single.data.key},create:{key:single.data.key,value:single.data.value as never},update:{value:single.data.value as never}});
 return NextResponse.json({setting});
}
