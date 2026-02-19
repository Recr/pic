BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[refresh_token] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [tokenHash] NVARCHAR(255) NOT NULL,
    [expires_at] DATETIME2 NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [refresh_token_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [revoked_at] DATETIME2,
    CONSTRAINT [refresh_token_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[refresh_token] ADD CONSTRAINT [refresh_token_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
