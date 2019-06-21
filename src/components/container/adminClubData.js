import React, { Component } from 'react';
import {
  Alert,
  Button,
  Col,
  Collapse,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  ListGroup,
  ListGroupItem,
  Row,
} from 'reactstrap';
import { AvField, AvForm } from 'availity-reactstrap-validation';

import { ActivityIndicator, Icon } from 'components/common';

import { clubDataRef } from 'firebase-config/config';
import { getDateString } from 'helpers/helpers';
import { Icons } from 'variables/constants';
import { ClubDataContext } from 'contexts/clubDataContext';
import isEqual from 'lodash.isequal';
import { _ } from 'helpers/utils';

class ClubData extends Component {
  constructor(props) {
    super(props);

    this.validateAndSave = this.validateAndSave.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.renderBoardMember = this.renderBoardMember.bind(this);
    this.openPosition = this.openPosition.bind(this);
    this.handleBoardMemberChange = this.handleBoardMemberChange.bind(this);

    this.listeners = {};

    this.state = {
      alert: null,
      editDoc: {},
      boardMembers: {},
      loading: true,
    };
  }

  componentDidMount() {
    this.listeners.clubDataRef = clubDataRef.onSnapshot(querySnapshot => {
      if (querySnapshot.exists) {
        this.setState({
          editDoc: {
            ...querySnapshot.data(),
          },
        });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    const { state } = this;
    if (
      !isEqual(prevState, state) &&
      prevState.loading &&
      typeof state.editDoc === 'object'
    ) {
      this.setState({ loading: false });
    }
  }

  componentWillUnmount() {
    const { listeners } = this;
    const listenerKeys = Object.keys(listeners);
    listenerKeys.forEach(key => {
      if (
        Object.prototype.hasOwnProperty.call(listeners, key) &&
        typeof listeners[key] === 'function'
      ) {
        listeners[key]();
      }
    });
  }

  handleBoardMemberChange(e, position) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const { members } = this.context;

    const newValue = e.currentTarget.value;

    const refinedMember = {};
    const memberIndex = members.findIndex(member => member.membernumber === parseInt(newValue));
    if (memberIndex > -1) {
      refinedMember.membernumber = members[memberIndex].membernumber;
      refinedMember.firstname = members[memberIndex].firstname;
      refinedMember.lastname = members[memberIndex].lastname;
      refinedMember.adress = {
        ...members[memberIndex].adress,
      };
      refinedMember.contact = {
        ...members[memberIndex].contact,
      };
    }

    this.setState(prevState => ({
      boardMembers: {
        ...prevState.boardMembers,
        [position]: newValue,
      },
      editDoc: {
        ...prevState.editDoc,
        board: {
          ...prevState.editDoc.board,
          [position]: refinedMember,
        },
      },
    }));
  }

  handleOnChange(e, groupKey, fieldKey, value = null) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    let newValue = 0;
    if (e && e.currentTarget) {
      newValue = e.currentTarget.value;
    } else {
      newValue = value;
    }

    if (e && e.currentTarget && e.currentTarget.type === 'date') {
      newValue = {
        timestamp: new Date(value),
        dateString: value,
      };
    }

    if (fieldKey.indexOf('.') > 0) {
      const splitFieldKey = fieldKey.split('.');
      this.setState(prevState => ({
        editDoc: {
          ...prevState.editDoc,
          [groupKey]: {
            ...prevState.editDoc[groupKey],
            [splitFieldKey[0]]: {
              ...prevState.editDoc[groupKey][splitFieldKey[0]],
              [splitFieldKey[1]]: newValue,
            },
          },
        },
      }));
      return;
    }

    this.setState(prevState => ({
      editDoc: {
        ...prevState.editDoc,
        [groupKey]: {
          ...prevState.editDoc[groupKey],
          [fieldKey]: newValue,
        },
      },
    }));
  }

  openPosition(position) {
    this.setState(prevState => ({
      openPosition: prevState.openPosition === position ? '' : position,
    }));
  }

  renderBoardMember(title, position, required) {
    const { editDoc, openPosition, boardMembers } = this.state;

    const positionFilled = _.get(editDoc, `board[${position}].firstname`, false);
    const hasError = !!_.get(editDoc, `board[${position}].firstname`, true);

    return (
      <ListGroupItem active={position === openPosition} className="p-0">
        <Row className="p-3">
          <Col xs={9} className="align-top">
            {hasError && (
              <Icon className="d-inline-block" icon={Icons.SIGNS.ERROR} size={14} color="#dc3545" />
            )}
            <span className={hasError ? 'font-italic text-danger pl-2' : ''}>{title}</span>
          </Col>
          <Col xs={3} className="text-right">
            <Button color="secondary" size="sm" onClick={() => this.openPosition(position)}>
              <Icon
                color="#EEEEEE"
                size={16}
                icon={position === openPosition ? Icons.CHEVRON.UP : Icons.CHEVRON.DOWN}
              />
            </Button>
          </Col>
        </Row>
        <Collapse isOpen={position === openPosition} className="bg-light text-dark">
          <Row className="p-3">
            <Col xs={12}>
              <AvField
                type="text"
                name={`board.${position}.membernumber`}
                id={`board.${position}.membernumber`}
                label={
                  <span>Mitgliedsnummer {required && <span className="text-danger"> *</span>}</span>
                }
                value={
                  boardMembers[position] ||
                  (editDoc.board &&
                    editDoc.board[position] &&
                    editDoc.board[position].membernumber) ||
                  ''
                }
                onChange={e => this.handleBoardMemberChange(e, position)}
                validate={{
                  required: {
                    value: required,
                    errorMessage: 'Eingabe fehlt',
                  },
                  pattern: {
                    value: '^[0-9]+$',
                    errorMessage: 'Bitte nur Zahlen verwenden',
                  },
                }}
              />
              {positionFilled && (
                <div>
                  <h6 className="text-muted border-bottom pb-2 m-0">ausgewähltes Mitglied</h6>
                  {`${editDoc.board[position].firstname} ${editDoc.board[position].lastname}`}
                </div>
              )}
            </Col>
          </Row>
        </Collapse>
      </ListGroupItem>
    );
  }

  validateAndSave() {
    this.setState({ loading: true });
    clubDataRef.set({ ...this.state.editDoc, lastChange: new Date() }).then(() => {
      this.setState({
        alert: {
          type: 'success',
          message: 'Daten wurden erfolgreich aktualisiert',
        },
        loading: false,
      });
    });
  }

  render() {
    const { editDoc, alert } = this.state;
    return (
      <div className="bc-content__wrapper">
        <AvForm onValidSubmit={() => this.validateAndSave()}>
          <ActivityIndicator loading={this.state.loading} />
          <Row className="bc-content mr-0 pt-0">
            <Col xs={12}>
              <Row className="admin__member--header mb-3 mt-0">
                <Col xs={8} className="align-middle">
                  <blockquote className="blockquote">
                    <p className="mb-0 mt-3">Vereinsdaten bearbeiten</p>
                    <footer className="blockquote-footer">
                      {`letzte Änderung: ${
                        editDoc.lastChange
                          ? getDateString(editDoc.lastChange, false)
                          : '---'}`
                      }
                    </footer>
                  </blockquote>
                </Col>
                <Col xs={4} className="py-3 text-right">
                  <Button type="submit" color="success">
                    Speichern
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col xs={12}>
              <Alert
                color={alert && alert.type}
                isOpen={!!alert}
                toggle={() => {
                  this.setState({ alert: null });
                }}
              >
                {alert && alert.message}
              </Alert>
              <div className="card-columns">
                <Card>
                  <CardHeader>
                    <h5 className="m-0">Vorstand</h5>
                  </CardHeader>
                  <ListGroup flush>
                    {this.renderBoardMember('1. Vorsitzender', 'first', true)}
                    {this.renderBoardMember('2. Vorsitzender', 'second', true)}
                    {this.renderBoardMember('Kassenwart', 'accountant', true)}
                    {this.renderBoardMember('Schriftwart', 'writer', false)}
                    {this.renderBoardMember('Sportwart', 'sport', false)}
                    {this.renderBoardMember('Jugendwart', 'youth', false)}
                  </ListGroup>
                </Card>
                <Card>
                  <CardHeader>
                    <h5 className="m-0">Adresse</h5>
                  </CardHeader>
                  <CardBody>
                    <Row form>
                      <Col xs={12}>
                        <AvField
                          type="text"
                          name={'info.name'}
                          id={'info.name'}
                          label={
                            <span>
                              Vereinsname <span className="text-danger"> *</span>
                            </span>
                          }
                          value={editDoc.info ? editDoc.info.name : ''}
                          onChange={e => this.handleOnChange(e, 'info', 'name')}
                          validate={{
                            required: {
                              value: true,
                              errorMessage: 'Eingabe fehlt',
                            },
                            pattern: {
                              value: '^[A-Za-z.-\\s]+$',
                              errorMessage: 'Bitte nur Buchstaben, "." und  "-" verwenden',
                            },
                            minLength: {
                              value: 2,
                              errorMessage: 'Namen mit weniger als 2 Zeichen sind nicht zulässig',
                            },
                          }}
                        />
                      </Col>
                    </Row>
                    <Row form>
                      <Col xs={9}>
                        <FormGroup>
                          <AvField
                            type="text"
                            name="info.adress.street"
                            id="info.adress.street"
                            label={
                              <span>
                                Strasse <span className="text-danger"> *</span>
                              </span>
                            }
                            value={
                              editDoc.info && editDoc.info.adress ? editDoc.info.adress.street : ''
                            }
                            onChange={e => this.handleOnChange(e, 'info', 'adress.street')}
                            validate={{
                              required: {
                                value: true,
                                errorMessage: 'Eingabe fehlt',
                              },
                              pattern: {
                                value: '^[A-Za-z.-\\s]+$',
                                errorMessage: 'Bitte nur Buchstaben, "." und  "-" verwenden',
                              },
                              minLength: {
                                value: 2,
                                errorMessage:
                                  'Strassennamen mit weniger als 2 Zeichen sind nicht zulässig',
                              },
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs={3}>
                        <FormGroup>
                          <AvField
                            type="text"
                            name="info.adress.number"
                            id="info.adress.number"
                            label={
                              <span>
                                Nummer <span className="text-danger"> *</span>
                              </span>
                            }
                            value={
                              editDoc.info && editDoc.info.adress ? editDoc.info.adress.number : ''
                            }
                            onChange={e => this.handleOnChange(e, 'info', 'adress.number')}
                            validate={{
                              required: {
                                value: true,
                                errorMessage: 'Eingabe fehlt',
                              },
                              pattern: {
                                value: '^[A-Za-z0-9]+$',
                                errorMessage: 'Bitte nur Buchstaben und Zahlen verwenden',
                              },
                              minLength: {
                                value: 1,
                                errorMessage: 'Eingabe ungültig',
                              },
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row form>
                      <Col xs={3}>
                        <FormGroup>
                          <AvField
                            type="text"
                            name="info.adress.zip"
                            id="info.adress.zip"
                            label={
                              <span>
                                PLZ <span className="text-danger"> *</span>
                              </span>
                            }
                            value={
                              editDoc.info && editDoc.info.adress ? editDoc.info.adress.zip : ''
                            }
                            onChange={e => this.handleOnChange(e, 'info', 'adress.zip')}
                            validate={{
                              required: {
                                value: true,
                                errorMessage: 'Eingabe fehlt',
                              },
                              pattern: {
                                value: '^[0-9]+$',
                                errorMessage: 'Bitte nur Zahlen verwenden',
                              },
                              minLength: {
                                value: 5,
                                errorMessage: 'Eingabe ungültig',
                              },
                              maxLength: {
                                value: 5,
                                errorMessage: 'Eingabe ungültig',
                              },
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs={9}>
                        <AvField
                          type="text"
                          name="info.adress.city"
                          id="info.adress.city"
                          label={
                            <span>
                              Ort <span className="text-danger"> *</span>
                            </span>
                          }
                          value={
                            editDoc.info && editDoc.info.adress ? editDoc.info.adress.city : ''
                          }
                          onChange={e => this.handleOnChange(e, 'info', 'adress.city')}
                          validate={{
                            required: {
                              value: true,
                              errorMessage: 'Eingabe fehlt',
                            },
                            pattern: {
                              value: '^[A-Za-z.-\\s]+$',
                              errorMessage: 'Bitte nur Buchstaben, "." und  "-" verwenden',
                            },
                            minLength: {
                              value: 2,
                              errorMessage:
                                'Städtenamen mit weniger als 2 Zeichen sind nicht zulässig',
                            },
                          }}
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader>
                    <h5 className="m-0">Kontakt</h5>
                  </CardHeader>
                  <CardBody>
                    <Row form>
                      <Col xs={12}>
                        <AvField
                          type="text"
                          name={'info.contact.email'}
                          id={'info.contact.email'}
                          label={
                            <span>
                              E-Mail Adresse <span className="text-danger"> *</span>
                            </span>
                          }
                          value={
                            editDoc.info && editDoc.info.contact ? editDoc.info.contact.email : ''
                          }
                          onChange={e => this.handleOnChange(e, 'info', 'contact.email')}
                          validate={{
                            required: {
                              value: true,
                              errorMessage: 'Eingabe fehlt',
                            },
                            email: {
                              value: true,
                              errorMessage: 'E-Mail nicht im korrekten Format',
                            },
                          }}
                        />
                      </Col>
                      <Col xs={12}>
                        <AvField
                          type="text"
                          name="info.contact.telephone"
                          id="info.contact.telephone"
                          label={
                            <span>
                              Telefon <span className="text-danger"> *</span>
                            </span>
                          }
                          value={
                            editDoc.info && editDoc.info.contact
                              ? editDoc.info.contact.telephone
                              : ''
                          }
                          onChange={e => this.handleOnChange(e, 'info', 'contact.telephone')}
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader>
                    <h5 className="m-0">Kontakt</h5>
                  </CardHeader>
                  <CardBody>
                    <Row form>
                      <Col xs={12}>
                        <AvField
                          type="text"
                          name={'info.legal.regCourt'}
                          id={'info.legal.regCourt'}
                          label={
                            <span>
                              Registergericht <span className="text-danger"> *</span>
                            </span>
                          }
                          value={
                            editDoc.info && editDoc.info.legal ? editDoc.info.legal.regCourt : ''
                          }
                          onChange={e => this.handleOnChange(e, 'info', 'legal.regCourt')}
                          validate={{
                            required: {
                              value: true,
                              errorMessage: 'Eingabe fehlt',
                            },
                            pattern: {
                              value: '^[A-Za-z0-9.-\\s]+$',
                              errorMessage: 'Bitte nur Buchstaben, Ziffern, "." und  "-" verwenden',
                            },
                            minLength: {
                              value: 2,
                              errorMessage:
                                'Eingaben mit weniger als 2 Zeichen sind nicht zulässig',
                            },
                          }}
                        />
                      </Col>
                      <Col xs={12}>
                        <AvField
                          type="text"
                          name={'info.legal.regNumber'}
                          id={'info.legal.regNumber'}
                          label={
                            <span>
                              Registernummer <span className="text-danger"> *</span>
                            </span>
                          }
                          value={
                            editDoc.info && editDoc.info.legal ? editDoc.info.legal.regNumber : ''
                          }
                          onChange={e => this.handleOnChange(e, 'info', 'legal.regNumber')}
                          validate={{
                            required: {
                              value: true,
                              errorMessage: 'Eingabe fehlt',
                            },
                            pattern: {
                              value: '^[A-Za-z0-9.-\\s]+$',
                              errorMessage: 'Bitte nur Buchstaben, Ziffern, "." und  "-" verwenden',
                            },
                            minLength: {
                              value: 2,
                              errorMessage:
                                'Eingaben mit weniger als 2 Zeichen sind nicht zulässig',
                            },
                          }}
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </div>
            </Col>
          </Row>
        </AvForm>
      </div>
    );
  }
}

export default ClubData;
ClubData.contextType = ClubDataContext;
