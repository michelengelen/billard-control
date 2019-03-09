import React, { Component, Fragment } from 'react';
import {
  Button,
  Col,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Form,
  Input,
  Row,
} from 'reactstrap';

import isUndefined from 'lodash.isundefined';

import { Icon } from 'components/common';
import CurrencyInput from 'react-currency-input';
import { Icons } from '../../variables/constants';
import { getPriceString } from '../../helpers/helpers';
// import { SettlementDocDownload } from 'components/common/settlementDocDownload';

class SettlementEntry extends Component {
  constructor(props) {
    super(props);

    this.getSettlementPositions = this.getSettlementPositions.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.renderSummary = this.renderSummary.bind(this);
    this.renderControls = this.renderControls.bind(this);

    this.state = {
      loading: true,
      tarif: null,
      error: '',
      editValues: {},
      isModalOpen: false,
    };
  }

  componentDidMount() {
    const { member } = this.props;
    console.log('#### member: ', member);
    member.tarifRef.get().then(doc => this.setState({ tarif: doc.data(), loading: false }));
  }

  getSettlementPositions() {
    const { categories, summary } = this.props;
    const {
      purchases,
      tableRent: { hours, fracture },
    } = summary;
    const { tarif } = this.state;

    const sums = {
      beverages: 0,
      snacks: 0,
      misc: 0,
      tableRents: (parseInt(hours) + parseFloat(fracture)) * tarif.tableFee,
      monthlyFee: tarif.monthlyFee,
    };

    const categoryTypes = {};
    categories.forEach(cat => (categoryTypes[cat.id] = cat.categoryType));

    purchases.forEach(purch => {
      const { categoryId } = purch;
      sums[categoryTypes[categoryId]] += purch.price * purch.amount;
    });

    return sums;
  }

  renderSummary() {
    const { member } = this.props;
    const sums = this.getSettlementPositions();
    return (
      <tr key={`settlementTable_${member.id}`}>
        <td>{`${member.lastname}, ${member.firstname}`}</td>
        <td className="text-center">
          {!isUndefined(sums.beverages) && getPriceString(sums.beverages)}
        </td>
        <td className="text-center">
          {!isUndefined(sums.snacks) && getPriceString(sums.snacks)}
        </td>
        <td className="text-center">
          {!isUndefined(sums.tableRents) && getPriceString(sums.tableRents)}
        </td>
        <td className="text-center">
          {!isUndefined(sums.monthlyFee) && getPriceString(sums.monthlyFee)}
        </td>
        <td className="text-center">
          {!isUndefined(sums.misc) && getPriceString(sums.misc)}
        </td>
        <td className="text-right">
          {this.renderControls()}
        </td>
      </tr>
    );
  }

  renderControls() {
    const { locked } = this.state;
    return (
      <div className="btn-group" role="group" aria-label="Basic example">
        <Button
          color="secondary"
          size="sm"
          onClick={() => this.setState(prevState => ({ locked: !prevState.locked }))}
        >
          <Icon color="#EEEEEE" size={16} icon={Icons.COIN} />
        </Button>
        <Button color="primary" size="sm" disabled={locked} onClick={this.toggleModal}>
          <Icon color="#EEEEEE" size={16} icon={Icons.PENCIL} />
        </Button>
      </div>
    );
  }

  handleOnChange(e, fieldKey, maskedValue, floatValue) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    let newValue = 0;
    if (floatValue || floatValue === 0) {
      newValue = floatValue;
    } else if (typeof maskedValue === 'boolean') {
      newValue = maskedValue;
    } else {
      newValue = e.currentTarget.value;
    }

    this.setState(prevState => ({
      editValues: {
        ...prevState.editValues,
        [fieldKey]: newValue,
      },
    }));
  }

  toggleModal() {
    console.log('### toggled Modal call');
    this.setState(prevState => ({
      isModalOpen: !prevState.isModalOpen,
    }));
  }

  render() {
    const { loading, editValues, isModalOpen } = this.state;
    console.log('### indicator: ', isModalOpen);
    const {
      summary: { tableRent },
      member,
      addTableRent,
    } = this.props;

    return (
      <Fragment>
        {!loading && this.renderSummary()}
        <Modal isOpen={isModalOpen} toggle={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>
            {`${member.lastname}, ${member.firstname}`}
          </ModalHeader>
          <ModalBody>
            <Alert
              color="danger"
              isOpen={!!this.state.error}
              toggle={() => this.setState({ error: '' })}
            >
              {this.state.error}
            </Alert>
            <Form>
              <Row form>
                <Col xs={6}>
                  <FormGroup>
                    <Label for="name">Stunden</Label>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={tableRent && tableRent.hours ? tableRent.hours : ''}
                      onChange={e => addTableRent(e, member.id, 'hours')}
                      placeholder=""
                    />
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <FormGroup>
                    <Label for="fracture">Minuten</Label>
                    <Input
                      type="select"
                      value={tableRent ? tableRent.fracture : ''}
                      name="select"
                      id="fracture"
                      onChange={e => addTableRent(e, member.id, 'fracture')}
                    >
                      <option value={0}>0 Minuten</option>
                      <option value={0.25}>15 Minuten</option>
                      <option value={0.5}>30 Minuten</option>
                      <option value={0.75}>45 Minuten</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col xs={8}>
                  <FormGroup>
                    <Label for="customEntry">Bezeichnung</Label>
                    <Input
                      type="text"
                      name="customEntry"
                      id="customEntry"
                      value={editValues.customEntry || ''}
                      onChange={e => this.handleOnChange(e, 'customEntry')}
                      placeholder=""
                    />
                  </FormGroup>
                </Col>
                <Col xs={4}>
                  <FormGroup>
                    <Label for="priceExt">Gäste-Preis</Label>
                    <CurrencyInput
                      className="form-control"
                      decimalSeparator=","
                      precision="2"
                      suffix=" €"
                      type="text"
                      name="priceExt"
                      id="priceExt"
                      value={editValues.customPrice || ''}
                      onChange={(maskedValue, floatValue, e) => {
                        this.handleOnChange(e, 'customPrice', maskedValue, floatValue);
                      }}
                      placeholder="0,00 €"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.saveData}>
              Speichern
            </Button>{' '}
            <Button color="secondary" onClick={this.toggleModal}>
              Abbrechen
            </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default SettlementEntry;
