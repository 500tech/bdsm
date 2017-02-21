import React from 'react';
import styled from 'styled-components';
import withAPI from 'ui/components/withAPI';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const Button = styled.button`
  border: 1px solid #a2bfe8;
  border-radius: 5px;
  background: transparent;
  padding: 3px;
  margin: 0 6px;
  outline: none;
  cursor: pointer;
  color: #4882d3;
  font-size: 14px;
`;

const Text = styled.span`
  color: #858585;
`;

export class MultiSelectView extends React.Component {

  groupMocks = () => {
    const group = this.props.API.addGroup({ name: 'Grouped Mocks' });

    if (group) {
      this.props.selectedMocks.forEach((mock) => this.props.API.updateMock(mock.id, { ...mock, groupId: group.id }));
    }

    this.props.clearSelection();
  };

  render() {
    return (
      <Container>
        <div>
          <Button onClick={ this.groupMocks }>Group</Button>
          <Text>these mocks</Text>
        </div>
      </Container>
    );
  }

}

export default withAPI(MultiSelectView);