import React, { Component } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
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
import CurrencyInput from 'react-currency-input';
import { categoriesRef, productsRef } from 'firebase-config/config';
import { getPriceString, sortByProperty } from 'helpers/helpers';
import { ActivityIndicator, Icon } from '../common';
import { Icons } from '../../variables/constants';

const requiredFields = {
  products: ['name', 'ean', 'priceInt', 'priceExt', 'categoryId'],
  categories: ['name'],
};

class Products extends Component {
  constructor(props) {
    super(props);

    this.editDoc = this.editDoc.bind(this);
    this.deleteDoc = this.deleteDoc.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.saveData = this.saveData.bind(this);
    this.openCategory = this.openCategory.bind(this);
    this.checkFormValidity = this.checkFormValidity.bind(this);

    this.state = {
      categories: [],
      products: [],
      editId: '',
      openCategory: '',
      editValues: {},
      openModal: false,
      modalType: 'products',
      requiredFields: requiredFields['products'],
      validated: false,
      error: '',
      loading: true,
    };
  }

  componentDidMount() {
    let response = {};
    productsRef.onSnapshot(querySnapshot => {
      response.products = [];
      querySnapshot.forEach(doc => {
        response.products.push({ id: doc.id, ...doc.data() });
      });
      categoriesRef.onSnapshot(querySnapshot => {
        response.categories = [];
        querySnapshot.forEach(doc => {
          response.categories.push({ id: doc.id, ...doc.data() });
        });
        this.setState({
          loading: false,
          categories: sortByProperty(response.categories, 'name'),
          products: sortByProperty(response.products, 'name'),
        });
      });
    });
  }

  editDoc(id, docType) {
    const doc = JSON.parse(JSON.stringify(this.state[docType].filter(item => item.id === id)[0]));

    if (doc.hasOwnProperty('id')) delete doc.id;
    if (docType === 'products' && !doc.public) doc.public = true;

    this.setState({
      editValues: {
        ...doc,
      },
      editId: id,
      openModal: true,
      modalType: docType,
    });
  }

