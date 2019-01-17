import React, { Component } from 'react';
import {
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
import { ClubDataContext } from 'contexts/clubDataContext';

import { clubDataRef } from 'firebase-config/config';
import { getDateString } from 'helpers/helpers';
import { Icons } from 'variables/constants';

class ClubData extends Component {
  constructor(props) {
    super(props);

    this.validateAndSave = this.validateAndSave.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.renderBoardMember = this.renderBoardMember.bind(this);
    this.openPosition = this.openPosition.bind(this);

    this.state = {
      docId: '',
      editDoc: {},
      loading: true,
    };
  }

  componentDidMount() {
    clubDataRef.get().then(snapShot => {
      clubDataRef.doc(snapShot.docs[0].id).onSnapshot(querySnapshot => {
        this.setState({
          editDoc: {
            ...querySnapshot.data(),
          },
          docId: snapShot.docs[0].id,
          loading: false,
        });
      });
    });
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
    const { editDoc, openPosition } = this.state;
    return (
      <ListGroupItem active={position === openPosition} className="p-0">
        <Row className="p-3">
          <Col xs={9} className="align-top">
            {title}
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
            <Col xs={6}>
              <AvField
                type="text"
                name={`board.${position}.firstname`}
                id={`board.${position}.firstname`}
                label={<span>Vorname {required && <span className="text-danger"> *</span>}</span>}
                value={
                  editDoc.board && editDoc.board[position] ? editDoc.board[position].firstname : ''
                }
                onChange={e => this.handleOnChange(e, 'board', `${position}.firstname`)}
                validate={{
                  required: {
                    value: required,
                    errorMessage: 'Eingabe fehlt',
                  },
                  pattern: {
                    value: '^[A-Za-z-\\s]+$',
                    errorMessage: 'Bitte nur Buchstaben und "-" verwenden',
                  },
                  minLength: {
                    value: 2,
                    errorMessage: 'Namen mit weniger als 2 Zeichen sind nicht zulässig',
                  },
                }}
              />
            </Col>
            <Col xs={6}>
              <AvField
                type="text"
                name={`board.${position}.lastname`}
                id={`board.${position}.lastname`}
                label={<span>Nachname {required && <span className="text-danger"> *</span>}</span>}
                value={
                  editDoc.board && editDoc.board[position] ? editDoc.board[position].lastname : ''
                }
                onChange={e => this.handleOnChange(e, 'board', `${position}.lastname`)}
                validate={{
                  required: {
                    value: required,
                    errorMessage: 'Eingabe fehlt',
                  },
                  pattern: {
                    value: '^[A-Za-z-\\s]+$',
                    errorMessage: 'Bitte nur Buchstaben und "-" verwenden',
                  },
                  minLength: {
                    value: 2,
                    errorMessage: 'Namen mit weniger als 2 Zeichen sind nicht zulässig',
                  },
                }}
              />
            </Col>
            <Col xs={12}>
              <AvField
                type="email"
                name={`board.${position}.email`}
                id={`board.${position}.email`}
                label={<span>E-Mail {required && <span className="text-danger"> *</span>}</span>}
                value={
                  editDoc.board && editDoc.board[position] ? editDoc.board[position].email : ''
                }
                onChange={e => this.handleOnChange(e, 'board', `${position}.email`)}
                validate={{
                  required: {
                    value: required,
                    errorMessage: 'Eingabe fehlt',
                  },
                  email: {
                    value: true,
                    errorMessage: 'E-Mail nicht im korrekten Format',
                  },
                }}
              />
            </Col>
          </Row>
        </Collapse>
      </ListGroupItem>
    );
  }

  validateAndSave() {
    this.setState({ loading: true });
    clubDataRef
      .doc(this.state.docId)
      .set({ ...this.state.editDoc, lastChange: new Date() })
      .then(() => this.setState({ loading: false }));
  }

  render() {
    const { editDoc } = this.state;
    console.log('#### RENDER');
    return (
      <AvForm onValidSubmit={this.validateAndSave}>
        <div className="bc-content__wrapper mr-0 pt-0">
          <ActivityIndicator loading={this.state.loading} />
          <Col xs={12}>
            <Row className="admin__member--header mb-3 mt-0">
              <Col xs={8} className="align-middle">
                <blockquote className="blockquote">
                  <p className="mb-0 mt-3">Vereinsdaten bearbeiten</p>
                  <footer className="blockquote-footer">
                    {`letzte Änderung: ${getDateString(editDoc.lastChange, false)}`}
                  </footer>
                </blockquote>
              </Col>
              <Col xs={4} className="py-3 text-right">
                <Button type="submit" color="success">
                  Speichern
                </Button>{' '}
                <Button color="danger" onClick={this.props.cancelEdit}>
                  Abbrechen
                </Button>
              </Col>
            </Row>
          </Col>
          <Col xs={12}>
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
                          value={editDoc.info && editDoc.info.adress ? editDoc.info.adress.zip : ''}
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
                        value={editDoc.info && editDoc.info.adress ? editDoc.info.adress.city : ''}
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
                          editDoc.info && editDoc.info.contact ? editDoc.info.contact.telephone : ''
                        }
                        onChange={e => this.handleOnChange(e, 'info', 'contact.telephone')}
                        validate={{
                          required: {
                            value: true,
                            errorMessage: 'Eingabe fehlt',
                          },
                          pattern: {
                            value: /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/,
                            errorMessage:
                              'Die Telefonnummer ist nicht korreekt formatiert. Beispiel: +49 4281 1234567',
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
                            errorMessage: 'Eingaben mit weniger als 2 Zeichen sind nicht zulässig',
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
                            errorMessage: 'Eingaben mit weniger als 2 Zeichen sind nicht zulässig',
                          },
                        }}
                      />
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </div>
          </Col>
        </div>
      </AvForm>
    );
  }
}

export default ClubData;
