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
import CurrencyInput from 'react-currency-input';
import { categoriesRef, productsRef } from 'firebase-config/config';
import { sortByProperty } from 'helpers/helpers';
import { Icon } from '../common';
import { Icons } from '../../variables/constants';

class Products extends Component {
  constructor(props) {
    super(props);

    this.editProduct = this.editProduct.bind(this);
    this.deleteDoc = this.deleteDoc.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.validateAndSave = this.validateAndSave.bind(this);
    this.openCategory = this.openCategory.bind(this);

    this.state = {
      categories: [],
      products: [],
      editId: '',
      openCategory: '',
      editValues: {},
      openModal: false,
      modalType: 'product',
    };
  }

  componentDidMount() {
    let response = {};
    productsRef.onSnapshot(querySnapshot => {
      response.products = [];
      querySnapshot.forEach(doc => {
        response.products.push({id: doc.id, ...doc.data()});
      });
      categoriesRef.onSnapshot(querySnapshot => {
        response.categories = [];
        querySnapshot.forEach(doc => {
          response.categories.push({id: doc.id, ...doc.data()});
        });
        this.setState({
          categories: sortByProperty(response.categories, 'name'),
          products: sortByProperty(response.products, 'name'),
        })
      });
    });
  }

  editProduct(id) {
    const product =
      JSON.parse(
        JSON.stringify(
          this.state.products.filter(product => product.id === id)[0]
        )
      );

    delete product.id;

    this.setState({
      editValues: {
        ...product,
      },
      editId: id,
      openModal: true,
      modalType: 'product',
    });
  }

