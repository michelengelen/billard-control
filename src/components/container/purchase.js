import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Row } from 'reactstrap';

// import of custom components
import {
  Col,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Alert,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Table,
} from 'reactstrap';

import { PurchaseContext } from 'contexts/purchaseContext';
import { categoriesRef, membersRef, productsRef, purchasesRef } from 'firebase-config/config';
import { ActivityIndicator, Icon } from 'components/common';
import {
  getDateString,
  getPriceString,
  refineProductForPurchase,
  sortByProperty,
} from 'helpers/helpers';
import { Icons } from '../../variables/constants';

class Purchase extends PureComponent {
  constructor(props) {
    super(props);

    this.handleOnChange = this.handleOnChange.bind(this);
    this.checkMembernumber = this.checkMembernumber.bind(this);
    this.setError = this.setError.bind(this);
    this.addProduct = this.addProduct.bind(this);
    this.submitPurchase = this.submitPurchase.bind(this);

    this.state = {
      loading: true,
      membernumber: '',
      product: {},
      products: {},
      categories: {},
      currentProduct: '',
      currentPurchase: [],
      currentPurchaseId: '',
      error: '',
    };

    this.focussedInput = null;
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
          products: sortByProperty(response.products, 'name'),
          categories: sortByProperty(response.categories, 'name'),
        });
      });
    });
    if (this.focussedInput) {
      this.focussedInput.focus();
    }
  }

  componentDidUpdate() {
    if (this.focussedInput) {
      this.focussedInput.focus();
    }
  }

  handleOnChange(e, prop) {
    e.preventDefault();
    const newValue = e.currentTarget.value;

    this.setState({
      [prop]: newValue,
    });

    if (prop === 'currentProduct') {
      const foundProduct = this.state.products.find(element => element.ean === newValue);
      if (foundProduct) {
        const product = refineProductForPurchase(foundProduct, this.context.memberData.isGuest);
        this.setState({ product });
      }
    }
  }

  checkMembernumber(e) {
    e.preventDefault();
    this.setState({ loading: true });
    membersRef
      .where('membernumber', '==', parseInt(this.state.membernumber))
      .get()
      .then(snapShot => {
        if (snapShot.size !== 1) {
          this.setError('Es konnte kein eindeutiger Nutzer mit der Nummer gefunden werden.');
        } else {
          snapShot.forEach(doc => {
            membersRef.doc(doc.id).onSnapshot(docRef => {
              this.context.setMember(this.state.membernumber, docRef.id, docRef.data());
              purchasesRef
                .where('userId', '==', docRef.id)
                .get()
                .then(purchSnap => {
                  if (purchSnap.size > 0) {
                    purchSnap.forEach(doc => {
                      purchasesRef
                        .doc(doc.id)
                        .collection('journal')
                        .orderBy('date', 'desc')
                        .limit(10)
                        .onSnapshot(journalSnap => {
                          const journal = [];
                          journalSnap.forEach(journalDoc => journal.push({ ...journalDoc.data() }));
                          this.context.setPurchaseJournal(journal);
                          console.log('#### journal: ', journal);
                          // this.context.setPurchaseJournal(journal);
                          this.setState({
                            loading: false,
                            currentPurchaseId: doc.id,
                          });
                        });
                    });
                  } else {
                    purchasesRef.add({ userId: docRef.id }).then(doc => {
                      this.setState({
                        loading: false,
                        currentPurchaseId: doc.id,
                      });
                    });
                  }
                });
            });
          });
        }
      })
      .catch(error => {
        this.setError(error);
      });
  }

  addProduct(e) {
    e.preventDefault();
    this.setState(prevState => ({
      currentProduct: '',
      currentPurchase: [...prevState.currentPurchase, { ...prevState.product, date: new Date() }],
      product: {},
    }));
  }

  directlyAddProduct(e, productId) {
    e.preventDefault();
    const productIndex = this.state.currentPurchase.findIndex(element => element.id === productId);
    debugger;
    if (productIndex > -1) {
      this.setState(prevState => ({
        currentPurchase: [
          ...prevState.currentPurchase.slice(0, productIndex),
          {
            ...prevState.currentPurchase[productIndex],
            amount: prevState.currentPurchase[productIndex].amount + 1,
          },
          ...prevState.currentPurchase.slice(productIndex + 1),
        ],
      }));
    } else {
      const product = refineProductForPurchase(
        this.state.products.find(element => element.id === productId),
        this.context.memberData.isGuest,
      );
      this.setState(prevState => {
        return {
          currentPurchase: [...prevState.currentPurchase, { ...product, date: new Date() }],
        };
      });
    }
  }

  async submitPurchase() {
    const { currentPurchase, currentPurchaseId } = this.state;
    if (currentPurchase.length > 0) {
      this.setState({ loading: true });
      const promises = currentPurchase.map(currentItem => {
        purchasesRef
          .doc(currentPurchaseId)
          .collection('journal')
          .add(currentItem)
          .then(doc => {
            console.log('#### submitPurchase: ', doc.id);
          });
      });
      await Promise.all(promises);
      this.setState({ loading: false, currentPurchase: [] });
    } else {
      await this.setError('Keine Produkte in der aktuellen Buchung.');
    }
  }

  setError(error) {
    this.setState({ error, loading: false });
  }

  render() {
    console.log('#### state: ', this.state.currentPurchase);
    return (
      <Row className="bc-content">
        <ActivityIndicator loading={this.state.loading} />
        <PurchaseContext.Consumer>
          {ctxt => {
            if (ctxt.membernumber < 0) {
              return (
                <Row className="bc-content align-items-center justify-content-center">
                  <Col xs={4}>
                    <Form onSubmit={this.checkMembernumber}>
                      <Card className="text-center">
                        <CardHeader>
                          <h5 className="m-0">Buchungs-Login</h5>
                        </CardHeader>
                        <CardBody>
                          <Alert
                            color="danger"
                            isOpen={!!this.state.error}
                            toggle={() => this.setState({ error: '' })}
                          >
                            {this.state.error}
                          </Alert>
                          <FormGroup>
                            <Label for="membernumber">Mitgliedsnummer</Label>
                            <Input
                              className="text-center"
                              type="text"
                              name="membernumber"
                              id="membernumber"
                              value={this.state.membernumber}
                              innerRef={input => (this.focussedInput = input)}
                              onChange={e => this.handleOnChange(e, 'membernumber')}
                              placeholder="******"
                            />
                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <Button color="primary" type="submit">
                            Login
                          </Button>
                        </CardFooter>
                      </Card>
                    </Form>
                  </Col>
                </Row>
              );
            } else {
              return (
                <Col xs={12}>
                  <Row className="bc-content align-items-stretch h-90 p-3">
                    <Col xs={6}>
                      <Card className="mb-3">
                        <CardHeader>
                          <h5 className="m-0">Mitgliedsdaten</h5>
                        </CardHeader>
                        <CardBody>
                          <h4 className="ml-0">
                            <strong>{`${ctxt.memberData.firstname} ${
                              ctxt.memberData.lastname
                            }`}</strong>
                          </h4>
                          <hr />
                          <p>
                            <strong>Mitgliedsnummer</strong> {ctxt.membernumber}
                          </p>
                          <p>
                            <strong>Mitglied seit</strong>{' '}
                            {getDateString(ctxt.memberData.entryDate.timestamp, false)}
                          </p>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHeader>
                          <h5 className="m-0">letzte Buchungen</h5>
                        </CardHeader>
                        <CardBody className="py-0">
                          <Row className="mx-neg-3">
                            <Table striped hover>
                              <thead>
                                <tr>
                                  <th>Artikel</th>
                                  <th className="text-center">Preis</th>
                                  <th className="text-center">Menge</th>
                                  <th className="text-center">Gesamt</th>
                                  <th> </th>
                                </tr>
                              </thead>
                              <tbody>
                                {ctxt.journal.map((item, index) => {
                                  if (item.public) {
                                    return (
                                      <tr key={`journalTable${index}_${item.id}`}>
                                        <td className="align-middle">{item.name || '---'}</td>
                                        <td className="text-center align-middle">
                                          {item.price ? getPriceString(item.price) : '---'}
                                        </td>
                                        <td className="text-center align-middle">{item.amount}</td>
                                        <td className="text-center align-middle">
                                          {getPriceString(item.amount * item.price)}
                                        </td>
                                        <td className="text-right">
                                          <Button
                                            color="success"
                                            size="sm"
                                            className="border-radius-50 p-2"
                                            onClick={e => this.directlyAddProduct(e, item.id)}
                                          >
                                            <Icon
                                              color="#EEEEEE"
                                              size={20}
                                              icon={Icons.CHEVRON.RIGHT}
                                            />
                                          </Button>
                                        </td>
                                      </tr>
                                    );
                                  }
                                  return null;
                                })}
                              </tbody>
                            </Table>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col xs={6}>
                      <Card className="h-100">
                        <CardHeader>
                          <h5 className="m-0">aktuelle Buchung</h5>
                        </CardHeader>
                        <CardBody>
                          <Alert
                            color="danger"
                            isOpen={!!this.state.error}
                            toggle={() => this.setState({ error: '' })}
                          >
                            {this.state.error}
                          </Alert>
                          {this.state.currentPurchase.map((item, index) => (
                            <p key={`${item.productId}_${index}`}>{item.name}</p>
                          ))}
                          <Form onSubmit={this.addProduct}>
                            <FormGroup>
                              <Label for="currentProduct">Produkt</Label>
                              <Input
                                className="text-center"
                                type="text"
                                name="currentProduct"
                                id="currentProduct"
                                value={this.state.currentProduct}
                                innerRef={input => (this.focussedInput = input)}
                                onChange={e => this.handleOnChange(e, 'currentProduct')}
                                placeholder="******"
                              />
                              {this.state.product.name && <p>{this.state.product.name}</p>}
                            </FormGroup>
                          </Form>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                  <Row className="bc-content align-items-stretch h-10 p-3">
                    <Col xs={12} className="text-right">
                      <Button type="button" onClick={this.submitPurchase}>
                        Buchung abschicken
                      </Button>
                    </Col>
                  </Row>
                </Col>
              );
            }
          }}
        </PurchaseContext.Consumer>
      </Row>
    );
  }
}

export default withRouter(Purchase);

Purchase.contextType = PurchaseContext;
