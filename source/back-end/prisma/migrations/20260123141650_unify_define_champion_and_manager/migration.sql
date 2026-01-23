/*
  Warnings:

  - You are about to drop the column `manager_reviewed_at` on the `proposal` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[proposal] DROP CONSTRAINT [proposal_status_df];
ALTER TABLE [dbo].[proposal] DROP COLUMN [manager_reviewed_at];
ALTER TABLE [dbo].[proposal] ADD CONSTRAINT [proposal_status_df] DEFAULT 'DEFINE_CHAMPION' FOR [status];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
