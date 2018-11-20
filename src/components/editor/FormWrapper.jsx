// Copyright 2018 Stanford University see Apache2.txt for license
import React, { Component }  from 'react'
import InputLiteral from './InputLiteral'

class FormWrapper extends Component{
  render () {
    let dashedBorder = {
      border: '1px dashed',
      padding: '10px',
    }
    if (this.props.propertyTemplates.length == 0 || this.props.propertyTemplates[0] == {}) {
      return <h1>There are no propertyTemplates - probably an error.</h1>
    } else {
      return (
        <form style={dashedBorder}>
          <div className='FormWrapper'>
            <p>BEGIN FormWrapper</p>
              <div>
                {this.props.propertyTemplates[0].map(function(pt, index){
                  if(pt.type == 'literal'){
                    return(
                      <InputLiteral propertyTemplate = {pt} key = {index} />
                    )
                  }
                  else if (pt.type == 'resource'){
                    return (<p> {pt.propertyLabel}: I am a resource type </p>)
                  }
                  else if (pt.type == 'lookup'){
                    return (<p> {pt.propertyLabel}: I am a lookup type! </p>)
                  }
                  else if (pt.type == 'target') {
                    return (<p> {pt.propertyLabel}: I am a target type! </p>)
                  }
                })}
              </div>
            <p>END FormWrapper</p>
          </div>
        </form>
      )
    }
  }
}

export default FormWrapper;
