import { proposalAPI } from '../features/proposal/proposal-api'

export type UndoType =
  | 'IMPLEMENTED_TO_WAITING_APPROVAL'
  | 'IMPLEMENTED_TO_IMPLEMENTATION'
  | 'IMPLEMENTATION_TO_TO_IMPLEMENT'
  | 'TO_IMPLEMENT_TO_UNDER_VALIDATION'
  | 'REJECTED_TO_UNDER_VALIDATION'
  | 'REJECTED_TO_DEFINE_CHAMPION'
  | null

export const getProposalAvailableUndoActions = (
  isProposalAdmin: boolean,
  isProposalManager: boolean,
  isProposalChampion: boolean,
  proposalStatus: string,
  proposalRequiresImplementation: boolean,
) => {
  const actions: UndoType[] = []

  if (
    proposalStatus === 'IMPLEMENTED' &&
    !proposalRequiresImplementation &&
    (isProposalAdmin || isProposalManager)
  ) {
    actions.push('IMPLEMENTED_TO_WAITING_APPROVAL')
  }

  if (proposalStatus === 'IMPLEMENTED' && (isProposalAdmin || isProposalChampion)) {
    actions.push('IMPLEMENTED_TO_IMPLEMENTATION')
  }

  if (proposalStatus === 'IMPLEMENTATION' && isProposalChampion) {
    actions.push('IMPLEMENTATION_TO_TO_IMPLEMENT')
  }

  if (proposalStatus === 'TO_IMPLEMENT' && isProposalChampion) {
    actions.push('TO_IMPLEMENT_TO_UNDER_VALIDATION')
  }

  if ((proposalStatus === 'REJECTED' || proposalStatus === 'NOT_VIABLE') && isProposalChampion) {
    actions.push('REJECTED_TO_UNDER_VALIDATION')
  }

  if (
    proposalStatus === 'REJECTED' &&
    (isProposalAdmin || isProposalManager) &&
    !isProposalChampion
  ) {
    actions.push('REJECTED_TO_DEFINE_CHAMPION')
  }

  return actions
}

export const useProposalUndo = () => {
  const [
    undoImplementedToWaitingApproval,
    { isLoading: isUndoFinishedWithoutImplementationLoading },
  ] = proposalAPI.useUndoImplementedToWaitingApprovalMutation()
  const [undoImplementedToImplementation, { isLoading: isUndoImplementedLoading }] =
    proposalAPI.useUndoImplementedToImplementationMutation()
  const [undoImplementationToToImplement, { isLoading: isUndoImplementationLoading }] =
    proposalAPI.useUndoImplementationToToImplementMutation()
  const [undoToImplementToUnderValidation, { isLoading: isUndoToImplementLoading }] =
    proposalAPI.useUndoToImplementToUnderValidationMutation()
  const [undoRejectedToUnderValidation, { isLoading: isUndoRejectedValidationLoading }] =
    proposalAPI.useUndoRejectedToUnderValidationMutation()
  const [undoRejectedToDefineChampion, { isLoading: isUndoRejectedChampionLoading }] =
    proposalAPI.useUndoRejectedToDefineChampionMutation()

  const undoProposal = async (undoType: Exclude<UndoType, null>, proposalId: number) => {
    const request = { proposalId: String(proposalId) }

    switch (undoType) {
      case 'IMPLEMENTED_TO_WAITING_APPROVAL':
        await undoImplementedToWaitingApproval(request).unwrap()
        break
      case 'IMPLEMENTED_TO_IMPLEMENTATION':
        await undoImplementedToImplementation(request).unwrap()
        break
      case 'IMPLEMENTATION_TO_TO_IMPLEMENT':
        await undoImplementationToToImplement(request).unwrap()
        break
      case 'TO_IMPLEMENT_TO_UNDER_VALIDATION':
        await undoToImplementToUnderValidation(request).unwrap()
        break
      case 'REJECTED_TO_UNDER_VALIDATION':
        await undoRejectedToUnderValidation(request).unwrap()
        break
      case 'REJECTED_TO_DEFINE_CHAMPION':
        await undoRejectedToDefineChampion(request).unwrap()
        break
    }
  }

  const isUndoLoading = (undoType: UndoType) => {
    switch (undoType) {
      case 'IMPLEMENTED_TO_WAITING_APPROVAL':
        return isUndoFinishedWithoutImplementationLoading
      case 'IMPLEMENTED_TO_IMPLEMENTATION':
        return isUndoImplementedLoading
      case 'IMPLEMENTATION_TO_TO_IMPLEMENT':
        return isUndoImplementationLoading
      case 'TO_IMPLEMENT_TO_UNDER_VALIDATION':
        return isUndoToImplementLoading
      case 'REJECTED_TO_UNDER_VALIDATION':
        return isUndoRejectedValidationLoading
      case 'REJECTED_TO_DEFINE_CHAMPION':
        return isUndoRejectedChampionLoading
      default:
        return false
    }
  }

  return { undoProposal, isUndoLoading }
}
