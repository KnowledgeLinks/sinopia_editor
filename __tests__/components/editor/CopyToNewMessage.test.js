// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import { createStore } from 'redux'
import CopyToNewMessage from 'components/editor/CopyToNewMessage'
import appReducer from 'reducers/index'
import { renderWithRedux, createBlankState } from 'testUtils'

test('Message is not displayed when timestamp is false', () => {
  const store = createStore(appReducer, createBlankState())
  const { container } = renderWithRedux(
    <CopyToNewMessage />, store,
  )

  expect(container.querySelector('.alert-success')).not.toBeInTheDocument()
})

test('Message is not displayed if it expired', () => {
  const store = createStore(appReducer, {
    selectorReducer: {
      entities: {},
      resource: {},
      editor: {
        copyToNewMessage: {
          timestamp: Date.now(),
          oldUri: 'https://sinopia.io/pcc/1345',
        },
      },
    },
  })
  const { container } = renderWithRedux(
    <CopyToNewMessage />, store,
  )
  expect(container.querySelector('.alert-success')).not.toBeInTheDocument()
})
