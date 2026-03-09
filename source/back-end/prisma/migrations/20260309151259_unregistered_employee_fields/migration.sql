/*
  Warnings:

  - Added the required column `employee_re` to the `suggestion` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[suggestion] ALTER COLUMN [employee_id] INT NULL;
ALTER TABLE [dbo].[suggestion] ADD [employee_name] NVARCHAR(100),
[employee_re] INT NOT NULL,
[employee_shift] NVARCHAR(20);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
