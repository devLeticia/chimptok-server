-- CreateTable
CREATE TABLE "Cancelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT NOT NULL,
    "accountCreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT
);

-- CreateTable
CREATE TABLE "CancelationReason" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CancelationReasons" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CancelationReasons_A_fkey" FOREIGN KEY ("A") REFERENCES "Cancelation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CancelationReasons_B_fkey" FOREIGN KEY ("B") REFERENCES "CancelationReason" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cancelation_id_key" ON "Cancelation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CancelationReason_id_key" ON "CancelationReason"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CancelationReason_reason_key" ON "CancelationReason"("reason");

-- CreateIndex
CREATE UNIQUE INDEX "_CancelationReasons_AB_unique" ON "_CancelationReasons"("A", "B");

-- CreateIndex
CREATE INDEX "_CancelationReasons_B_index" ON "_CancelationReasons"("B");
