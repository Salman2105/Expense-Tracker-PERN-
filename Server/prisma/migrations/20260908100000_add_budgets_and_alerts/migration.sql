-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('MONTHLY');

-- CreateTable
CREATE TABLE "Budget" (
    "budgetId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "period" "BudgetPeriod" NOT NULL DEFAULT 'MONTHLY',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("budgetId")
);

-- CreateTable
CREATE TABLE "BudgetAlert" (
    "alertId" UUID NOT NULL,
    "budgetId" UUID NOT NULL,
    "threshold" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetAlert_pkey" PRIMARY KEY ("alertId")
);

-- CreateIndex
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");
CREATE INDEX "Budget_categoryId_idx" ON "Budget"("categoryId");
CREATE INDEX "Budget_startDate_endDate_idx" ON "Budget"("startDate", "endDate");
CREATE UNIQUE INDEX "Budget_userId_categoryId_period_startDate_key" ON "Budget"("userId", "categoryId", "period", "startDate");
CREATE UNIQUE INDEX "BudgetAlert_budgetId_threshold_periodStart_key" ON "BudgetAlert"("budgetId", "threshold", "periodStart");
CREATE INDEX "BudgetAlert_budgetId_periodStart_idx" ON "BudgetAlert"("budgetId", "periodStart");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetAlert" ADD CONSTRAINT "BudgetAlert_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("budgetId") ON DELETE CASCADE ON UPDATE CASCADE;
