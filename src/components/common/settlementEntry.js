import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
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
import { _ } from '../../helpers/utils';
import { SettlementDocDownload } from 'components/common/settlementDocDownload';
import { MiniLoader } from 'components/common';

const emptyProduct = {
  name: '',
  price: 0,
  amount: 1,
  category: 'custom',
  public: false,
};

class SettlementEntry extends Component {
  static propTypes = {
    member: PropTypes.object.isRequired,
    date: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    summary: PropTypes.object.isRequired,
    editable: PropTypes.bool.isRequired,
    updateCustoms: PropTypes.func.isRequired,
    addTableRent: PropTypes.func.isRequired,
    finishSettlementEntry: PropTypes.func.isRequired,
    saveSettlement: PropTypes.func.isRequired,
  };

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
      isModalOpen: false,
      renderPDF: false,
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
    const { member, editable, finishSettlementEntry, date, summary } = this.props;
    const { renderPDF } = this.state;
    const sums = this.getSettlementPositions();
    return (
      <div className="btn-group" role="group" aria-label="Basic example">
        <Button
          color="secondary"
          size="sm"
          onClick={() => finishSettlementEntry(sums)}
          disabled={!editable}
        >
          <Icon
            color="#EEEEEE"
            size={16}
            icon={editable ? Icons.UNLOCKED : Icons.LOCKED}
          />
        </Button>
        <Button
          color="primary"
          size="sm"
          disabled={!editable}
          onClick={this.toggleModal}
        >
          <Icon color="#EEEEEE" size={16} icon={Icons.PENCIL} />
        </Button>
        {!renderPDF
          ? (
            <Button
              color="success"
              size="sm"
              disabled={editable}
              onClick={() => this.setState({ renderPDF: true })}
            >
              <Icon color="#EEEEEE" size={16} icon={Icons.FILE_TEXT} />
            </Button>
          )
          : (
            <SettlementDocDownload
              singleSettlement
              title={`${member.lastname}_${member.id}_${date.year}-${date.month}`}
              buttonText={<Icon color="#EEEEEE" size={16} icon={Icons.DOWNLOAD} />}
              summary={summary}
              color="success"
            />
          )
        }
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
      const {
        member: { id },
        summary: { customs },
        updateCustoms,
      } = this.props;
      const newCustoms = _.cloneDeep(customs);
      _.set(
        newCustoms,
        `[${index}][${key}]`,
        newValue,
      );
      updateCustoms(id, newCustoms);
    } else {
      this.setState(prevState => ({
        editValues: {
          ...prevState.editValues,
          [key]: newValue,
        },
      }));
    }
  }

  addCustomProduct() {
    const {
      member: { id },
      summary: { customs = [] },
      updateCustoms,
    } = this.props;
    const newCustoms = _.cloneDeep(customs);
    newCustoms.push(emptyProduct);
    updateCustoms(id, newCustoms);
  }

  removeCustomProduct(index) {
    if (index >= 0) {
      const {
        member: { id },
        summary: { customs = [] },
        updateCustoms,
      } = this.props;
      const newCustoms = _.cloneDeep(customs);
      updateCustoms(
        id,
        [ ...newCustoms.slice(0, index), ...newCustoms.slice(index + 1) ],
      );
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

    const {
      summary: { customs = [] },
      saveSettlement,
    } = this.props;

    let hasError = false;
    const errorIndexes = [];

    if (Array.isArray(customs) && customs.length > 0) {
      customs.forEach((custom, index) => {
        if (hasError) return;
        if (
          (isString(custom.name) && custom.name === '') ||
          (!isNaN(custom.price) && custom.price === 0)
        ) {
          errorIndexes.push(index);
          hasError = true;
        }
      });
    }

    if (hasError) {
      this.setState({ error: 'Bitte die Fehler in der Eingabe beheben!', errorIndexes });
    } else {
      saveSettlement().then(this.toggleModal);
    }
  }

  render() {
    const { loading, isModalOpen, error, errorIndexes } = this.state;
    const {
      summary: { tableRent, customs, purchases },
      member,
      addTableRent,
      date,
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
                {Array.isArray(customs) && customs.length > 0
                  ? customs.map((custom, index) => (
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
                              value={customs[index].name || ''}
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
                              value={customs[index].price || ''}
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
                    ))
                    : null
                  }
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
