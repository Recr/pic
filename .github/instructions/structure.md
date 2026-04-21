# Database

The database schema is defined in `prisma/schema.prisma`. It uses MSSQL as the database provider. To apply changes to the database, run `npx prisma migrate dev`.

- The `Employee` model represents employees in the system, with fields for name, email, password, role, and relations to proposals and suggestions.
- The `Proposal` model represents suggestions made by employees, with fields for description, status, and relations to the executor/champion and manager (Employee) and suggestions.
- The `Payout` model represents rewards given for accepted proposals, with fields for amount and relations to the suggestion.
- The `Suggestion` model represents the act of suggesting an idea, with relations to the employee and proposal.
- The `AnnualTarget` model represents yearly goals for the company, with fields for year and target amount.
- The `Area` model represents different areas of the company, with fields for name and relation to proposals.
- The `Category` model represents categories for proposals, with fields for name, reward amount and relation to proposals.
- The `ProposalAttachment` model represents files attached to proposals, with fields for filename, filepath and relation to proposals.
- The `RefreshToken` model represents refresh tokens for authentication, with fields for token and relation to employee.
