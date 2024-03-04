/*
  Warnings:

  - Added the required column `isFinished` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finishAt` to the `Cycle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minutesAmount` to the `Cycle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalName" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isFinished" BOOLEAN NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("createdAt", "deadline", "goalName", "id", "updatedAt", "userId", "weeklyHours") SELECT "createdAt", "deadline", "goalName", "id", "updatedAt", "userId", "weeklyHours" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE UNIQUE INDEX "Goal_id_key" ON "Goal"("id");
CREATE TABLE "new_Cycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minutesAmount" INTEGER NOT NULL,
    "finishAt" DATETIME NOT NULL,
    "interruptedAt" DATETIME NOT NULL,
    "taskId" TEXT NOT NULL,
    CONSTRAINT "Cycle_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cycle" ("createdAt", "id", "interruptedAt", "taskId") SELECT "createdAt", "id", "interruptedAt", "taskId" FROM "Cycle";
DROP TABLE "Cycle";
ALTER TABLE "new_Cycle" RENAME TO "Cycle";
CREATE UNIQUE INDEX "Cycle_id_key" ON "Cycle"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
