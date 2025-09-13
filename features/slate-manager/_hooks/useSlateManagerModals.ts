import { useReducer } from 'react'

import { Slate as SlateType } from '../_types/slate'

type ModalType = 'add' | 'delete' | 'projections' | null
type State = { type: ModalType; slate?: SlateType | null }
type Action =
  | { type: 'OPEN_ADD' }
  | { type: 'OPEN_DELETE'; slate: SlateType }
  | { type: 'OPEN_PROJECTIONS'; slate: SlateType }
  | { type: 'CLOSE' }

function reducer(_: State, action: Action): State {
  switch (action.type) {
    case 'OPEN_ADD':
      return { type: 'add', slate: null }
    case 'OPEN_DELETE':
      return { type: 'delete', slate: action.slate }
    case 'OPEN_PROJECTIONS':
      return { type: 'projections', slate: action.slate }
    case 'CLOSE':
    default:
      return { type: null, slate: null }
  }
}

export function useSlateManagerModals() {
  const [modal, dispatch] = useReducer(reducer, { type: null, slate: null })
  return {
    modal,
    openAdd: () => dispatch({ type: 'OPEN_ADD' }),
    openDelete: (slate: SlateType) => dispatch({ type: 'OPEN_DELETE', slate }),
    openProjections: (slate: SlateType) => dispatch({ type: 'OPEN_PROJECTIONS', slate }),
    close: () => dispatch({ type: 'CLOSE' }),
  }
}
