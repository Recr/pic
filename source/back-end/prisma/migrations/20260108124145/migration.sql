/*
  Warnings:

  - You are about to drop the `Improvement` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Improvement] DROP CONSTRAINT [Improvement_area_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Improvement] DROP CONSTRAINT [Improvement_category_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Improvement] DROP CONSTRAINT [Improvement_champion_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Improvement] DROP CONSTRAINT [Improvement_manager_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[suggestion] DROP CONSTRAINT [suggestion_improvement_id_fkey];

-- DropTable
DROP TABLE [dbo].[Improvement];

-- CreateTable
CREATE TABLE [dbo].[improvement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [improvement_status_df] DEFAULT 'DEFINE_MANAGER',
    [category_id] INT,
    [reward_amount] DECIMAL(10,2),
    [area_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [improvement_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [admin_reviewed_at] DATETIME2,
    [manager_reviewed_at] DATETIME2,
    [champion_reviewed_at] DATETIME2,
    [implementation_started_at] DATETIME2,
    [completed_at] DATETIME2,
    [manager_id] INT,
    [champion_id] INT,
    [notes] NVARCHAR(1000),
    [rejection_note] NVARCHAR(1000),
    CONSTRAINT [improvement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[improvement] ADD CONSTRAINT [improvement_area_id_fkey] FOREIGN KEY ([area_id]) REFERENCES [dbo].[area]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[improvement] ADD CONSTRAINT [improvement_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[category]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[improvement] ADD CONSTRAINT [improvement_champion_id_fkey] FOREIGN KEY ([champion_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[improvement] ADD CONSTRAINT [improvement_manager_id_fkey] FOREIGN KEY ([manager_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[suggestion] ADD CONSTRAINT [suggestion_improvement_id_fkey] FOREIGN KEY ([improvement_id]) REFERENCES [dbo].[improvement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
EXEC SP_RENAME N'dbo.employee.UQ__EMPLOYEE__321433120B386ECD', N'employee_re_key', N'INDEX';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
