import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const PUBLIC_KEYS=["site.title","site.description","site.about","site.background","site.backgroundSecondary","site.logo","site.backgroundOpacity","site.accentColor","site.defaultTheme"];
export async function GET(){
 const settings=await prisma.siteSetting.findMany({where:{key:{in:PUBLIC_KEYS}}});
 return NextResponse.json({settings});
}
