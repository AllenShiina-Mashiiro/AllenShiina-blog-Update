import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
const schema=z.object({nickname:z.string().trim().min(1).max(60),bio:z.string().max(500).nullable(),avatarUrl:z.string().url().nullable(),coverUrl:z.string().url().nullable()});
export async function PATCH(request:Request){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"},{status:401});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"资料格式不正确。"},{status:400});
 const profile=await prisma.user.update({where:{id:user.id},data:parsed.data,select:{nickname:true,username:true,bio:true,avatarUrl:true,coverUrl:true}});
 return NextResponse.json({profile});
}
