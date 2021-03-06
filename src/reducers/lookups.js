// Copyright 2018 Stanford University see LICENSE for license

/**
 * Adds a lookup to state.
 * @param {Object} state the previous redux state
 * @param {Object} action to be performed
 * @return {Object} the next redux state
 */
const lookupOptionsRetrieved = (state, action) => {
  const newState = { ...state }

  newState.entities.lookups[action.payload.uri] = action.payload.lookup

  return newState
}

export default lookupOptionsRetrieved
