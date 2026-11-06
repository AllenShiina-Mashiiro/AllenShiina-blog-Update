import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createVerificationCode, hashVerificationCode } from "@/lib/verification";
const bodySchema = z.object({ email: z.string().email().max(320) });
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "请输入有效邮箱地址。" }, { status: 400 });
    const email = parsed.data.email.trim().toLowerCase();
    const now = new Date();
    const recent = await prisma.emailVerificationCode.findFirst({ where: { email, purpose: "REGISTER", createdAt: { gt: new Date(now.getTime() - 60_000) } } });
    if (recent) return NextResponse.json({ error: "验证码发送过于频繁，请稍后再试。" }, { status: 429 });
    const sentInHour = await prisma.emailVerificationCode.count({ where: { email, purpose: "REGISTER", createdAt: { gt: new Date(now.getTime() - 60 * 60_000) } } });
    if (sentInHour >= 5) return NextResponse.json({ error: "该邮箱本小时验证码次数已达上限。" }, { status: 429 });
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) return NextResponse.json({ error: "该邮箱已注册，请直接登录。" }, { status: 409 });
    const host = process.env.SMTP_HOST, from = process.env.SMTP_FROM, user = process.env.SMTP_USER, pass = process.env.SMTP_PASSWORD;
    if (!host || !from || !user || !pass) return NextResponse.json({ error: "邮件服务尚未配置，请先设置 SMTP 环境变量。" }, { status: 503 });
    const code = createVerificationCode();
    const codeHash = hashVerificationCode(email, "REGISTER", code);
    await prisma.emailVerificationCode.create({ data: { email, codeHash, purpose: "REGISTER", expiresAt: new Date(now.getTime() + 10 * 60_000) } });
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({ host, port, secure: process.env.SMTP_SECURE === "true", auth: { user, pass } });
    await transporter.sendMail({ from, to: email, subject: "NEXUS 注册验证码", text: `你的 NEXUS 注册验证码是：${code}\n验证码 10 分钟内有效，请勿向他人透露。`, html: `<div style="font-family:Arial,sans-serif"><h2>NEXUS 邮箱验证</h2><p>你的注册验证码：</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px">${code}</div><p>验证码 10 分钟内有效，请勿向他人透露。</p></div>` });
    return NextResponse.json({ ok: true, message: "验证码已发送，请检查邮箱。" });
  } catch (error) {
    console.error("verification-code error", error);
    return NextResponse.json({ error: "验证码发送失败，请检查邮件服务配置。" }, { status: 500 });
  }
}
