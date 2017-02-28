import React from 'react';
import { getHighlightedText } from 'ui/utils/string';
import { DragSource } from 'react-dnd';
import API from 'api';
import MethodLabel from 'ui/components/common/MethodLabel';
import Icon from 'ui/components/common/Icon';
import InlineEdit from 'ui/components/Mocks/Sidebar/InlineEdit';
import { MockContainer, MockStatus, MockURL } from 'ui/components/Mocks/Sidebar/styled';

const mockSource = {
  beginDrag(props) {
    return {
      id: props.mock.id
    };
  }
};

function collect(connect) {
  return {
    connectDragSource: connect.dragSource()
  };
}


export class Mock extends React.Component {

  onSave = (name) => {
    const mock = API.getMock(this.props.mock.id);
    API.updateMock(mock.id, { ...mock, name });

    this.forceUpdate();
  };

  renderDisplayName() {
    if (this.props.mock.name) {
      return (
        <MockURL>{ this.props.mock.name }</MockURL>
      );
    }

    return (
      <MockURL dangerouslySetInnerHTML={{
        __html: getHighlightedText(this.props.mock.url, this.props.searchTerm)
      }}/>
    );
  }

  render() {
    const { onClick, isSelected, toggleMock, onContextMenu, mock, nested } = this.props;

    return this.props.connectDragSource(
      <div>
        <MockContainer onClick={ onClick }
                   onContextMenu={ onContextMenu }
                   isSelected={ isSelected }
                   nested={ nested }>

          <Icon src={ mock.isActive ? 'mocked' : 'unmocked' }
                style={{ marginRight: 5 }}
                onClick={ toggleMock }/>

          <MethodLabel>{ mock.method }</MethodLabel>

          <InlineEdit id={ mock.id } defaultValue={ mock.name } onSave={ this.onSave }>
            { this.renderDisplayName() }
          </InlineEdit>

          <MockStatus>{ mock.response && mock.response.status }</MockStatus>
        </MockContainer>
      </div>
    )
  }
}

export default DragSource('mock', mockSource, collect)(Mock);