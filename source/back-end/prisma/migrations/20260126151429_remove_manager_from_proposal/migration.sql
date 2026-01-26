/*
  Warnings:

  - You are about to drop the column `manager_id` on the `proposal` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[proposal] DROP CONSTRAINT [proposal_manager_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[proposal] DROP COLUMN [manager_id];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
