-- AddColumn
ALTER TABLE "Member" ADD COLUMN "crm" TEXT;
ALTER TABLE "Member" ADD COLUMN "crmUf" TEXT;
ALTER TABLE "Member" ADD COLUMN "crmVerifiedName" TEXT;
ALTER TABLE "Member" ADD COLUMN "crmVerifiedAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "Member_crm_crmUf_key" ON "Member"("crm", "crmUf");
