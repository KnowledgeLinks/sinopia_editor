// Copyright 2019 Stanford University see Apache2.txt for license

import React, {Component} from 'react'
import { connect } from 'react-redux'
import InputLiteral from './InputLiteral'
import InputListLOC from './InputListLOC'
import InputLookupQA from './InputLookupQA'
import OutlineHeader from './OutlineHeader'
import PropertyActionButtons from './PropertyActionButtons'
import PropertyTypeRow from './PropertyTypeRow'
import RequiredSuperscript from './RequiredSuperscript'
import { refreshResourceTemplate } from '../../actions/index'
import { getResourceTemplateFromServer } from '../../sinopiaServer'
import lookupConfig from '../../../static/spoofedFilesFromServer/fromSinopiaServer/lookupConfig.json'
import PropTypes from 'prop-types'
import shortid from 'shortid'
const _ = require('lodash')

export const valueTemplateRefTest = (property) => {
  return Boolean(property.valueConstraint != null &&
    property.valueConstraint.valueTemplateRefs != null &&
    property.valueConstraint.valueTemplateRefs.length > 0)
}

export const getLookupConfigForTemplateUri = (templateUri) => {
  let returnConfigItem
  lookupConfig.forEach((configItem) => {
    if (configItem.uri === templateUri) {
      returnConfigItem = configItem;
    }
  })
  return {value: returnConfigItem};
}

//This method is used for input list loc below, with just one lookup config passed back
// in {value : configItem } format
export const getLookupConfigItem = (property) => {
  let templateUri = property.valueConstraint.useValuesFrom[0];
  let configItem = getLookupConfigForTemplateUri(templateUri);
  return configItem
}

export const getLookupConfigItems = (property) => {
  //More than one value possible so this returns all the lookup configs associated with property
  let templateUris = property.valueConstraint.useValuesFrom;
  let templateConfigItems = [];
  templateUris.forEach(templateUri => {
    let configItem = getLookupConfigForTemplateUri(templateUri);
    //TODO: Handle when this is undefined?
    templateConfigItems.push(configItem);
  });
  return templateConfigItems;
}

