/*
  Warnings:

  - You are about to drop the column `isFirstAccess` on the `employee` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- Drop default constraint first
ALTER TABLE employee
DROP CONSTRAINT employee_isFirstAccess_df;

-- AlterTable
ALTER TABLE [dbo].[employee] DROP COLUMN [isFirstAccess];
ALTER TABLE [dbo].[employee] ADD [must_change_password] BIT NOT NULL CONSTRAINT [employee_must_change_password_df] DEFAULT 1;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
