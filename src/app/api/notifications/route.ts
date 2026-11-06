import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
export async function GET(){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"}, {status:401});
  const [items,unread]=await Promise.all([prisma.notification.findMany({where:{recipientId:user.id},orderBy:{createdAt:"desc"},take:50,include:{actor:{select:{nickname:true,username:true,avatarUrl:true}}}}),prisma.notification.count({where:{recipientId:user.id,readAt:null}})]);
  return NextResponse.json({notifications:items,unread});
}
export async function PATCH(request:Request){
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"}, {status:401});
  const schema=z.object({id:z.string().uuid().optional(),all:z.boolean().optional()});const parsed=schema.safeParse(await request.json());
  if(!parsed.success||(!parsed.data.id&&!parsed.data.all))return NextResponse.json({error:"请求参数无效。"}, {status:400});
  await prisma.notification.updateMany({where:{recipientId:user.id,readAt:null,...(parsed.data.id?{id:parsed.data.id}:{})},data:{readAt:new Date()}});
  return NextResponse.json({ok:true});
}
