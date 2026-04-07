/*
  Warnings:

  - A unique constraint covering the columns `[year]` on the table `annual_target` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[annual_target] ADD CONSTRAINT [annual_target_year_key] UNIQUE NONCLUSTERED ([year]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
