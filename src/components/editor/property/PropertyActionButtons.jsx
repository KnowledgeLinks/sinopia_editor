// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { addResource } from 'actionCreators/resources'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { removeResource } from 'actions/index'
import { resourceEditErrorKey, getResourceTemplate } from 'selectors/resourceSelectors'

const PropertyActionButtons = (props) => {
  const handleAddClick = (event) => {
    event.preventDefault()
    props.addResource(props.reduxPath, resourceEditErrorKey)
  }

  const trashIcon = faTrashAlt

  const handleRemoveClick = (event) => {
    event.preventDefault()
    props.removeResource(props.reduxPath.slice(0, props.reduxPath.length - 1))
  }

  return (<div className="btn-group" role="group" aria-label="...">
    { props.addButtonHidden
      || <button className="btn btn-sm btn-add-property btn-add-another"
                 onClick={ handleAddClick }>+ Add another</button>
    }
    { props.removeButtonHidden
      || <button className="btn btn-sm btn-remove-another"
                 onClick={ handleRemoveClick }><FontAwesomeIcon icon={trashIcon} /></button>
    }

  </div>)
}
PropertyActionButtons.propTypes = {
  reduxPath: PropTypes.array,
  removeButtonHidden: PropTypes.bool,
  addButtonHidden: PropTypes.bool,
  addResource: PropTypes.func,
  removeResource: PropTypes.func,
  resourceLabel: PropTypes.string,
}

const mapStateToProps = (state, ownProps) => {
  const resourceTemplateId = ownProps.reduxPath.slice(-1)[0]
  const resourceTemplate = getResourceTemplate(state, resourceTemplateId)
  const resourceLabel = resourceTemplate.resourceLabel
  return {
    resourceLabel,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({ addResource, removeResource }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PropertyActionButtons)
