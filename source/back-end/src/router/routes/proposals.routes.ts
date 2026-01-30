import { Router } from "express";
import { ProposalsController } from "../../controllers/proposals.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  createProposalSchema,
  getProposalByIdSchema,
} from "../../utils/schemas/proposal.schemas";

const proposalsRoutes = Router();

proposalsRoutes.get("/", ProposalsController.handleFindAll);
proposalsRoutes.get(
  "/with-employees",
  ProposalsController.handleFindAllWithEmployees,
);
proposalsRoutes.get(
  "/:id",
  validate(getProposalByIdSchema),
  ProposalsController.handleFindById,
);
proposalsRoutes.post(
  "/",
  validate(createProposalSchema),
  ProposalsController.handleCreate,
);

export { proposalsRoutes };
