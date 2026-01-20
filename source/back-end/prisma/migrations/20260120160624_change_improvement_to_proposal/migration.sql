/*
  Warnings:

  - You are about to drop the column `improvement_id` on the `suggestion` table. All the data in the column will be lost.
  - You are about to drop the `improvement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[employee_id,proposal_id]` on the table `suggestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `proposal_id` to the `suggestion` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[improvement] DROP CONSTRAINT [improvement_area_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[improvement] DROP CONSTRAINT [improvement_category_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[improvement] DROP CONSTRAINT [improvement_champion_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[improvement] DROP CONSTRAINT [improvement_manager_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[suggestion] DROP CONSTRAINT [suggestion_improvement_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[suggestion] DROP COLUMN [improvement_id];
ALTER TABLE [dbo].[suggestion] ADD [proposal_id] INT NOT NULL;

-- DropTable
DROP TABLE [dbo].[improvement];

-- CreateTable
CREATE TABLE [dbo].[proposal] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [proposal_status_df] DEFAULT 'DEFINE_MANAGER',
    [category_id] INT,
    [reward_amount] DECIMAL(10,2),
    [area_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [proposal_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [admin_reviewed_at] DATETIME2,
    [manager_reviewed_at] DATETIME2,
    [champion_reviewed_at] DATETIME2,
    [implementation_started_at] DATETIME2,
    [completed_at] DATETIME2,
    [manager_id] INT,
    [champion_id] INT,
    [notes] NVARCHAR(1000),
    [rejection_note] NVARCHAR(1000),
    CONSTRAINT [proposal_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
ALTER TABLE [dbo].[suggestion] ADD CONSTRAINT [suggestion_employee_id_proposal_id_key] UNIQUE NONCLUSTERED ([employee_id], [proposal_id]);

-- AddForeignKey
ALTER TABLE [dbo].[proposal] ADD CONSTRAINT [proposal_area_id_fkey] FOREIGN KEY ([area_id]) REFERENCES [dbo].[area]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[proposal] ADD CONSTRAINT [proposal_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[category]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[proposal] ADD CONSTRAINT [proposal_champion_id_fkey] FOREIGN KEY ([champion_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[proposal] ADD CONSTRAINT [proposal_manager_id_fkey] FOREIGN KEY ([manager_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[suggestion] ADD CONSTRAINT [suggestion_proposal_id_fkey] FOREIGN KEY ([proposal_id]) REFERENCES [dbo].[proposal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
