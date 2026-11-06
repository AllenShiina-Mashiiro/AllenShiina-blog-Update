ALTER TABLE "EmailVerificationCode" ADD COLUMN "requestIp" VARCHAR(64);
CREATE INDEX "EmailVerificationCode_requestIp_purpose_createdAt_idx" ON "EmailVerificationCode"("requestIp", "purpose", "createdAt");
