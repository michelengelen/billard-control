import React, { Component, Fragment } from 'react';
import {
  Alert,
  Button,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
} from 'reactstrap';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import 'react-datepicker/dist/react-datepicker.css';
import { getDateString } from 'helpers/helpers';

const now = new Date().toJSON().split('T')[0];

class MemberEdit extends Component {
  render() {
    const { editId, errors, handleOnChange, member, tarifs } = this.props;
    const { isGuest } = member;

    if (!member.contact) member.contact = {};
    if (!member.adress) member.adress = {};
    if (!member.bank) member.bank = {};

    return (
      <AvForm onValidSubmit={this.props.handleSave}>
        <Row className="bc-content mr-0 pt-0">
          <Col xs={12}>
            <Row className="admin__member--header mb-3 mt-0">
              <Col xs={8} className="align-middle">
                {editId ? (
                  <blockquote className="blockquote">
                    <p className="mb-0 mt-3">Mitglied bearbeiten</p>
                    <footer className="blockquote-footer">
                      {`${member.firstname} ${member.lastname} // letzte Änderung: ${getDateString(
                        member.lastChange,
                        false,
                      )}`}
                    </footer>
                  </blockquote>
                ) : (
                  <blockquote className="blockquote">
                    <p className="mb-0 mt-3">Mitglied anlegen</p>
                    <footer className="blockquote-footer">
                      {`${member.firstname || ''} ${member.lastname || ''}`}
                    </footer>
                  </blockquote>
                )}
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
          <Alert color="danger" isOpen={errors.length > 0} toggle={this.props.clearErrors}>
            {errors.map(error => (
              <div>{error}</div>
            ))}
          </Alert>
          <Col xs={6}>
            <Card>
              <CardHeader>
                <h5 className="m-0">Stammdaten</h5>
              </CardHeader>
              <CardBody>
                <Row form>
                  <Col xs={isGuest ? 12 : 6}>
                    <AvField
                      type="text"
                      name="firstname"
                      id="firstname"
                      label={
                        <span>
                            {isGuest ? 'Name der Gastkarte' : 'Vorname'} <span className="text-danger"> *</span>
                        </span>
                      }
                      value={member.firstname || ''}
                      onChange={e => handleOnChange(e, 'firstname')}
                      validate={{
                        required: {
                          value: true,
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
                  {!isGuest && (
                    <Col xs={6}>
                      <AvField
                        disabled={isGuest}
                        type="text"
                        name="lastname"
                        id="lastname"
                        label={
                          <span>
                            Nachname <span className="text-danger"> *</span>
                          </span>
                        }
                        value={member.lastname || ''}
                        onChange={e => handleOnChange(e, 'lastname')}
                        validate={{
                          required: {
                            value: true,
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
                  )}
                </Row>
                <hr />
                <Row form>
                  <Col xs={12}>
                    <AvField
                      name="birthday"
                      type="date"
                      id="birthday"
                      label={<span>Geburtstag</span>}
                      validate={{
                        required: {
                          value: !isGuest,
                          errorMessage: 'Eingabe fehlt',
                        },
                        dateRange: {
                          start: { value: -150, units: 'years' },
                          end: { value: 0, units: 'days' },
                          errorMessage: 'Datum muss in der Vergangenheit liegen',
                        },
                      }}
                      max={now}
                      disabled={isGuest || !!editId}
                      value={!isGuest && member.birthday ? member.birthday.dateString : ''}
                      className="form-control"
                      onChange={(e, value) => handleOnChange(e, 'birthday', value)}
                    />
                  </Col>
                </Row>
                <hr />
                <Row form>
                  <Col xs={9}>
                    <FormGroup>
                      <AvField
                        type="text"
                        name="adress.street"
                        id="adress.street"
                        label={
                          <span>
                            Strasse <span className="text-danger"> *</span>
                          </span>
                        }
                        value={!isGuest && member.adress.street ? member.adress.street : ''}
                        onChange={e => handleOnChange(e, 'adress.street')}
                        validate={{
                          required: {
                            value: !isGuest,
                            errorMessage: 'Eingabe fehlt',
                          },
                          pattern: {
                            value: '^[A-Za-zäöüÄÖÜß.-\\s]+$',
                            errorMessage: 'Bitte nur Buchstaben, "." und  "-" verwenden',
                          },
                          minLength: {
                            value: 2,
                            errorMessage:
                              'Strassennamen mit weniger als 2 Zeichen sind nicht zulässig',
                          },
                        }}
                        disabled={isGuest}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={3}>
                    <FormGroup>
                      <AvField
                        type="text"
                        name="adress.number"
                        id="adress.number"
                        label={
                          <span>
                            Nummer <span className="text-danger"> *</span>
                          </span>
                        }
                        value={!isGuest && member.adress.number ? member.adress.number : ''}
                        onChange={e => handleOnChange(e, 'adress.number')}
                        validate={{
                          required: {
                            value: !isGuest,
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
                        disabled={isGuest}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col xs={3}>
                    <FormGroup>
                      <AvField
                        type="text"
                        name="adress.zip"
                        id="adress.zip"
                        label={
                          <span>
                            PLZ <span className="text-danger"> *</span>
                          </span>
                        }
                        value={!isGuest && member.adress.zip ? member.adress.zip : ''}
                        onChange={e => handleOnChange(e, 'adress.zip')}
                        validate={{
                          required: {
                            value: !isGuest,
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
                        disabled={isGuest}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={9}>
                    <AvField
                      type="text"
                      name="adress.city"
                      id="adress.city"
                      label={
                        <span>
                          Ort <span className="text-danger"> *</span>
                        </span>
                      }
                      value={!isGuest && member.adress.city ? member.adress.city : ''}
                      onChange={e => handleOnChange(e, 'adress.city')}
                      validate={{
                        required: {
                          value: !isGuest,
                          errorMessage: 'Eingabe fehlt',
                        },
                        pattern: {
                          value: '^[A-Za-zäöüÄÖÜß.-\\s]+$',
                          errorMessage: 'Bitte nur Buchstaben, "." und  "-" verwenden',
                        },
                        minLength: {
                          value: 2,
                          errorMessage: 'Städtenamen mit weniger als 2 Zeichen sind nicht zulässig',
                        },
                      }}
                      disabled={isGuest}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
            <hr />
            <Card>
              <CardHeader>
                <h5 className="m-0">Kontakte</h5>
              </CardHeader>
              <CardBody>
                <Row form>
                  <Col xs={12}>
                    <AvField
                      type="email"
                      name="contact.email"
                      id="contact.email"
                      label={<span>E-Mail</span>}
                      value={!isGuest && member.contact.email ? member.contact.email : ''}
                      onChange={e => handleOnChange(e, 'contact.email')}
                      validate={{
                        required: {
                          value: !isGuest,
                        },
                        email: {
                          value: true,
                          errorMessage: 'E-Mail nicht im korrekten Format',
                        },
                      }}
                      disabled={isGuest}
                    />
                  </Col>
                  <Col xs={12}>
                    <AvField
                      type="text"
                      name="contact.telephone"
                      id="contact.telephone"
                      label={<span>Telefon</span>}
                      value={!isGuest && member.contact.telephone ? member.contact.telephone :''}
                      onChange={e => handleOnChange(e, 'contact.telephone')}
                      validate={{
                        pattern: {
                          value: new RegExp(/(\(?([\d \-)–+/(]+){4,}\)?([ .\-–/]?)([\d]+))/),
                          errorMessage:
                            'Die Telefonnummer ist nicht korrekt formatiert.',
                        },
                      }}
                      disabled={isGuest}
                    />
                  </Col>
                  <Col xs={12}>
                    <AvField
                      type="text"
                      name="contact.mobile"
                      id="contact.mobile"
                      label={<span>Mobil</span>}
                      value={!isGuest && member.contact.mobile ? member.contact.mobile : ''}
                      onChange={e => handleOnChange(e, 'contact.mobile')}
                      validate={{
                        pattern: {
                          value: new RegExp(/(\(?([\d \-)–+\/(]+){4,}\)?([ .\-–\/]?)([\d]+))/),
                          errorMessage:
                            'Die Telefonnummer ist nicht korrekt formatiert.',
                        },
                      }}
                      disabled={isGuest}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col xs={6}>
            <Card>
              <CardHeader>
                <h5 className="m-0">Vereinsdaten</h5>
              </CardHeader>
              <CardBody>
                <Row form>
                  <Col xs={6}>
                    <FormGroup>
                      <Label for="id">Datenbank-ID</Label>
                      <Input
                        disabled
                        type="text"
                        name="id"
                        id="id"
                        value={editId || ''}
                        onChange={e => e.preventDefault()}
                        placeholder=""
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={6}>
                    <FormGroup>
                      <Label for="membernumber">Mitgliedsnummer</Label>
                      <Input
                        disabled
                        type="text"
                        name="membernumber"
                        id="membernumber"
                        value={member.membernumber}
                        onChange={e => e.preventDefault()}
                        placeholder=""
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={6}>
                    <AvField
                      name="entryDate"
                      type="date"
                      id="entryDate"
                      label={
                        <span>
                          Eintrittsdatum
                          {!editId && <span className="text-danger"> *</span>}
                        </span>
                      }
                      validate={
                        !editId
                          ? {
                              required: {
                                value: !editId,
                                errorMessage: 'Eingabe fehlt',
                              },
                              dateRange: {
                                start: { value: 0, units: 'days' },
                                end: { value: 20, units: 'years' },
                                errorMessage: 'Datum muss in der Zukunft liegen',
                              },
                            }
                          : {}
                      }
                      min={!!editId ? new Date(0) : now}
                      disabled={!!editId}
                      value={member.entryDate ? member.entryDate.dateString : ''}
                      className="form-control"
                      onChange={(e, value) => handleOnChange(e, 'entryDate', value)}
                    />
                  </Col>
                  <Col xs={6}>
                    <AvField
                      name="exitDate"
                      type="date"
                      id="exitDate"
                      label={
                        <span>
                          Austrittsdatum
                          {!member.active && <span className="text-danger"> *</span>}
                        </span>
                      }
                      required={!member.active}
                      validate={{
                        required: {
                          value: !member.active,
                          errorMessage: 'Eingabe fehlt',
                        },
                        dateRange: {
                          start: { value: 0, units: 'days' },
                          end: { value: 20, units: 'years' },
                          errorMessage: 'Datum muss in der Zukunft liegen',
                        },
                      }}
                      min={now}
                      disabled={isGuest || !editId || member.active}
                      value={member.exitDate ? member.exitDate.dateString : ''}
                      className="form-control"
                      onChange={(e, value) => handleOnChange(e, 'exitDate', value)}
                    />
                  </Col>
                  <Col xs={12}>
                    <AvField
                      required
                      type="select"
                      name="select"
                      id="tarifId"
                      errorMessage="Bitte einen Tarif auswählen"
                      label={
                        <span>
                          Tarif<span className="text-danger"> *</span>
                        </span>
                      }
                      value={!isGuest && member.tarifId ? member.tarifId : ''}
                      onChange={e => handleOnChange(e, 'tarifId')}
                    >
                      {isGuest ? (
                        <option value={null}>Gastkarte</option>
                      ) : (
                        <Fragment>
                          <option value={null}>Bitte einen Tarif wählen</option>
                          {Object.keys(tarifs).map(tarifKey => (
                            <option key={`select_${tarifKey}`} value={tarifKey}>
                              {tarifs[tarifKey].name}
                            </option>
                          ))}
                        </Fragment>
                      )}
                    </AvField>
                  </Col>
                  <Col xs={6}>
                    <AvField
                      name="active"
                      id="active"
                      type="checkbox"
                      label={<span> aktives Mitglied</span>}
                      disabled={!editId}
                      value={member.active}
                      onChange={() => handleOnChange(null, 'active', !member.active)}
                    />
                  </Col>
                  <Col xs={6}>
                    <AvField
                      name="isGuest"
                      id="isGuest"
                      type="checkbox"
                      label={<span> Gastkarte</span>}
                      value={member.isGuest}
                      onChange={() => handleOnChange(null, 'isGuest', !member.isGuest)}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
            <hr />
            <Card>
              <CardHeader>
                <h5 className="m-0">Kontodaten</h5>
              </CardHeader>
              <CardBody>
                <Row form>
                  <Col xs={12}>
                    <AvField
                      type="text"
                      name="bank.name"
                      id="bank.name"
                      label={
                        <span>
                          Name der Bank <span className="text-danger"> *</span>
                        </span>
                      }
                      value={member.bank.name || ''}
                      onChange={e => handleOnChange(e, 'bank.name')}
                      validate={{
                        required: {
                          value: true,
                          errorMessage: 'Eingabe fehlt',
                        },
                        pattern: {
                          value: '^[A-Za-z0-9.-\\s]+$',
                          errorMessage: 'Bitte nur Buchstaben, Zahlen, "." und  "-" verwenden',
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
                      type="text"
                      name="bank.iban"
                      id="bank.iban"
                      label={
                        <span>
                          IBAN <span className="text-danger"> *</span>
                        </span>
                      }
                      value={member.bank.iban || ''}
                      onChange={e => handleOnChange(e, 'bank.iban')}
                      validate={{
                        required: {
                          value: true,
                          errorMessage: 'Eingabe fehlt',
                        },
                        pattern: {
                          value: '^[A-Z0-9]+$',
                          errorMessage:
                            'Bitte nur Grossbuchstaben und Zahlen verwenden (ohne Leerzeichen)',
                        },
                        minLength: {
                          value: 15,
                          errorMessage: 'Die IBAN muss mindestens 15 Zeichen haben',
                        },
                      }}
                    />
                  </Col>
                  <Col xs={12}>
                    <AvField
                      type="text"
                      name="bank.holder"
                      id="bank.holder"
                      label={
                        <span>
                          Kontoinhaber <span className="text-danger"> *</span>
                        </span>
                      }
                      value={member.bank.holder || ''}
                      onChange={e => handleOnChange(e, 'bank.holder')}
                      validate={{
                        required: {
                          value: true,
                          errorMessage: 'Eingabe fehlt',
                        },
                        pattern: {
                          value: '^[A-Za-z0-9.-\\s]+$',
                          errorMessage: 'Bitte nur Buchstaben und  "-" verwenden',
                        },
                        minLength: {
                          value: 2,
                          errorMessage: 'Namen mit weniger als 2 Zeichen sind nicht zulässig',
                        },
                      }}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </AvForm>
    );
  }
}

export default MemberEdit;