export class PropertyTemplateOutline extends Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: true,
      output: [],
      nestedResourceTemplates: []
    }
  }

  fullfillRTPromises = async (promiseAll) => {
    await promiseAll.then(rts => {
      rts.map(rt => {
        this.setState({tempState: rt.response.body})
        const joinedRts = this.state.nestedResourceTemplates.slice(0)
        joinedRts.push(this.state.tempState)
        this.setState({nestedResourceTemplates: joinedRts})
      })
    }).catch(() => {})
  }

  resourceTemplatePromises = (templateRefs) => {
    return Promise.all(templateRefs.map(rtId =>
      getResourceTemplateFromServer(rtId)
    ))
  }

  handleAddClick = (event) => {
    event.preventDefault()
    if (this.props.handleAddClick !== undefined) {
      this.props.handleAddClick(event)
    }
  }

  handleMintUri = (event) => {
    event.preventDefault()
    if (this.props.handleMintUri !== undefined) {
      this.props.handleMintUri(event)
    }
  }

  handleComponentCase = (property) => {
    let rtReduxPath = Object.assign([], this.props.reduxPath)
    let input, key, lookupConfigItem

    switch (property.type) {
      case "literal":
        if (rtReduxPath[rtReduxPath.length - 1] !== property.propertyURI) {
          rtReduxPath.push(property.propertyURI)
        }
        key = shortid.generate()
        input = <InputLiteral id={key}
                              propertyTemplate={property}
                              key={key}
                              reduxPath={rtReduxPath}
                              rtId={property.rtId} />
        break;

      case "lookup":
        lookupConfigItem = getLookupConfigItems(property)
        input = <InputLookupQA propertyTemplate={property}
                               lookupConfig={lookupConfigItem}
                               rtId = {property.rtId} />
        break;

      case "resource":
        if (valueTemplateRefTest(property)){
          input = []
          property.valueConstraint.valueTemplateRefs.map((rtId) => {
            let resourceTemplate = _.find(this.state.nestedResourceTemplates, ['id', rtId])
            input.push(<div className="row" key={shortid.generate()}>
              <section className="col-sm-8">
                <h5>{resourceTemplate.resourceLabel}</h5>
              </section>
              <section className="col-sm-4">
                <PropertyActionButtons handleAddClick={this.handleAddClick}
                                       handleMintUri={this.handleMintUri} key={shortid.generate()} />
              </section>
            </div>)
            resourceTemplate.propertyTemplates.map((rtProperty) => {
              let newReduxPath = Object.assign([], rtReduxPath)
              newReduxPath.push(rtId)
              newReduxPath.push(rtProperty.propertyURI)
              const payload = { reduxPath: newReduxPath }
              if (rtProperty.valueConstraint.defaults && rtProperty.valueConstraint.defaults.length > 0) {
                payload['defaults'] = []
                rtProperty.valueConstraint.defaults.map((row, i) => {
                  payload['defaults'].push({
                    id: i,
                    content: row.defaultLiteral,
                    uri: row.defaultURI
                  })
                })
              }
              this.props.initNewResourceTemplate(payload)
              input.push(<PropertyTemplateOutline key={shortid.generate()}
                                                  propertyTemplate={rtProperty}
                                                  reduxPath={newReduxPath}
                                                  initNewResourceTemplate={this.props.initNewResourceTemplate}
                                                  resourceTemplate={resourceTemplate} />)
            })
          })
          break;
        }
        lookupConfigItem = getLookupConfigItem(property)
        input = <InputListLOC propertyTemplate = {property}
                              lookupConfig = {lookupConfigItem}
                              rtId = {property.rtId} />

        break;
    }

    return input
  }

  handleClick = (property) => (event) => {
    event.preventDefault()
    let newOutput = this.state.output

    this.fullfillRTPromises(this.resourceTemplatePromises(property.valueConstraint.valueTemplateRefs)).then(() => {

      const input = this.handleComponentCase(property)

      let existingInput
      newOutput.forEach((input) => {
        if (this.props.propertyTemplate.propertyURI === input.props.propertyTemplate.propertyURI) {
          existingInput = input
          return
        }
      })
      if (existingInput === undefined) {
        newOutput.push(<PropertyTypeRow
          key={shortid.generate()}
          handleAddClick={this.props.handleAddClick}
          handleMintUri={this.props.handleMintUri}
          propertyTemplate={property}>
          {input}
        </PropertyTypeRow>)
      }
      this.setState( { collapsed: !this.state.collapsed,
        output: newOutput })
    })
  }

  isRequired = (property) => {
    if (property.mandatory === "true") {
      return <RequiredSuperscript />
    }
  }

  outlinerClasses = () => {
    let classNames = "rOutline-property"
    if (this.state.collapsed) { classNames += " collapse"}
    return classNames
  }

  render() {
    return(<div className="rtOutline" key={shortid.generate()}>
      <OutlineHeader label={this.props.propertyTemplate.propertyLabel}
                     collapsed={this.state.collapsed}
                     key={shortid.generate()}
                     isRequired={this.isRequired(this.props.propertyTemplate)}
                     handleCollapsed={this.handleClick(this.props.propertyTemplate)} />
      <div className={this.outlinerClasses()}>
        {this.state.output}
      </div>
    </div>)
  }
}

PropertyTemplateOutline.propTypes = {
  handleAddClick: PropTypes.func,
  handleMintUri: PropTypes.func,
  handleCollapsed: PropTypes.func,
  initNewResourceTemplate: PropTypes.func,
  isRequired: PropTypes.func,
  propertyTemplate: PropTypes.object,
  reduxPath: PropTypes.array,
  rtId: PropTypes.string
}

const mapDispatchToProps = dispatch => ({
  initNewResourceTemplate(rt_context) {
    dispatch(refreshResourceTemplate(rt_context))
  }
})

export default connect(null, mapDispatchToProps)(PropertyTemplateOutline);
