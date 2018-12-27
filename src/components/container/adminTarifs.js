import React, { Component } from 'react';
import {
  Alert,
  Button,
  Card,
  CardTitle,
  CardFooter,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
  Table,
} from 'reactstrap';
import CurrencyInput from 'react-currency-input';
import { tarifsRef } from 'firebase-config/config';
import { sortByProperty, getPriceString } from 'helpers/helpers';
import { Icon } from '../common';
import { Icons } from '../../variables/constants';

class Tarifs extends Component {
  constructor(props) {
    super(props);

    this.editTarif = this.editTarif.bind(this);
    this.deleteDoc = this.deleteDoc.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.validateAndSave = this.validateAndSave.bind(this);
    this.openCategory = this.openCategory.bind(this);

    this.state = {
      tarifs: [],
      editId: '',
      editValues: {},
      openModal: false,
    };
  }

  componentDidMount() {
    let response = {};
    tarifsRef.onSnapshot(querySnapshot => {
      response.tarifs = [];
      querySnapshot.forEach(doc => {
        response.tarifs.push({id: doc.id, ...doc.data()});
      });
      this.setState({
        tarifs: sortByProperty(response.tarifs, 'name'),
      })
    });
  }

  editTarif(id) {
    const tarif =
      JSON.parse(
        JSON.stringify(
          this.state.tarifs.filter(tarif => tarif.id === id)[0]
        )
      );

    delete tarif.id;

    this.setState({
      editValues: {
        ...tarif,
      },
      editId: id,
      openModal: true,
    });
  }

  deleteDoc(id) {
    tarifsRef.doc(id).delete().then(() => {
      console.log('Document successfully deleted!');
      this.closeModal();
    }).catch(function(error) {
      console.error('Error removing document: ', error);
    });
  }

  closeModal() {
    this.setState({
      editId: '',
      editValues: {},
      openModal: false,
    });
  }

  renderTable(tarifs) {
    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>Tarif</th>
            <th className="text-center">Monatsbeitrag</th>
            <th className="text-center">Tischmiete (pro Std.)</th>
            <th className="text-center">Aufnahmegebühr</th>
            <th className="text-center">{' '}</th>
          </tr>
        </thead>
        <tbody>
          {tarifs.map((tarif, index) => (
            <tr key={`productTable_${index}_${tarif.id}`}>
              <td>{tarif.name || '---'}</td>
              <td className="text-center">
                {tarif.monthlyFee >= 0
                  ? getPriceString(tarif.monthlyFee)
                  : '---'
                }
              </td>
              <td className="text-center">
                {tarif.tableRent >= 0
                  ? getPriceString(tarif.tableRent)
                  : '---'}
              </td>
              <td className="text-center">
                {tarif.entryFee >= 0
                  ? getPriceString(tarif.entryFee)
                  : '---'}
              </td>
              <td className="text-right">
                <Button color="primary" size="sm">
                  <Icon
                    color="#EEEEEE"
                    size={16}
                    icon={Icons.PENCIL}
                    onClick={() => this.editTarif(tarif.id)}
                  />
                </Button>
                {' '}
                <Button color="danger" size="sm">
                  <Icon
                    color="#EEEEEE"
                    size={16}
                    icon={Icons.DELETE}
                    onClick={() => this.deleteDoc(tarif.id)}
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
      tarifsRef.doc(this.state.editId).set(this.state.editValues)
        .then(this.closeModal);
    } else {
      tarifsRef.add({ ...this.state.editValues }).then(this.closeModal);
    }
  }

  openCategory(id) {
    this.setState(prevState => ({
      openCategory: prevState.openCategory === id ? '' : id
    }));
  }

  render() {
    const { tarifs } = this.state;
    return (
      <Row className="bc-content mr-0 pt-3">
        <Col xs={12}>
          <Card body>
            <CardTitle>Produkte</CardTitle>
            {tarifs.length > 0 &&
              this.renderTable(tarifs)
            }
            <CardFooter className="align-items-end">
              <Button
                color="primary"
                onClick={
                  () => this.setState({
                    openModal: true,
                  })
                }
              >
                Neuen Tarif anlegen
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Modal
          isOpen={this.state.openModal}
          toggle={this.closeModal}
        >
          <ModalHeader toggle={this.closeModal}>
            Tarif anlegen/editieren
          </ModalHeader>
          <ModalBody>
            <Alert
              color="danger"
              isOpen={!!this.state.error}
              toggle={() => this.setState({error: ''})}
            >
              {this.state.error}
            </Alert>
            <Form>
              <Row form>
                <Col xs={12}>
                  <FormGroup>
                    <Label for="id">ID</Label>
                    <Input
                      disabled
                      type="text"
                      name="id"
                      id="id"
                      value={this.state.editId || ''}
                      onChange={e => e.preventDefault()}
                      placeholder=""
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="name">Bezeichnung</Label>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={this.state.editValues.name || ''}
                      onChange={e => this.handleOnChange(e, 'name')}
                      placeholder=""
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col xs={4}>
                  <FormGroup>
                    <Label for="monthlyFee">Monatsbeitrag</Label>
                    <CurrencyInput
                      className="form-control"
                      decimalSeparator=","
                      precision="2"
                      suffix=" €"
                      type="text"
                      name="monthlyFee"
                      id="monthlyFee"
                      value={this.state.editValues.monthlyFee || ''}
                      onChange={(maskedValue, floatValue, e) => {
                        this.handleOnChange(
                          e,
                          'monthlyFee',
                          maskedValue,
                          floatValue,
                        )
                      }}
                      placeholder="0,00 €"
                    />
                  </FormGroup>
                </Col>
                <Col xs={4}>
                  <FormGroup>
                    <Label for="tableRent">Tischmiete (pro Std.)</Label>
                    <CurrencyInput
                      className="form-control"
                      decimalSeparator=","
                      precision="2"
                      suffix=" €"
                      type="text"
                      name="tableRent"
                      id="tableRent"
                      value={this.state.editValues.tableRent || ''}
                      onChange={(maskedValue, floatValue, e) => {
                        this.handleOnChange(
                          e,
                          'tableRent',
                          maskedValue,
                          floatValue,
                        )
                      }}
                      placeholder="0,00 €"
                    />
                  </FormGroup>
                </Col>
                <Col xs={4}>
                  <FormGroup>
                    <Label for="entryFee">Aufnahmegebühr</Label>
                    <CurrencyInput
                      className="form-control"
                      decimalSeparator=","
                      precision="2"
                      suffix=" €"
                      type="text"
                      name="entryFee"
                      id="entryFee"
                      value={this.state.editValues.entryFee || ''}
                      onChange={(maskedValue, floatValue, e) => {
                        this.handleOnChange(
                          e,
                          'entryFee',
                          maskedValue,
                          floatValue,
                        )
                      }}
                      placeholder="0,00 €"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={this.validateAndSave}
            >
              Speichern
            </Button>
            {' '}
            <Button
              color="secondary"
              onClick={this.closeModal}
            >
              Abbrechen
            </Button>
          </ModalFooter>
        </Modal>
      </Row>
    );
  }
}

export default Tarifs;