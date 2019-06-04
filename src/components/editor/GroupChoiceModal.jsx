// Copyright 2018 Stanford University see LICENSE for license

import React, { Component } from 'react'
import Button from 'react-bootstrap/lib/Button'
import Modal from 'react-bootstrap/lib/Modal'
import PropTypes from 'prop-types'
import Config from '../../Config'

class GroupChoiceModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedValue: 'ld4p',
    }
  }

  updateSelectedValue = (event) => {
    this.setState({ selectedValue: event.target.value })
  }

  saveAndClose = () => {
    this.props.save(this.props.rdf, this.state.selectedValue)
  }

  render() {
    return (
      <div>
        <Modal show={ this.props.show } bsSize="lg">
          <Modal.Header className="prop-heading">
            <button className="close" data-dismiss="alert" aria-label="close" onClick={this.props.close}>&times;</button>
            <Modal.Title>
              Which group do you want to save to?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="group-panel">
            <div className="group-select-label">
              Which group do you want to associate this record to?
            </div>
            <div>
              <form className="group-select-options" >
                <select defaultValue={ this.state.selectedValue } onBlur={ event => this.updateSelectedValue(event)} >
                  { Config.groupsInSinopia.map((group, index) => <option key={index} value={ group[0] }>{ group[1] }</option>) }
                </select>
                <div className="group-choose-buttons">
                  <Button className="btn-link" style={{ paddingRight: '20px' }} onClick={ this.props.close }>
                    Cancel
                  </Button>
                  <Button className="btn btn-primary btn-sm" onClick={ this.saveAndClose }>
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

GroupChoiceModal.propTypes = {
  close: PropTypes.func,
  save: PropTypes.func,
  choose: PropTypes.func,
  show: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  rdf: PropTypes.string,
}

export default GroupChoiceModal
