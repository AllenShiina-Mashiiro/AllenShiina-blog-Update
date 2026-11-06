import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
export async function GET(){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({user:null});
  return NextResponse.json({user:{id:user.id,nickname:user.nickname,username:`@${user.username}`,email:user.email,avatarUrl:user.avatarUrl,role:user.role}});
}
