BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[annual_target] (
    [id] INT NOT NULL IDENTITY(1,1),
    [annual_submited_proposals_target] INT NOT NULL,
    [annual_implemented_proposals_target] INT NOT NULL,
    [annual_head_count] INT NOT NULL,
    [communication_days_target] INT NOT NULL,
    [year] INT NOT NULL,
    CONSTRAINT [annual_target_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
