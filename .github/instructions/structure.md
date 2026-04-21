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

# Front-end

The front-end is built with React and TypeScript, using Vite as the build tool. It also utilizes Tailwind for styling, Redux Toolkit for state management, React Router for routing, React Hook Form for form handling, Chart.js for data visualization, Toastify for notifications, and Zod for schema validation.

# Back-end

The back-end is built with Express and TypeScript. It uses Prisma as the ORM to interact with the MSSQL database. For authentication, it uses JWT tokens, and Multer for handling file uploads. Zod is used for schema validation on the back-end as well.

## Back-end Architecture

The back-end follows a layered architecture with the following structure:

- `src/router`: Contains the route definitions for the API endpoints.
- `src/controllers`: Contains the controllers that handle incoming requests and return responses.
- `src/services`: Contains the business logic and interacts with the database through repositories.
- `src/repositories`: Contains the data access layer that interacts with the database using Prisma.
- `src/middleware`: Contains middleware functions for authentication and authorization.
