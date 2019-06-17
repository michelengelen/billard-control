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
  InputGroup,
  Row,
} from 'reactstrap';

import isUndefined from 'lodash.isundefined';
import isString from 'lodash.isstring';

import { Icon } from 'components/common';
import CurrencyInput from 'react-currency-input';
import { Icons } from '../../variables/constants';
import { getPriceString } from '../../helpers/helpers';
// import { SettlementDocDownload } from 'components/common/settlementDocDownload';

const emptyProduct = {
  name: '',
  price: 0,
  amount: 1,
  category: 'custom',
  public: false,
};

class SettlementEntry extends Component {
  constructor(props) {
    super(props);

    this.getSettlementPositions = this.getSettlementPositions.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.saveData = this.saveData.bind(this);

    this.renderSummary = this.renderSummary.bind(this);
    this.renderControls = this.renderControls.bind(this);

    this.addCustomProduct = this.addCustomProduct.bind(this);
    this.removeCustomProduct = this.removeCustomProduct.bind(this);

    this.state = {
      loading: true,
      tarif: null,
      error: '',
      errorIndexes: [],
      editValues: {
        customProducts: [],
      },
      isModalOpen: false,
    };
  }

  componentDidMount() {
    const { member } = this.props;
    member.tarifRef.get().then(doc => this.setState({ tarif: doc.data(), loading: false }));
  }

  getSettlementPositions() {
    const { categories, summary } = this.props;
    const {
      purchases,
      tableRent: { hours, fracture },
      customs,
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

    if (Array.isArray(customs) && customs.length > 0) {
      customs.forEach(custom => sums.misc += custom.price);
    }

    return sums;
  }

  renderSummary() {
    const { member } = this.props;
    console.log('#### member: ', member);
    const sums = this.getSettlementPositions();
    return (
      <tr key={`settlementTable_${member.id}`}>
        <td>{`${member.lastname}, ${member.firstname}`}</td>
        <td className="text-center">
          {!isUndefined(sums.beverages) && getPriceString(sums.beverages)}
        </td>
        <td className="text-center">{!isUndefined(sums.snacks) && getPriceString(sums.snacks)}</td>
        <td className="text-center">
          {!isUndefined(sums.tableRents) && getPriceString(sums.tableRents)}
        </td>
        <td className="text-center">
          {!isUndefined(sums.monthlyFee) && getPriceString(sums.monthlyFee)}
        </td>
        <td className="text-center">{!isUndefined(sums.misc) && getPriceString(sums.misc)}</td>
        <td className="text-right">{this.renderControls()}</td>
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

    let key = fieldKey;
    let index = -1;
    if (typeof fieldKey === 'object') {
      key = fieldKey.key;
      index = fieldKey.index;
    }

    let newValue = 0;
    if (floatValue || floatValue === 0) {
      newValue = floatValue;
    } else if (typeof maskedValue === 'boolean') {
      newValue = maskedValue;
    } else {
      newValue = e.currentTarget.value;
    }

    if (index >= 0) {
      this.setState(prevState => ({
        editValues: {
          ...prevState.editValues,
          customProducts: [
            ...prevState.editValues.customProducts.slice(0, index),
            {
              ...prevState.editValues.customProducts[index],
              [key]: newValue,
            },
            ...prevState.editValues.customProducts.slice(index + 1),
          ],
        },
      }));
    }

    this.setState(prevState => ({
      editValues: {
        ...prevState.editValues,
        [key]: newValue,
      },
    }));
  }

  addCustomProduct() {
    this.setState(prevState => ({
      editValues: {
        ...prevState.editValues,
        customProducts: [...prevState.editValues.customProducts, { ...emptyProduct }],
      },
    }));
  }

  removeCustomProduct(index) {
    if (index >= 0) {
      this.setState(prevState => ({
        editValues: {
          ...prevState.editValues,
          customProducts: [
            ...prevState.editValues.customProducts.slice(0, index),
            ...prevState.editValues.customProducts.slice(index + 1),
          ],
        },
      }));
    }
  }

  toggleModal() {
    this.setState(prevState => ({
      isModalOpen: !prevState.isModalOpen,
    }));
  }

  saveData(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const { editValues } = this.state;

    let hasError = false;
    const errorIndexes = [];

    if (editValues.customProducts.length === 0) {
      this.toggleModal();
    } else {
      editValues.customProducts.forEach((product, index) => {
        if (hasError) return;
        if (
          (isString(product.name) && product.name === '') ||
          (!isNaN(product.price) && product.price === 0)
        ) {
          errorIndexes.push(index);
          hasError = true;
        }
      });
    }

    if (hasError) {
      this.setState({ error: 'Bitte die Fehler in der Eingabe beheben!', errorIndexes });
    } else {
      this.toggleModal();
    }
  }

  render() {
    const { loading, editValues, isModalOpen, error, errorIndexes } = this.state;
    const { customProducts } = editValues;
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
              isOpen={!!error}
              toggle={() => this.setState({ error: '' })}
            >
              {error}
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
              </Row>
              <Row form>
                {customProducts.length > 0 &&
                  customProducts.map((custom, index) => (
                    <Fragment key={`customProduct_${index}`}>
                      <Col xs={10}>
                        <Label for={`customProduct_${index}_name`}>Bezeichnung</Label>
                        <InputGroup className="input-group-md">
                          <div className="input-group-prepend">
                            <Button
                              color="danger"
                              size="md"
                              onClick={() => this.removeCustomProduct(index)}
                            >
                              <Icon color="#EEEEEE" size={18} icon={Icons.DELETE} />
                            </Button>
                          </div>
                          <Input
                            invalid={errorIndexes.findIndex(i => i === index) > -1}
                            type="text"
                            name={`customProduct_${index}_name`}
                            id={`customProduct_${index}_name`}
                            value={customProducts[index].name || ''}
                            onChange={e => this.handleOnChange(e, { key: 'name', index })}
                            placeholder=""
                          />
                        </InputGroup>
                      </Col>
                      <Col xs={2}>
                        <FormGroup>
                          <Label for={`customProduct_${index}_price`}>Preis</Label>
                          <CurrencyInput
                            invalid={errorIndexes.findIndex(i => i === index) > -1}
                            allowNegative
                            className="form-control"
                            decimalSeparator=","
                            precision="2"
                            suffix=" €"
                            type="text"
                            name={`customProduct_${index}_price`}
                            id={`customProduct_${index}_price`}
                            value={customProducts[index].price || ''}
                            onChange={(maskedValue, floatValue, e) => {
                              this.handleOnChange(
                                e,
                                { key: 'price', index },
                                maskedValue,
                                floatValue,
                              );
                            }}
                            placeholder=""
                          />
                        </FormGroup>
                      </Col>
                    </Fragment>
                  ))}
                <Col xs={12}>
                  <Button
                    color="link"
                    className="btn-block"
                    size="sm"
                    onClick={this.addCustomProduct}
                  >
                    <strong>+ freier Artikel</strong>
                  </Button>
                </Col>
                <Col xs={12}>
                  <Button
                    color="success"
                    className="btn-block"
                    size="sm"
                    onClick={this.props.updatePurchases(member.id, this.state.summary)}
                  >
                    <strong>Speichern</strong>
                  </Button>
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
