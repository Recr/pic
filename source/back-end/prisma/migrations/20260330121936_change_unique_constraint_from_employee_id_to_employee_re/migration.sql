/*
  Warnings:

  - A unique constraint covering the columns `[employee_re,proposal_id]` on the table `suggestion` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[suggestion] DROP CONSTRAINT [suggestion_employee_id_proposal_id_key];

-- CreateIndex
ALTER TABLE [dbo].[suggestion] ADD CONSTRAINT [suggestion_employee_re_proposal_id_key] UNIQUE NONCLUSTERED ([employee_re], [proposal_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
