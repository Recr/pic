/*
  Warnings:

  - You are about to alter the column `status` on the `proposal` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(100)`.
  - A unique constraint covering the columns `[suggestion_id]` on the table `payout` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[proposal] ALTER COLUMN [description] NVARCHAR(2000) NOT NULL;
ALTER TABLE [dbo].[proposal] ALTER COLUMN [status] NVARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[cagysData] (
    [proposalId] INT,
    [description] NTEXT,
    [re] FLOAT,
    [EmployeeName] NVARCHAR(255),
    [Shift] NVARCHAR(255),
    [Area] NVARCHAR(255),
    [category] NVARCHAR(255),
    [Revisado] NVARCHAR(255),
    [status] NVARCHAR(255),
    [date] DATETIME,
    [createdAt] DATETIME,
    [ManagerName] NVARCHAR(255),
    [rejectionNote] NVARCHAR(255),
    [SuggestionCompletedAt] DATETIME,
    [ChampionName] NVARCHAR(255),
    [notes2] NVARCHAR(255),
    [notes1] NVARCHAR(255),
    [rejectionNote2] NVARCHAR(255),
    [RejectedOrCompltedDate] DATETIME,
    [championReviewedAt] DATETIME,
    [PayoutAmount] FLOAT,
    [managerReviewedAt] DATETIME,
    [adminReviewedAt] DATETIME,
    [managerNotes] NVARCHAR(255),
    [CompletedOrTodayDate] DATETIME
);

-- CreateIndex
ALTER TABLE [dbo].[payout] ADD CONSTRAINT [payout_suggestion_id_key] UNIQUE NONCLUSTERED ([suggestion_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
