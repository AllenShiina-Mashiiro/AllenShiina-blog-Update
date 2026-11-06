import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
async function admin(){const user=await getCurrentUser();return user?.role==="ADMIN"?user:null;}
export async function GET(){
  const actor=await admin();if(!actor)return NextResponse.json({error:"需要管理员权限。"}, {status:403});
  const users=await prisma.user.findMany({orderBy:{createdAt:"desc"},take:200,select:{id:true,email:true,username:true,nickname:true,role:true,isBanned:true,createdAt:true,emailVerifiedAt:true}});
  return NextResponse.json({users});
}
export async function PATCH(request:Request){
  const actor=await admin();if(!actor)return NextResponse.json({error:"需要管理员权限。"}, {status:403});
  const parsed=z.object({id:z.string().uuid(),role:z.enum(["USER","ADMIN"]).optional(),isBanned:z.boolean().optional()}).refine(x=>x.role!==undefined||x.isBanned!==undefined).safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"参数无效。"}, {status:400});
  if(parsed.data.id===actor.id&&parsed.data.isBanned===true)return NextResponse.json({error:"不能封禁当前管理员账号。"}, {status:400});
  const user=await prisma.user.update({where:{id:parsed.data.id},data:{...(parsed.data.role?{role:parsed.data.role}:{}),...(parsed.data.isBanned!==undefined?{isBanned:parsed.data.isBanned}:{})},select:{id:true,username:true,nickname:true,role:true,isBanned:true}});
  return NextResponse.json({user});
}
export async function DELETE(request:Request){
  const actor=await admin();if(!actor)return NextResponse.json({error:"需要管理员权限。"}, {status:403});
  const parsed=z.object({id:z.string().uuid()}).safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"用户 ID 无效。"}, {status:400});
  if(parsed.data.id===actor.id)return NextResponse.json({error:"不能删除当前登录的管理员账号。"}, {status:400});
  await prisma.user.delete({where:{id:parsed.data.id}});
  return NextResponse.json({ok:true});
}
