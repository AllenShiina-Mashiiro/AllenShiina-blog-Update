ALTER TABLE "EmailVerificationCode" ADD COLUMN "requestIpHash" VARCHAR(64);
CREATE INDEX "EmailVerificationCode_requestIpHash_purpose_createdAt_idx" ON "EmailVerificationCode"("requestIp", "purpose", "createdAt");
