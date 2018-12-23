import React, { Component } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardTitle,
  CardFooter,
  Col,
  Collapse,
  Form,
  FormGroup,
  Label,
  Input,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
  Table,
} from 'reactstrap';
import { membersRef, tarifsRef } from 'firebase-config/config';
import { sortByProperty } from 'helpers/helpers';
import { Icon } from 'components/common';
import { Icons } from 'variables/constants';

import MemberEdit from 'components/container/adminMemberEdit';

class MembersList extends Component {
  constructor(props) {
    super(props);

    this.deleteDoc = this.deleteDoc.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.validateAndSave = this.validateAndSave.bind(this);
    this.openCategory = this.openCategory.bind(this);

    this.state = {
      openCategory: '',
      openModal: false,
    };
  }

  deleteDoc(id) {
    membersRef.doc(id).delete().then(() => {
      console.log('Document successfully deleted!');
      this.closeModal();
    }).catch(function(error) {
      console.error('Error removing document: ', error);
    });
  }

  closeModal() {
    this.setState({
      openModal: false,
    });
  }

  renderTable(members) {
    const { tarifs } = this.props;
    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>Nach-, Vorname</th>
            <th>Mitgliedsnummer</th>
            <th className="text-center">Tarif</th>
            <th className="text-center">aktueller Deckel</th>
            <th className="text-center">Eintritt</th>
            <th className="text-center">Austritt</th>
            <th className="text-center">{' '}</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={`memberTable_${index}_${member.id}`}>
              <td>{`${member.lastname}, ${member.firstname}`}</td>
              <td>{member.number}</td>
              <td className="text-center">{tarifs[member.tarifId].name}</td>
              <td className="text-center">{member.currentbill || '---'}</td>
              <td className="text-center">{member.entry}</td>
              <td className="text-center">{member.exit || '---'}</td>
              <td className="text-right">
                <Button color="primary" size="sm">
                  <Icon
                    color="#EEEEEE"
                    size={16}
                    icon={Icons.PENCIL}
                    onClick={() => this.props.editMember(member.id)}
                  />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )
  }

  handleOnChange(e, fieldKey, maskedValue, floatValue) {
    e.preventDefault();
    let newValue = 0;
    if (floatValue || floatValue === 0) {
      newValue = floatValue;
    } else {
      newValue = e.currentTarget.value;
    }
    this.setState(prevState => ({
      editValues: {
        ...prevState.editValues,
        [fieldKey]: newValue
      },
    }));
  }

  validateAndSave() {
    if (this.state.editId) {
      membersRef.doc(this.state.editId).set(this.state.editValues)
        .then(this.closeModal);
    } else {
      membersRef.add({ ...this.state.editValues }).then(this.closeModal);
    }
  }

  openCategory(id) {
    this.setState(prevState => ({
      openCategory: prevState.openCategory === id ? '' : id
    }));
  }

  render() {
    const { openCategory } = this.state;
    const { members } = this.props;
    const activeMembers = members.filter(
      member => member.active,
    );
    const inactiveMembers = members.filter(
      member => !member.active,
    );
    return (
      <Row className="bc-content mr-0 pt-3">
        <Col xs={12}>
          <Card body>
            <CardTitle>Mitglieder</CardTitle>
            <ListGroup flush className="mx-neg-3">
              <div>
                <ListGroupItem
                  action
                  active={openCategory === 'activeMembers'}
                >
                  <Row>
                    <Col xs={9} className="align-top">
                      {'aktive Mitglieder'}
                      {' '}
                      <Badge color="success">
                        {activeMembers.length}
                      </Badge>
                    </Col>
                    <Col xs={3} className="text-right">
                      <Button
                        color="secondary"
                        size="sm"
                        onClick={() => this.openCategory('activeMembers')}
                      >
                        <Icon
                          color="#EEEEEE"
                          size={16}
                          icon={
                            openCategory === 'activeMembers'
                              ? Icons.CHEVRON.UP
                              : Icons.CHEVRON.DOWN
                          }
                        />
                      </Button>
                    </Col>
                  </Row>
                </ListGroupItem>
                {activeMembers.length > 0 &&
                  <Collapse isOpen={openCategory === 'activeMembers'}>
                    {this.renderTable(activeMembers)}
                  </Collapse>
                }
              </div>
              <div>
                <ListGroupItem
                  action
                  active={openCategory === 'inactiveMembers'}
                >
                  <Row>
                    <Col xs={9} className="align-top">
                      {'inaktive Mitglieder'}
                      {' '}
                      <Badge color="success">
                        {inactiveMembers.length}
                      </Badge>
                    </Col>
                    <Col xs={3} className="text-right">
                      <Button
                        color="secondary"
                        size="sm"
                        onClick={() => this.openCategory('inactiveMembers')}
                      >
                        <Icon
                          color="#EEEEEE"
                          size={16}
                          icon={
                            openCategory === 'inactiveMembers'
                              ? Icons.CHEVRON.UP
                              : Icons.CHEVRON.DOWN
                          }
                        />
                      </Button>
                    </Col>
                  </Row>
                </ListGroupItem>
                {inactiveMembers.length > 0 &&
                  <Collapse isOpen={openCategory === 'inactiveMembers'}>
                    {this.renderTable(inactiveMembers)}
                  </Collapse>
                }
              </div>
            </ListGroup>
            <CardFooter className="align-items-end">
              <Button
                color="success"
                onClick={() => this.props.editMember('')}
              >
                Neues Mitglied anlegen
              </Button>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default MembersList;
