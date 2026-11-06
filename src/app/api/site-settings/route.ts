import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){const settings=await prisma.siteSetting.findMany({where:{key:{in:["site.title","site.description","site.background","site.logo","site.theme"]}}});return NextResponse.json({settings});}