  deleteDoc(id, docType) {
    let deleteRef;
    if (docType === 'product') {
      deleteRef = productsRef;
    } else {
      deleteRef = categoriesRef;
    }

    deleteRef.doc(id).delete().then(() => {
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
      modalType: 'product',
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
            <th className="text-center">{' '}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={`productTable_${index}_${product.id}`}>
              <td>{product.name || '---'}</td>
              <td>{product.ean || '---'}</td>
              <td className="text-center">{product.priceInt || '---'}</td>
              <td className="text-center">{product.priceExt || '---'}</td>
              <td className="text-center">{product.amount || 0}</td>
              <td className="text-right">
                <Button color="primary" size="sm">
                  <Icon
                    color="#EEEEEE"
                    size={16}
                    icon={Icons.PENCIL}
                    onClick={() => this.editProduct(product.id)}
                  />
                </Button>
                {' '}
                <Button color="danger" size="sm">
                  <Icon
                    color="#EEEEEE"
                    size={16}
                    icon={Icons.DELETE}
                    onClick={() => this.deleteDoc(product.id, 'product')}
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
    if (this.state.modalType === 'product') {
      if (this.state.editId) {
        productsRef.doc(this.state.editId).set(this.state.editValues)
          .then(this.closeModal);
      } else {
        productsRef.add({ ...this.state.editValues }).then(this.closeModal);
      }
    } else if (this.state.modalType === 'category') {
      if (this.state.editId) {
        categoriesRef.doc(this.state.editId).set(this.state.editValues)
          .then(this.closeModal);
      } else {
        categoriesRef.add({ ...this.state.editValues }).then(this.closeModal);
      }
    }
  }

  openCategory(id) {
    this.setState(prevState => ({
      openCategory: prevState.openCategory === id ? '' : id
    }));
  }

  render() {
    const { categories, products, openCategory } = this.state;
    return (
      <Row className="bc-content mr-0 pt-3">
        <Col xs={12}>
          <Card body>
            <CardTitle>Produkte</CardTitle>
            <ListGroup flush className="mx-neg-3">
              {categories.map(category => {
                const productsInCategory = products.filter(
                  product => product.categoryID === category.id,
                );
                return (
                  <div key={category.id}>
                    <ListGroupItem
                      action
                      active={category.id === openCategory}
                    >
                      <Row>
                        <Col xs={9} className="align-top">
                          {category.name}
                          {' '}
                          <Badge color="success">
                            {productsInCategory.length}
                          </Badge>
                        </Col>
                        <Col xs={3} className="text-right">
                          <Button
                            color="secondary"
                            size="sm"
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
                          {' '}
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => this.editProduct(category.id)}
                          >
                            <Icon
                              color="#EEEEEE"
                              size={16}
                              icon={Icons.PENCIL}
                            />
                          </Button>
                          {' '}
                          <Button
                            color="danger"
                            size="sm"
                            disabled={productsInCategory.length > 0}
                            onClick={() => this.deleteDoc(category.id, 'category')}
                          >
                            <Icon
                              color="#EEEEEE"
                              size={16}
                              icon={Icons.DELETE}
                            />
                          </Button>
                        </Col>
                      </Row>
                    </ListGroupItem>
                    {productsInCategory.length > 0 &&
                      <Collapse isOpen={openCategory === category.id}>
                        {this.renderTable(productsInCategory)}
                      </Collapse>
                    }
                  </div>
                );
              })}
            </ListGroup>
            <CardFooter className="align-items-end">
              <Button
                color="primary"
                onClick={
                  () => this.setState({
                    openModal: true,
                    modalType: 'category',
                  })
                }
              >
                Neue Kategorie
              </Button>
              {' '}
              <Button
                color="success"
                onClick={
                  () => this.setState({
                    openModal: true,
                    modalType: 'product',
                  })
                }
              >
                Neues Produkt
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Modal
          isOpen={this.state.openModal}
          toggle={this.closeModal}
        >
          <ModalHeader toggle={this.closeModal}>
            Produkt anlegen/editieren
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
                  {this.state.modalType === 'product' &&
                    <FormGroup>
                      <Label for="ean">EAN</Label>
                      <Input
                        type="text"
                        name="ean"
                        id="ean"
                        value={this.state.editValues.ean || ''}
                        onChange={e => this.handleOnChange(e, 'ean')}
                        placeholder=""
                      />
                    </FormGroup>
                  }
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
              {this.state.modalType === 'product' &&
                <Row form>
                  <Col
                    xs={6}>
                    <FormGroup>
                      <Label
                        for="priceInt">Mitglieder-Preis</Label>
                      <CurrencyInput
                        className="form-control"
                        decimalSeparator=","
                        precision="2"
                        suffix=" €"
                        type="text"
                        name="priceInt"
                        id="priceInt"
                        value={this.state.editValues.priceInt || ''}
                        onChange={(maskedValue, floatValue, e) => {
                          this.handleOnChange(
                            e,
                            'priceInt',
                            maskedValue,
                            floatValue,
                          )
                        }}
                        placeholder="0,00 €"
                      />
                    </FormGroup>
                  </Col>
                  <Col
                    xs={6}>
                    <FormGroup>
                      <Label
                        for="priceExt">Gäste-Preis</Label>
                      <CurrencyInput
                        className="form-control"
                        decimalSeparator=","
                        precision="2"
                        suffix=" €"
                        type="text"
                        name="priceExt"
                        id="priceExt"
                        value={this.state.editValues.priceExt || ''}
                        onChange={(maskedValue, floatValue, e) => {
                          this.handleOnChange(
                            e,
                            'priceExt',
                            maskedValue,
                            floatValue,
                          )
                        }}
                        placeholder="0,00 €"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              }
              {this.state.modalType === 'product' &&
                <Row form>
                  <Col xs={12}>
                    <FormGroup>
                      <Label for="category">Kategorie</Label>
                      <Input
                        type="select"
                        value={this.state.editValues.categoryID || ''}
                        name="select"
                        id="category"
                        onChange={e => this.handleOnChange(e, 'categoryID')}
                      >
                        {categories.map(category => (
                          <option
                            key={`select_${category.id}`}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
              }
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

export default Products;
