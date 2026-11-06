import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){const announcements=await prisma.announcement.findMany({where:{isActive:true},orderBy:{createdAt:"desc"},take:10,select:{id:true,title:true,body:true,createdAt:true,updatedAt:true}});return NextResponse.json({announcements});}
