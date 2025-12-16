-- GoBD-Konformität: Fortlaufende Rechnungsnummern & Audit-Log

-- AlterTable: Invoices - Füge GoBD-Felder hinzu
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "sequentialNumber" SERIAL;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "pdfHash" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable: Invoice Audit Log
CREATE TABLE IF NOT EXISTS "invoice_audit_logs" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "performedBy" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "invoice_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "invoices_sequentialNumber_idx" ON "invoices"("sequentialNumber");
CREATE INDEX IF NOT EXISTS "invoice_audit_logs_invoiceId_idx" ON "invoice_audit_logs"("invoiceId");
CREATE INDEX IF NOT EXISTS "invoice_audit_logs_timestamp_idx" ON "invoice_audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "invoice_audit_logs" ADD CONSTRAINT "invoice_audit_logs_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

