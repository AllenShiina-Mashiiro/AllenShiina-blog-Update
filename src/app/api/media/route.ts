import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
const allowed = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"],["image/gif","gif"],["image/avif","avif"]]);
function validImage(bytes:Buffer,mime:string){
 if(mime==="image/jpeg")return bytes.length>3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(mime==="image/png")return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(mime==="image/gif")return bytes.subarray(0,3).toString()==="GIF";
 if(mime==="image/webp")return bytes.subarray(0,4).toString()==="RIFF"&&bytes.subarray(8,12).toString()==="WEBP";
 if(mime==="image/avif")return bytes.subarray(4,12).toString().includes("ftyp")&&bytes.subarray(8,12).toString().startsWith("avi");
 return false;
}
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"请先登录后上传图片。"},{status:401});
 const form=await request.formData();const file=form.get("file");
 if(!(file instanceof File))return NextResponse.json({error:"请选择图片文件。"},{status:400});
 if(file.size<1||file.size>20*1024*1024)return NextResponse.json({error:"图片大小必须在 20MB 以内。"},{status:400});
 const extension=allowed.get(file.type);if(!extension)return NextResponse.json({error:"仅支持 JPG、PNG、WebP、GIF、AVIF 图片。"},{status:415});
 const bytes=Buffer.from(await file.arrayBuffer());if(!validImage(bytes,file.type))return NextResponse.json({error:"图片文件内容与格式不匹配。"},{status:415});
 const filename=randomUUID()+"."+extension;const directory=process.env.MEDIA_DIR||"/app/public/uploads";
 await mkdir(directory,{recursive:true});await writeFile(path.join(directory,filename),bytes,{flag:"wx"});
 const url=new URL("/uploads/"+filename,process.env.APP_URL||request.url).toString();
 const asset=await prisma.mediaAsset.create({data:{url,mimeType:file.type,sizeBytes:file.size,alt:file.name.slice(0,300)}});
 return NextResponse.json({asset},{status:201});
}
