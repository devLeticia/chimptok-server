-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmationCode" TEXT NOT NULL,
    "isDarkMode" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("confirmationCode", "createdAt", "email", "emailConfirmed", "id", "isDarkMode", "password", "updatedAt", "username") SELECT "confirmationCode", "createdAt", "email", "emailConfirmed", "id", "isDarkMode", "password", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_confirmationCode_key" ON "User"("confirmationCode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
