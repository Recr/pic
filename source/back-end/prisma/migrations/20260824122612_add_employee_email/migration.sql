/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `employee` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[employee] ADD [email] NVARCHAR(100);

-- CreateIndex
EXEC(N'CREATE UNIQUE NONCLUSTERED INDEX [employee_email_key] ON [dbo].[employee]([email]) WHERE [email] IS NOT NULL');

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
