// Copyright 2018, 2019 Stanford University see LICENSE for license

import React from 'react'
import { shallow } from 'enzyme'
import { Typeahead } from 'react-bootstrap-typeahead'
import InputListLOC from 'components/editor/property/InputListLOC'

const propsOk = {
  propertyTemplate:
    {
      propertyURI: 'http://id.loc.gov/ontologies/bflc/target',
      propertyLabel: 'Frequency (RDA 2.14)',
      remark: 'http://access.rdatoolkit.org/2.14.html',
      mandatory: 'false',
      repeatable: 'true',
      type: 'lookup',
      valueConstraint: {
        defaults: [{
          defaultURI: 'http://id.loc.gov/vocabulary/carriers/nc',
          defaultLiteral: 'volume',
        }],
        useValuesFrom: [
          'vocabulary:bf2:frequencies',
        ],
        valueDataType: {
          dataTypeURI: 'http://id.loc.gov/ontologies/bibframe/Frequency',
        },
      },
    },
  lookupConfig: [
    {
      label: 'carriers',
      uri: 'https://id.loc.gov/vocabulary/carriers',
      component: 'list',
    },
  ],
  defaults: [
    {
      defaultURI: 'http://id.loc.gov/vocabulary/carriers/nc',
      defaultLiteral: 'volume',
    },
  ],
}

const propsUndefLookupURI = {
  propertyTemplate:
    {
      propertyURI: 'http://id.loc.gov/ontologies/bflc/target',
      propertyLabel: 'Frequency (RDA 2.14)',
      remark: 'http://access.rdatoolkit.org/2.14.html',
      mandatory: 'false',
      repeatable: 'true',
      type: 'lookup',
      valueConstraint: {
        defaults: [{
          defaultURI: 'http://id.loc.gov/vocabulary/carriers/nc',
          defaultLiteral: 'volume',
        }],
        useValuesFrom: [
          'vocabulary:bf2:frequencies',
        ],
        valueDataType: {
          dataTypeURI: 'http://id.loc.gov/ontologies/bibframe/Frequency',
        },
      },
    },
  lookupConfig: [
    {
      label: 'frequency',
      uri: undefined,
      component: 'list',
    },
  ],
}

const propsMultLookup = {
  propertyTemplate:
    {
      propertyURI: 'http://id.loc.gov/ontologies/bflc/target',
      propertyLabel: 'Frequency (RDA 2.14)',
      remark: 'http://access.rdatoolkit.org/2.14.html',
      mandatory: 'false',
      repeatable: 'true',
      type: 'lookup',
      valueConstraint: {
        defaults: [{
          defaultURI: 'http://id.loc.gov/vocabulary/carriers/nc',
          defaultLiteral: 'volume',
        }],
        useValuesFrom: [
          'vocabulary:bf2:frequencies',
        ],
        valueDataType: {
          dataTypeURI: 'http://id.loc.gov/ontologies/bibframe/Frequency',
        },
      },
    },
  lookupConfig: [
    {
      label: 'carriers',
      uri: 'https://id.loc.gov/vocabulary/carriers',
      component: 'list',
    },
    {
      label: 'frequency',
      uri: undefined,
      component: 'list',
    },
  ],
}

describe('<InputListLOC /> configuration', () => {
  // Our mock formData function to replace the one provided by mapDispatchToProps
  const mockFormDataFn = jest.fn()

  beforeEach(() => {
    global.alert = jest.fn()
  })

  afterEach(() => {
    global.alert = alert
  })

  it('expects a single lookupConfig object', () => {
    shallow(<InputListLOC.WrappedComponent {...propsOk} handleSelectedChange={mockFormDataFn} />)
    expect(global.alert.mock.calls.length).toEqual(0)
  })

  it('displays a browser alert if the lookupConfig is undefined', () => {
    shallow(<InputListLOC.WrappedComponent {...propsUndefLookupURI} handleSelectedChange={mockFormDataFn} />)
    expect(global.alert.mock.calls.length).toEqual(1)
  })

  it('displays a browser alert if the lookupConfig is an array of objects and not a single object', () => {
    shallow(<InputListLOC.WrappedComponent {...propsMultLookup} handleSelectedChange={mockFormDataFn} />)
    expect(global.alert.mock.calls.length).toEqual(1)
  })
})

describe('<Typeahead /> component', () => {
  // Our mock formData function to replace the one provided by mapDispatchToProps
  const mockFormDataFn = jest.fn()
  const wrapper = shallow(<InputListLOC.WrappedComponent {...propsOk} handleSelectedChange={mockFormDataFn} />)

  it('contains a placeholder with the value of propertyLabel', () => {
    expect(wrapper.find(Typeahead).props().placeholder).toMatch('Frequency (RDA 2.14)')
  })

  it('typeahead component should have a placeholder attribute with value propertyLabel', () => {
    expect(wrapper.find('#targetComponent').props().placeholder).toBe('Frequency (RDA 2.14)')
  })

  it('sets the typeahead component required attribute according to the mandatory value from the template', () => {
    expect(wrapper.find('#targetComponent').props().required).toBe(false)
  })

  it('displays RequiredSuperscript if mandatory from template is true', () => {
    wrapper.instance().props.propertyTemplate.mandatory = 'true'
    wrapper.instance().forceUpdate()
    expect(wrapper.find('label > RequiredSuperscript')).toBeTruthy()
  })

  it('displays a text label if remark from template is absent', () => {
    wrapper.instance().props.propertyTemplate.remark = undefined
    wrapper.instance().forceUpdate()
    expect(wrapper.find(Typeahead).props().placeholder).toMatch('Frequency (RDA 2.14)')
  })

  it('sets the typeahead component multiple attribute according to the repeatable value in the property template', () => {
    expect(wrapper.find('#targetComponent').props().multiple).toBe(true)
  })

  it('sets the typeahead component placeholder attribute', () => {
    expect(wrapper.find('#targetComponent').props().placeholder).toMatch('Frequency (RDA 2.14)')
  })

  it('should call the onFocus event and set the selected option', () => {
    expect.assertions(2)
    const opts = { id: 'URI', label: 'LABEL', uri: 'URI' }

    wrapper.instance().opts = opts
    const event = (wrap) => {
      global.fetch = jest.fn().mockImplementation(async () => await { ok: true, resp: wrapper.instance().opts })
      wrap.setState({ options: [wrapper.instance().opts] })
      wrap.setState({ selected: [wrapper.instance().opts] })
    }

    wrapper.find('#targetComponent').simulate('focus', event(wrapper))
    expect(wrapper.state().options[0]).toEqual(opts)

    wrapper.find('#targetComponent').simulate('change', event(wrapper))
    expect(wrapper.state().selected[0]).toEqual(opts)
  })

  it('sets the formData store with the total number or objects sent to "selected" when a change event happens', () => {
    expect(mockFormDataFn.mock.calls.length).toBe(2)
  })
})
