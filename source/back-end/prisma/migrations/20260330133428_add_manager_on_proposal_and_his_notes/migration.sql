BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[proposal] ADD [manager_id] INT,
[manager_notes] NVARCHAR(1000);

-- AddForeignKey
ALTER TABLE [dbo].[proposal] ADD CONSTRAINT [proposal_manager_id_fkey] FOREIGN KEY ([manager_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
