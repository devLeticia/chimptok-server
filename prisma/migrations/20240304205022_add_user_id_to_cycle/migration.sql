/*
  Warnings:

  - Added the required column `userId` to the `Cycle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minutesAmount" INTEGER NOT NULL,
    "finishAt" DATETIME NOT NULL,
    "interruptedAt" DATETIME NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Cycle_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cycle" ("createdAt", "finishAt", "id", "interruptedAt", "minutesAmount", "taskId") SELECT "createdAt", "finishAt", "id", "interruptedAt", "minutesAmount", "taskId" FROM "Cycle";
DROP TABLE "Cycle";
ALTER TABLE "new_Cycle" RENAME TO "Cycle";
CREATE UNIQUE INDEX "Cycle_id_key" ON "Cycle"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
