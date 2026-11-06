import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeHandle, isValidHandle } from "@/lib/handles";
import { hashPassword } from "@/lib/password";
import { hashVerificationCode } from "@/lib/verification";
import { createUserSession } from "@/lib/session";
const schema = z.object({ nickname: z.string().trim().min(1).max(60), email: z.string().email().max(320), username: z.string().trim().min(3).max(30), password: z.string().min(10).max(128), code: z.string().regex(/^\d{6}$/) });
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "请检查昵称、邮箱、ID、密码和六位验证码。" }, { status: 400 });
    const { nickname, password, code } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();
    const username = normalizeHandle(parsed.data.username);
    if (!isValidHandle(username)) return NextResponse.json({ error: "ID 仅支持 3–30 位小写英文字母、数字和下划线，不需要输入 @。" }, { status: 400 });
    const codeHash = hashVerificationCode(email, "REGISTER", code);
    const result = await prisma.$transaction(async tx => {
      const record = await tx.emailVerificationCode.findFirst({ where: { email, purpose: "REGISTER", consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
      if (!record || record.attempts >= 5) return { error: "验证码无效或已过期，请重新获取。" as const };
      if (record.codeHash !== codeHash) {
        await tx.emailVerificationCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
        return { error: "验证码错误，请重新输入。" as const };
      }
      await tx.emailVerificationCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
      const passwordHash = await hashPassword(password);
      const user = await tx.user.create({ data: { nickname, email, username, passwordHash, emailVerifiedAt: new Date() }, select: { id: true, nickname: true, username: true, email: true } });
      return { user };
    }, { isolationLevel: "Serializable" });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const user = result.user;
    await createUserSession(user.id);
    return NextResponse.json({ ok: true, user: { ...user, username: `@${user.username}` } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint")) return NextResponse.json({ error: "邮箱或 ID 已被使用。" }, { status: 409 });
    if (message.includes("验证码")) return NextResponse.json({ error: message }, { status: 400 });
    console.error("register error", error);
    return NextResponse.json({ error: "注册失败，请稍后重试。" }, { status: 500 });
  }
}
