BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[proposal_attachment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [proposal_id] INT NOT NULL,
    [relative_path] NVARCHAR(255) NOT NULL,
    [stored_name] NVARCHAR(255) NOT NULL,
    [original_name] NVARCHAR(255) NOT NULL,
    [size_bytes] INT NOT NULL,
    [uploaded_at] DATETIME2 NOT NULL CONSTRAINT [proposal_attachment_uploaded_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [proposal_attachment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[proposal_attachment] ADD CONSTRAINT [proposal_attachment_proposal_id_fkey] FOREIGN KEY ([proposal_id]) REFERENCES [dbo].[proposal]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
