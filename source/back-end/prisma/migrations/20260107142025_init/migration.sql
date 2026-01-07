BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[area] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(50) NOT NULL,
    CONSTRAINT [area_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[category] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(50) NOT NULL,
    [category_reward] DECIMAL(10,2),
    CONSTRAINT [category_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[employee] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [employee_role_df] DEFAULT 'OPERATOR',
    [re] INT,
    [shift] NVARCHAR(20),
    [password_hash] NVARCHAR(100) NOT NULL,
    CONSTRAINT [employee_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ__EMPLOYEE__321433120B386ECD] UNIQUE NONCLUSTERED ([re])
);

-- CreateTable
CREATE TABLE [dbo].[Improvement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Improvement_status_df] DEFAULT 'DEFINE_MANAGER',
    [category_id] INT,
    [area_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [admin_reviewed_at] DATETIME2,
    [manager_reviewed_at] DATETIME2,
    [champion_reviewed_at] DATETIME2,
    [implementation_started_at] DATETIME2,
    [completed_at] DATETIME2,
    [manager_id] INT,
    [champion_id] INT,
    [notes] NVARCHAR(1000),
    [rejectionNote] NVARCHAR(1000),
    CONSTRAINT [PK__IMPROVEM__3213E83FFEE3890E] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[payout] (
    [id] INT NOT NULL IDENTITY(1,1),
    [suggestion_id] INT NOT NULL,
    [value] DECIMAL(10,2),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [payout_status_df] DEFAULT 'PENDING',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [payout_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [payed_at] DATETIME2,
    CONSTRAINT [payout_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[suggestion] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [improvement_id] INT NOT NULL,
    CONSTRAINT [suggestion_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Improvement] ADD CONSTRAINT [Improvement_area_id_fkey] FOREIGN KEY ([area_id]) REFERENCES [dbo].[area]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Improvement] ADD CONSTRAINT [Improvement_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[category]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Improvement] ADD CONSTRAINT [Improvement_champion_id_fkey] FOREIGN KEY ([champion_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Improvement] ADD CONSTRAINT [Improvement_manager_id_fkey] FOREIGN KEY ([manager_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payout] ADD CONSTRAINT [payout_suggestion_id_fkey] FOREIGN KEY ([suggestion_id]) REFERENCES [dbo].[suggestion]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[suggestion] ADD CONSTRAINT [suggestion_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[suggestion] ADD CONSTRAINT [suggestion_improvement_id_fkey] FOREIGN KEY ([improvement_id]) REFERENCES [dbo].[Improvement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