  deleteDoc(id, docType) {
    let deleteRef;
    if (docType === 'products') {
      deleteRef = productsRef;
    } else {
      deleteRef = categoriesRef;
    }

    deleteRef
      .doc(id)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
        this.closeModal();
      })
      .catch(function(error) {
        console.error('Error removing document: ', error);
      });
  }

  closeModal() {
    this.setState({
      editId: '',
      editValues: {},
      openModal: false,
      modalType: 'products',
      requiredFields: requiredFields['products'],
      validated: false,
      error: '',
    });
  }

  renderTable(products) {
    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>Artikel</th>
            <th>EAN-Code</th>
            <th className="text-center">€ (int.)</th>
            <th className="text-center">€ (ext.)</th>
            <th className="text-center">Bestand</th>
            <th className="text-center"> </th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={`productTable_${product.id}`}>
              <td>{product.name || '---'}</td>
              <td>{product.ean || '---'}</td>
              <td className="text-center">
                {product.priceInt >= 0 ? getPriceString(product.priceInt) : '---'}
              </td>
              <td className="text-center">
                {product.priceExt >= 0 ? getPriceString(product.priceExt) : '---'}
              </td>
              <td className="text-center">{product.amount || 0}</td>
              <td className="text-right">
                <div className="btn-group" role="group" aria-label="Basic example">
                  <Button color="primary" size="sm">
                    <Icon
                      color="#EEEEEE"
                      size={16}
                      icon={Icons.PENCIL}
                      onClick={() => this.editDoc(product.id, 'products')}
                    />
                  </Button>{' '}
                  <Button color="danger" size="sm">
                    <Icon
                      color="#EEEEEE"
                      size={16}
                      icon={Icons.DELETE}
                      onClick={() => this.deleteDoc(product.id, 'products')}
                    />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  handleOnChange(e, fieldKey, maskedValue, floatValue) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const { editValues, modalType } = this.state;
    const oldRequiredFields = requiredFields[modalType];
    const newRequiredFields = [];

    let newValue = 0;
    if (floatValue || floatValue === 0) {
      newValue = floatValue;
    } else if (typeof maskedValue === 'boolean') {
      newValue = maskedValue;
    } else {
      newValue = e.currentTarget.value;
    }

    for (let i = 0; i < oldRequiredFields.length; i++) {
      if (
        (oldRequiredFields[i] !== fieldKey && !editValues[oldRequiredFields[i]]) ||
        (oldRequiredFields[i] === fieldKey && !newValue)
      ) {
        newRequiredFields.push(oldRequiredFields[i]);
      }
    }

    this.setState(prevState => ({
      editValues: {
        ...prevState.editValues,
        [fieldKey]: newValue,
      },
      requiredFields: newRequiredFields,
    }));
  }

  checkFormValidity() {
    const { requiredFields } = this.state;
    return new Promise((resolve, reject) => {
      if (requiredFields.length > 0) {
        reject();
      } else {
        resolve();
      }
    });
  }

  saveData() {
    const { editId, editValues, modalType } = this.state;
    this.checkFormValidity()
      .then(() => {
        let saveRef;
        if (modalType === 'products') {
          saveRef = productsRef;
        } else if (modalType === 'categories') {
          saveRef = categoriesRef;
        }
        if (editId) {
          saveRef
            .doc(editId)
            .set(editValues)
            .then(this.closeModal);
        } else {
          saveRef.add(editValues).then(this.closeModal);
        }
      })
      .catch(() => {
        this.setState({
          validated: true,
          error: 'Bitte die Fehler in der Eingabe beheben.',
        });
      });
  }

  openCategory(id) {
    this.setState(prevState => ({
      openCategory: prevState.openCategory === id ? '' : id,
    }));
  }

  render() {
    const { categories, products, openCategory, validated, requiredFields } = this.state;

    return (
      <Row className="bc-content mr-0 pt-3">
        <ActivityIndicator loading={this.state.loading} />
        <Col xs={12}>
          <Card>
            <CardHeader>
              <h5 className="m-0">Produkte</h5>
            </CardHeader>
            <ListGroup flush>
              {categories.map(category => {
                const productsInCategory = products.filter(
                  product => product.categoryId === category.id,
                );
                return (
                  <ListGroupItem
                    key={category.id}
                    active={category.id === openCategory}
                    className="p-0"
                  >
                    <Row className="p-3">
                      <Col xs={9} className="align-top">
                        {category.name} <Badge color="success">{productsInCategory.length}</Badge>
                      </Col>
                      <Col xs={3} className="text-right">
                        <div className="btn-group" role="group" aria-label="Basic example">
                          <Button
                            color="secondary"
                            size="sm"
                            disabled={productsInCategory.length < 1}
                            onClick={() => this.openCategory(category.id)}
                          >
                            <Icon
                              color="#EEEEEE"
                              size={16}
                              icon={
                                this.state.openCategory === category.id
                                  ? Icons.CHEVRON.UP
                                  : Icons.CHEVRON.DOWN
                              }
                            />
                          </Button>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => this.editDoc(category.id, 'categories')}
                          >
                            <Icon color="#EEEEEE" size={16} icon={Icons.PENCIL} />
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            disabled={productsInCategory.length > 0}
                            onClick={() => this.deleteDoc(category.id, 'categories')}
                          >
                            <Icon color="#EEEEEE" size={16} icon={Icons.DELETE} />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    {productsInCategory.length > 0 && (
                      <Collapse
                        isOpen={openCategory === category.id}
                        className="bg-light text-dark"
                      >
                        <Row className="p-0">
                          <Col xs={12}>{this.renderTable(productsInCategory)}</Col>
                        </Row>
                      </Collapse>
                    )}
                  </ListGroupItem>
                );
              })}
            </ListGroup>
            <CardFooter className="align-items-end">
              <Button
                color="primary"
                onClick={() =>
                  this.setState({
                    openModal: true,
                    modalType: 'categories',
                  })
                }
              >
                Neue Kategorie
              </Button>{' '}
              <Button
                color="success"
                onClick={() =>
                  this.setState({
                    openModal: true,
                    modalType: 'products',
                  })
                }
              >
                Neues Produkt
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Modal isOpen={this.state.openModal} toggle={this.closeModal}>
          <ModalHeader toggle={this.closeModal}>Produkt anlegen/editieren</ModalHeader>
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
                  {this.state.modalType === 'products' && (
                    <FormGroup>
                      <Label for="ean">EAN</Label>
                      <Input
                        type="text"
                        name="ean"
                        id="ean"
                        invalid={validated && requiredFields.indexOf('ean') > -1}
                        value={this.state.editValues.ean || ''}
                        onChange={e => this.handleOnChange(e, 'ean')}
                        placeholder=""
                      />
                    </FormGroup>
                  )}
                  <FormGroup>
                    <Label for="name">Bezeichnung</Label>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      invalid={validated && requiredFields.indexOf('name') > -1}
                      value={this.state.editValues.name || ''}
                      onChange={e => this.handleOnChange(e, 'name')}
                      placeholder=""
                    />
                  </FormGroup>
                  {this.state.modalType === 'categories' && (
                    <FormGroup>
                      <Label for="categoryType">Kategorie-Typ</Label>
                      <Input
                        type="select"
                        value={this.state.editValues.categoryType || ''}
                        name="select"
                        id="categoryType"
                        invalid={validated && requiredFields.indexOf('categoryType') > -1}
                        onChange={e => this.handleOnChange(e, 'categoryType')}
                      >
                        <option value={null}>-- Bitte einen Kategorie-Typ wählen</option>
                        <option value={'beverages'}>Getränke</option>
                        <option value={'snacks'}>Snacks</option>
                        <option value={'misc'}>diverses</option>
                      </Input>
                    </FormGroup>
                  )}
                </Col>
              </Row>
              {this.state.modalType === 'products' && (
                <Row form>
                  <Col xs={6}>
                    <FormGroup>
                      <Label for="priceInt">Mitglieder-Preis</Label>
                      <CurrencyInput
                        className={`form-control ${
                          validated && requiredFields.indexOf('priceInt') > -1 ? 'is-invalid' : ''
                        }`}
                        decimalSeparator=","
                        precision="2"
                        suffix=" €"
                        type="text"
                        name="priceInt"
                        id="priceInt"
                        value={this.state.editValues.priceInt || ''}
                        onChange={(maskedValue, floatValue, e) => {
                          this.handleOnChange(e, 'priceInt', maskedValue, floatValue);
                        }}
                        placeholder="0,00 €"
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={6}>
                    <FormGroup>
                      <Label for="priceExt">Gäste-Preis</Label>
                      <CurrencyInput
                        className={`form-control ${
                          validated && requiredFields.indexOf('priceExt') > -1 ? 'is-invalid' : ''
                        }`}
                        decimalSeparator=","
                        precision="2"
                        suffix=" €"
                        type="text"
                        name="priceExt"
                        id="priceExt"
                        value={this.state.editValues.priceExt || ''}
                        onChange={(maskedValue, floatValue, e) => {
                          this.handleOnChange(e, 'priceExt', maskedValue, floatValue);
                        }}
                        placeholder="0,00 €"
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12}>
                    <FormGroup>
                      <Label for="category">Kategorie</Label>
                      <Input
                        type="select"
                        value={this.state.editValues.categoryId || ''}
                        name="select"
                        id="category"
                        invalid={validated && requiredFields.indexOf('categoryId') > -1}
                        onChange={e => this.handleOnChange(e, 'categoryId')}
                      >
                        <option value={null}>Bitte eine Kategorie wählen</option>
                        {categories.map(category => (
                          <option key={`select_${category.id}`} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col xs={12}>
                    <FormGroup>
                      <Label check for="public">
                        <Input
                          type="checkbox"
                          checked={this.state.editValues.public || false}
                          name="public"
                          id="public"
                          onChange={() =>
                            this.handleOnChange(null, 'public', !this.state.editValues.public)
                          }
                        />{' '}
                        öffentlich buchbar
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>
              )}
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.saveData}>
              Speichern
            </Button>{' '}
            <Button color="secondary" onClick={this.closeModal}>
              Abbrechen
            </Button>
          </ModalFooter>
        </Modal>
      </Row>
    );
  }
}

export default Products;
