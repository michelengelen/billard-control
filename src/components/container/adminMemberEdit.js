import React, { Component } from 'react';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  CardTitle,
  Col,
  Row,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

class MemberEdit extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      editId,
      errors,
      handleOnChange,
      member,
      membernumber,
      tarifs,
    } = this.props;

    if (!member.adress) member.adress = {};

    return (
      <Form>
        <Row className="bc-content mr-0 pt-3">
          <Col xs={12}>
            <Row className="admin__member--header">
              <Col xs={9} className="align-middle">
                <h3 className="my-0">
                  {editId ? 'Mitglied bearbeiten' : 'Mitglied anlegen'}
                </h3>
              </Col>
              <Col xs={3} className="py-3 text-right">
                <Button
                  color="success"
                  onClick={this.props.handleSave}
                >
                  Speichern
                </Button>
                {' '}
                <Button
                  color="danger"
                  onClick={this.props.cancelEdit}
                >
                  Abbrechen
                </Button>
              </Col>
            </Row>
          </Col>
          <Alert
            color="danger"
            isOpen={errors.length > 0}
            toggle={this.props.clearErrors}
          >
            {errors.map(error => (
              <div>{error}</div>
            ))}
          </Alert>
          <Col xs={6}>
            <Card body>
              <CardTitle>Stammdaten</CardTitle>
              <CardBody>
                <Row form>
                  <Col xs={6}>
                    <FormGroup>
                      <Label for="firstname">
                        Vorname <span className="text-danger"> *</span>
                      </Label>
                      <Input
                        type="text"
                        name="firstname"
                        id="firstname"
                        invalid={!member.firstname && (member.firstname === '')}
                        value={member.firstname || ''}
                        onChange={e => handleOnChange(e, 'firstname')}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={6}>
                    <FormGroup>
                      <Label for="lastname">
                        Nachname <span className="text-danger"> *</span>
                      </Label>
                      <Input
                        type="text"
                        name="lastname"
                        id="lastname"
                        invalid={!member.lastname && (member.lastname === '')}
                        value={member.lastname || ''}
                        onChange={e => handleOnChange(e, 'lastname')}
                        placeholder=""
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col xs={10}>
                    <FormGroup>
                      <Label for="adress.street">
                        Strasse <span className="text-danger"> *</span>
                      </Label>
                      <Input
                        type="text"
                        name="adress.street"
                        id="adress.street"
                        invalid={
                          !member.adress.street && member.adress.street === ''
                        }
                        value={member.adress.street || ''}
                        onChange={e => handleOnChange(e, 'adress.street')}
                        placeholder=""
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={2}>
                    <FormGroup>
                      <Label for="adress.number">
                        Nr. <span className="text-danger"> *</span>
                      </Label>
                      <Input
                        type="text"
                        name="adress.number"
                        id="adress.number"
                        invalid={
                          !member.adress.number && member.adress.number === ''
                        }
                        value={member.adress.number || ''}
                        onChange={e => handleOnChange(e, 'adress.number')}
                        placeholder=""
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col xs={3}>
                    <FormGroup>
                      <Label for="adress.zip">
                        PLZ <span className="text-danger"> *</span>
                      </Label>
                      <Input
                        type="text"
                        name="adress.zip"
                        id="adress.zip"
                        invalid={
                          !member.adress.zip && member.adress.zip === ''
                        }
                        value={member.adress.zip || ''}
                        onChange={e => handleOnChange(e, 'adress.zip')}
                        placeholder=""
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={9}>
                    <FormGroup>
                      <Label for="adress.city">
                        Ort <span className="text-danger"> *</span>
                      </Label>
                      <Input
                        type="text"
                        name="adress.city"
                        id="adress.city"
                        invalid={
                          !member.adress.city && member.adress.city === ''
                        }
                        value={member.adress.city || ''}
                        onChange={e => handleOnChange(e, 'adress.city')}
                        placeholder=""
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col xs={6}>
            <Card body>
              <CardTitle>Vertrag, etc.</CardTitle>
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
                </Row>
                <Row form>
                  <Col xs={6}>
                    <FormGroup>
                      <Label for="entryDate">
                        Eintrittsdatum
                        {!editId && <span className="text-danger"> *</span> }
                      </Label>
                      <DatePicker
                        disabled={!!editId}
                        selected={member.entryDate}
                        minDate={new Date()}
                        onChange={value => handleOnChange(null, 'entryDate', value)}
                        todayButton="Heute"
                        dateFormat="dd.MM.yyyy"
                        className="form-control"
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={6}>
                    <FormGroup>
                      <Label for="exitDate">Austrittsdatum</Label>
                      <DatePicker
                        disabled={!editId || !member.active}
                        selected={member.exitDate}
                        minDate={new Date()}
                        onChange={value => handleOnChange(null, 'exitDate', value)}
                        todayButton="Heute"
                        className="form-control"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col xs={12}>
                    <FormGroup>
                      <Label for="tarifId">Tarif</Label>
                      <Input
                        type="select"
                        value={member.tarifId || ''}
                        name="select"
                        id="tarifId"
                        onChange={e => handleOnChange(e, 'tarifId')}
                      >
                        {Object.keys(tarifs).map(tarifKey => (
                          <option key={`select_${tarifKey}`} value={tarifKey}>
                            {tarifs[tarifKey].name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default MemberEdit;
