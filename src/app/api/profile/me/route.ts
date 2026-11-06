import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { destroyUserSession, getCurrentUser } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
const schema=z.object({nickname:z.string().trim().min(1).max(60),bio:z.string().max(500).nullable(),avatarUrl:z.string().url().nullable(),coverUrl:z.string().url().nullable()});
export async function PATCH(request:Request){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"},{status:401});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"资料格式不正确。"},{status:400});
 const profile=await prisma.user.update({where:{id:user.id},data:parsed.data,select:{nickname:true,username:true,bio:true,avatarUrl:true,coverUrl:true}});
 return NextResponse.json({profile});
}

export async function DELETE(request:Request){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录。"},{status:401});
 const parsed=z.object({confirmation:z.literal("DELETE"),password:z.string().max(128).optional()}).safeParse(await request.json());
 if(!parsed.success)return NextResponse.json({error:"请输入 DELETE 确认删除。"},{status:400});
 const account=await prisma.user.findUnique({where:{id:user.id},select:{passwordHash:true,role:true}});
 if(!account)return NextResponse.json({error:"账户不存在。"},{status:404});
 if(account.passwordHash&&(!parsed.data.password||!(await verifyPassword(parsed.data.password,account.passwordHash))))return NextResponse.json({error:"当前密码不正确。"},{status:403});
 if(account.role==="ADMIN"){const admins=await prisma.user.count({where:{role:"ADMIN",isBanned:false}});if(admins<=1)return NextResponse.json({error:"这是站点最后一名管理员，请先将管理员权限移交给其他账户。"},{status:400});}
 await destroyUserSession();
 await prisma.user.delete({where:{id:user.id}});
 return NextResponse.json({ok:true});
}
