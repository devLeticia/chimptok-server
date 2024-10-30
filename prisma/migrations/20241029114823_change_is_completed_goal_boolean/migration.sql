/*
  Warnings:

  - You are about to drop the column `isFinished` on the `Goal` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalName" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("createdAt", "deadline", "goalName", "id", "updatedAt", "userId", "weeklyHours") SELECT "createdAt", "deadline", "goalName", "id", "updatedAt", "userId", "weeklyHours" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE UNIQUE INDEX "Goal_id_key" ON "Goal"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
