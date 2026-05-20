-- AlterTable - Add COMPLETED status to proposal constraint
BEGIN TRY

BEGIN TRAN;

-- Drop existing constraint
ALTER TABLE [dbo].[proposal] DROP CONSTRAINT [CK_Proposal_Status];

-- Recreate constraint with COMPLETED status
ALTER TABLE [dbo].[proposal]
ADD CONSTRAINT CK_Proposal_Status
CHECK (
  status IN (
    'DEFINE_CHAMPION',
    'UNDER_VALIDATION',
    'TO_IMPLEMENT',
    'IMPLEMENTATION',
    'REJECTED',
    'NOT_VIABLE',
    'IMPLEMENTED',
    'COMPLETED'
  )
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
