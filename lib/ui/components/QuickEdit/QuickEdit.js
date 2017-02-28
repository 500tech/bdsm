import React from 'react';
import get from 'lodash/get';
import values from 'lodash/values';
import HttpStatus from 'http-status-codes';
import API from 'api';
import UIState, { UIStateListener } from 'ui/UIState';
import MocksState from 'ui/states/MocksState';
import { getHeaderPreset } from 'api/utils/headers';
import Select from 'ui/components/common/Select';
import RequestOption from 'ui/components/QuickEdit/RequestOption';
import RequestOptionValue from 'ui/components/QuickEdit/RequestOptionValue';
import BlueButton from 'ui/components/common/BlueButton';
import {
  QuickEditResponseEditor,
  QuickEditNotMockedMessage,
  QuickEditContainer,
  QuickEditSection,
  QuickEditMockSection,
  QuickEditResponseBodySection
} from 'ui/components/QuickEdit/styled';

const PASTE_CHARACTER_LIMIT = 115;

const headersPresetsOptions = [
  { value: 'JSON', label: 'JSON' },
  { value: 'XML', label: 'XML' },
  { value: 'TEXT', label: 'TEXT' }
];

class QuickEdit extends React.Component {

  state = {
    active: true,
    responseBody: ''
  };

  componentDidMount() {
    this.setState(this.initRequest(this.props));

    window.addEventListener('keyup', this.closeOnEscape);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedRequestId !== nextProps.selectedRequestId) {
      this.setState(this.initRequest(nextProps));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.closeOnEscape);
  }

  closeOnEscape = (event) => {
    if (event.keyCode === 27) {
      UIState.update({ viewMode: 'closed' });
    }
  };

  initRequest = () => {
    const latestRequest = UIState.latestRequest;
    const mock = API.getMock(latestRequest.mockId);
    const delay = get(mock, 'response.delay') || get(latestRequest, 'response.delay', 0);

    return {
      status: get(mock, 'response.status') || get(latestRequest, 'response.status', 200),
      headerPreset: 'JSON',
      responseBody: get(mock, 'response.body') || get(latestRequest, 'response.body'),
      active: get(mock, 'active') || latestRequest.active || true,
      delay
    };
  };

  selectRequest = (value) => {
    this.props.onSelectRequest(value);
  };

  onChange = (key) => (value) => {
    this.setState({ [key]: value });
  };

  onRequestBodyChange = (event) => {
    this.setState({ responseBody: event.target.value });
  };

  toggleActive = (event) => {
    event.stopPropagation();

    this.setState({ active: !this.state.active });
  };

  onResponseEnter = (event) => {
    if (event.key === 'Enter') {
      UIState.update({ viewMode: 'mocks' });
    }
  };

  onSave = () => {
    const latestRequest = UIState.latestRequest;
    const { delay, status, headerPreset, responseBody, active } = this.state;

    const request = Object.assign({}, latestRequest, {
      active,
      response: {
        delay,
        status,
        headers: getHeaderPreset(headerPreset),
        body: responseBody
      }
    });

    if (latestRequest.mockId) {
      API.updateMock(latestRequest.mockId, request);
    } else {
      API.mockRequest(request);
    }


    UIState.update({
      viewMode: 'closed',
      latestRequest: API.getCapturedRequest(UIState.selectedRequestId)
    });
  };

  onPaste = (event) => {
    const content = event.nativeEvent.clipboardData.getData('text');

    if (content.length > PASTE_CHARACTER_LIMIT) {
      UIState.update({ viewMode: 'mocks' });
    }
  };

  editMock = () => {
    const latestRequest = UIState.latestRequest;
    const { delay, status, headerPreset, responseBody, active } = this.state;

    const request = Object.assign({}, latestRequest, {
      active,
      response: {
        delay,
        status,
        headers: getHeaderPreset(headerPreset),
        body: responseBody
      }
    });

    if (latestRequest.mockId) {
      API.updateMock(latestRequest.mockId, request);

      const mock = API.getMock(latestRequest.mockId);

      MocksState.selectItems([mock]);
      UIState.update({
        viewMode: 'mocks',
        latestRequest: API.getCapturedRequest(UIState.selectedRequestId)
      });
    } else {
      const mock = API.mockRequest(request);

      MocksState.selectItems([mock]);
      UIState.update({
        viewMode: 'mocks',
        latestRequest: API.getCapturedRequest(UIState.selectedRequestId)
      });
    }
  };

  renderNotMocked = () => (
    <MockSection>
      <QuickEditResponseBodySection>
        <QuickEditNotMockedMessage>
          Not mocked
        </QuickEditNotMockedMessage>
      </QuickEditResponseBodySection>
    </MockSection>
  );

  renderMocked = () => (
    <QuickEditMockSection>
      <QuickEditSection>
        <Select
          anchorPoint="bottom"
          valueIcon={ null }
          onChange={ this.onChange('status') }
          value={ this.state.status }
          options={ values(HttpStatus).sort().map((statusCode) => ({
            value: statusCode,
            label: statusCode
          })) }/>
      </QuickEditSection>

      <QuickEditSection>
        <Select
          anchorPoint="bottom"
          onChange={ this.onChange('headerPreset') }
          value={ this.state.headerPreset }
          options={ headersPresetsOptions }/>
      </QuickEditSection>

      <QuickEditResponseBodySection>
        <QuickEditResponseEditor type="text"
                                 onChange={ this.onRequestBodyChange }
                                 onKeyPress={ this.onResponseEnter }
                                 onPaste={ this.onPaste }
                                 value={ this.state.responseBody }
                                 placeholder="Response Body"/>
      </QuickEditResponseBodySection>
    </QuickEditMockSection>
  );

  render() {
    const capturedRequests = API.capturedRequests.map((request) => ({
      value: request.id,
      label: request.url,
      request
    }));

    return (
      <QuickEditContainer>
        <QuickEditSection>
          <Select
            anchorPoint="bottom"
            autoScrollToEnd={ true }
            showDropdownIcon={ false }
            optionComponent={ RequestOption }
            valueComponent={ RequestOptionValue(this.state.active, this.toggleActive) }
            onChange={ this.selectRequest }
            value={ this.props.selectedRequestId }
            options={ capturedRequests }/>
        </QuickEditSection>

        { this.state.active ? this.renderMocked() : this.renderNotMocked() }

        <QuickEditSection>
          <BlueButton smaller onClick={ this.editMock }>
            Tune...
          </BlueButton>

          <BlueButton smaller onClick={ this.onSave }>
            Apply
          </BlueButton>
        </QuickEditSection>
      </QuickEditContainer>
    );
  }
}

export default UIStateListener(QuickEdit);