BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[proposal] ADD [requires_implementation] BIT NOT NULL CONSTRAINT [proposal_requires_implementation_df] DEFAULT 1;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
