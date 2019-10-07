import React, { PureComponent } from 'react';
import PinInput from 'react-pin-input';
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
  InputGroup,
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  Button,
  Table,
} from 'reactstrap';

import { PurchaseContext } from 'contexts/purchaseContext';
import { categoriesRef, membersRef, productsRef } from 'firebase-config/config';
import { ActivityIndicator, Icon, LogoutTimer } from 'components/common';
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
    this.handleOnPinChange = this.handleOnPinChange.bind(this);
    this.checkMembernumber = this.checkMembernumber.bind(this);
    this.setError = this.setError.bind(this);
    this.clearError = this.clearError.bind(this);
    this.addProduct = this.addProduct.bind(this);
    this.submitPurchase = this.submitPurchase.bind(this);
    this.changeAmount = this.changeAmount.bind(this);
    this.removeProduct = this.removeProduct.bind(this);
    this.clearPurchaseList = this.clearPurchaseList.bind(this);

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
      activeTab: 'lastPurchase',
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
      } else {
        this.setState({ product: {} });
      }
    }
  }

  handleOnPinChange(value) {
    this.setState({
      membernumber: value,
    });
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
              const memberdata = docRef.data();
              memberdata.journalRef
                .collection('journal')
                .orderBy('date', 'desc')
                .limit(5)
                .onSnapshot(journalSnap => {
                  const journal = [];
                  journalSnap.forEach(journalDoc => journal.push({ ...journalDoc.data() }));
                  this.context.setPurchaseJournal(journal);
                  this.setState({
                    loading: false,
                    currentPurchaseId: doc.id,
                    membernumber: '',
                  });
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
    const productIndex = this.state.currentPurchase.findIndex(
      element => element.id === this.state.product.id,
    );
    if (productIndex > -1) {
      this.setState(prevState => ({
        currentProduct: '',
        currentPurchase: [
          ...prevState.currentPurchase.slice(0, productIndex),
          {
            ...prevState.currentPurchase[productIndex],
            amount: prevState.currentPurchase[productIndex].amount + prevState.product.amount,
          },
          ...prevState.currentPurchase.slice(productIndex + 1),
        ],
        product: {},
      }));
    } else {
      this.setState(prevState => ({
        currentProduct: '',
        currentPurchase: [
          ...prevState.currentPurchase,
          {
            ...prevState.product,
            date: new Date(),
          },
        ],
        product: {},
      }));
    }
  }

  directlyAddProduct(e, productId) {
    e.preventDefault();
    const productIndex = this.state.currentPurchase.findIndex(element => element.id === productId);
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
    const { memberData } = this.context;
    const { currentPurchase } = this.state;
    if (currentPurchase.length > 0) {
      const promises = currentPurchase.map(currentItem => {
        return memberData.journalRef
          .collection('journal')
          .add(currentItem)
      });
      await Promise.all(promises).then(this.clearPurchaseList);
    } else {
      await this.setError('Keine Produkte in der aktuellen Buchung.');
    }
  }

  clearPurchaseList() {
    this.setState({ currentPurchase: [] });
  }

  changeAmount(e, number, index = null) {
    e.preventDefault();

    if (index === null) {
      this.setState(prevState => ({
        product: {
          ...prevState.product,
          amount: prevState.product.amount + number,
        },
      }));
    } else {
      this.setState(prevState => ({
        currentPurchase: [
          ...prevState.currentPurchase.slice(0, index),
          {
            ...prevState.currentPurchase[index],
            amount: prevState.currentPurchase[index].amount + number,
          },
          ...prevState.currentPurchase.slice(index + 1),
        ],
      }));
    }
  }

  removeProduct(index) {
    this.setState(prevState => ({
      currentPurchase: [
        ...prevState.currentPurchase.slice(0, index),
        ...prevState.currentPurchase.slice(index + 1),
      ],
    }));
  }

  setError(error) {
    this.setState({ error, loading: false },
      () => setTimeout(this.clearError, 5000)
    );
  }

  clearError() {
    this.setState({
      error: '',
    })
  }

  render() {
    return (
      <Row className="bc-content">
        <ActivityIndicator loading={this.state.loading} />
        <PurchaseContext.Consumer>
          {ctxt => {
            console.log('### memberData: ', ctxt.memberData);
            if (ctxt.membernumber < 0) {
              return (
                <Row className="bc-content align-items-center justify-content-center">
                  <Col xs={4}>
                    <Form onSubmit={this.checkMembernumber} autoComplete="off">
                      <Card className="text-center">
                        <CardHeader>
                          <h5 className="m-0">Buchungs-Login</h5>
                        </CardHeader>
                        <CardBody>
                          <Alert
                            color="danger"
                            fade={false}
                            isOpen={!!this.state.error}
                            toggle={() => this.setState({ error: '' })}
                          >
                            {this.state.error}
                          </Alert>
                          <FormGroup>
                            <Label for="membernumber">Mitgliedsnummer</Label>
                            <PinInput length={6} onChange={this.handleOnPinChange} type="numeric" focus secret />
                            {/*<Input*/}
                            {/*  autoComplete="off"*/}
                            {/*  className="text-center"*/}
                            {/*  type="text"*/}
                            {/*  name="membernumber"*/}
                            {/*  id="membernumber"*/}
                            {/*  value={this.state.membernumber}*/}
                            {/*  innerRef={input => (this.focussedInput = input)}*/}
                            {/*  onChange={e => this.handleOnChange(e, 'membernumber')}*/}
                            {/*  placeholder="******"*/}
                            {/*/>*/}
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
                  <Row className="bc-content align-items-stretch p-3 h-100">
                    <Col xs={6}>
                      <div className="card-deck">
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
                        <Card className="mb-3">
                          <CardHeader>
                            <h5 className="m-0">Auto-Logout</h5>
                          </CardHeader>
                          <CardBody className="text-center">
                            <LogoutTimer
                              callback={() => {
                                const { currentPurchase } = this.state;
                                if (currentPurchase.length > 0) {
                                  this.submitPurchase().then(ctxt.unsetMember);
                                } else {
                                  ctxt.unsetMember();
                                }
                              }}
                              startTimer={!this.state.loading && !!ctxt.memberId}
                              interval={250}
                              storeKey={'lastAction'}
                              time={process.env.NODE_ENV === 'development' ? 300000 : 50000}
                            />
                            <Button
                              type="button"
                              className="btn-danger btn-block"
                              onClick={ctxt.unsetMember}
                            >
                              Logout
                            </Button>
                          </CardBody>
                        </Card>
                      </div>
                      <Card>
                        <CardHeader>
                          <Nav tabs className="card-header-tabs">
                            <NavItem>
                              <NavLink
                                active={this.state.activeTab === 'lastPurchase'}
                                onClick={() => this.setState({ activeTab: 'lastPurchase' })}
                              >
                                letzte Buchungen
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                active={this.state.activeTab === 'categories'}
                                onClick={() => this.setState({ activeTab: 'categories' })}
                              >
                                Produktübersicht
                              </NavLink>
                            </NavItem>
                          </Nav>
                        </CardHeader>
                        <CardBody className="py-0">
                          {this.state.activeTab === 'lastPurchase' && (
                            <Row className="mx-neg-3">
                              <Table striped hover>
                                <tbody>
                                  {ctxt.journal.map((item, index) => {
                                    if (item.public) {
                                      return (
                                        <tr key={`journalTable${index}_${item.id}`}>
                                          <td className="align-middle">{item.name || '---'}</td>
                                          <td className="text-center align-middle">
                                            {item.price ? getPriceString(item.price) : '---'}
                                          </td>
                                          <td className="text-center align-middle">
                                            {item.amount}
                                          </td>
                                          <td className="text-center align-middle">
                                            {getPriceString(item.amount * item.price)}
                                          </td>
                                          <td className="text-right">
                                            <Button
                                              color="success"
                                              size="sm"
                                              className="p-1"
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
                          )}
                          {/*{this.state.activeTab === 'categories' && <h1>Produktübersicht!</h1>}*/}
                        </CardBody>
                      </Card>
                    </Col>
                    <Col xs={6}>
                      <Card className="h-100">
                        <CardHeader>
                          <Row>
                            <Col xs={6}>
                              <h5 className="m-0">aktuelle Buchung</h5>
                            </Col>
                            <Col xs={6} className="text-right">
                              {ctxt.memberData.isGuest && (
                                <Button
                                  type="button"
                                  color="info"
                                  className="mr-3"
                                  onClick={() => console.log('### abbrechnung ausdrucken ###')}
                                >
                                  Gastkonto abrechnen
                                </Button>
                              )}
                              <Button
                                type="button"
                                color="success"
                                onClick={() => {
                                  const { currentPurchase } = this.state;
                                  this.submitPurchase().then(() => {
                                    if (currentPurchase.length > 0) {
                                      ctxt.unsetMember();
                                    }
                                  });
                                }}
                              >
                                Buchung abschicken
                              </Button>
                            </Col>
                          </Row>
                        </CardHeader>
                        <CardBody className="p-0">
                          <Alert
                            color="danger"
                            className="m-3"
                            fade={false}
                            isOpen={!!this.state.error}
                            toggle={() => this.setState({ error: '' })}
                          >
                            {this.state.error}
                          </Alert>
                          <ListGroup className="mb-3" flush>
                            {this.state.currentPurchase.map((item, index) => {
                              return (
                                <ListGroupItem
                                  color="light"
                                  key={`purchaseTable_${item.id}_${index}`}
                                >
                                  <Row className="align-items-center">
                                    <Col xs={5}>
                                      <span className="align-self-center">
                                        {item.name || '---'}
                                      </span>
                                    </Col>
                                    <Col xs={2} className="text-center">
                                      {`á ${getPriceString(item.price)}`}
                                    </Col>
                                    <Col xs={2} className="text-center">
                                      {getPriceString(item.amount * item.price)}
                                    </Col>
                                    <Col xs={3} className="text-center">
                                      <InputGroup className="input-group-sm">
                                        <div className="input-group-prepend">
                                          <Button
                                            disabled={item.amount < 2}
                                            className="btn btn-sm btn-secondary"
                                            type="button"
                                            onClick={e => this.changeAmount(e, -1, index)}
                                          >
                                            -
                                          </Button>
                                        </div>
                                        <Input
                                          disabled
                                          className="text-center w-25"
                                          type="text"
                                          name="currentProduct"
                                          id="currentProduct"
                                          value={item.amount}
                                          onChange={() => {}}
                                          placeholder=""
                                        />
                                        <div className="input-group-append">
                                          <Button
                                            disabled={item.amount > 29}
                                            className="btn btn-sm btn-secondary"
                                            type="button"
                                            onClick={e => this.changeAmount(e, 1, index)}
                                          >
                                            +
                                          </Button>
                                          <Button
                                            color="danger"
                                            size="sm"
                                            className="p-1"
                                            onClick={() => this.removeProduct(index)}
                                          >
                                            <Icon color="#EEEEEE" size={20} icon={Icons.DELETE} />
                                          </Button>
                                        </div>
                                      </InputGroup>{' '}
                                    </Col>
                                  </Row>
                                </ListGroupItem>
                              );
                            })}
                          </ListGroup>
                        </CardBody>
                        <CardFooter>
                          <Form onSubmit={this.addProduct}>
                            <Row>
                              {this.state.product.name && (
                                <Col xs={12}>
                                  <ListGroup className="mb-3" flush>
                                    <ListGroupItem color="light">
                                      <Row className="align-items-center">
                                        <Col xs={4}>
                                          <span className="align-self-center">
                                            {this.state.product.name || '---'}
                                          </span>
                                        </Col>
                                        <Col xs={2} className="text-center">
                                          {`á ${getPriceString(this.state.product.price)}`}
                                        </Col>
                                        <Col xs={2} className="text-center">
                                          {getPriceString(
                                            this.state.product.amount * this.state.product.price,
                                          )}
                                        </Col>
                                        <Col xs={2} className="text-center">
                                          <InputGroup className="input-group-sm">
                                            <div className="input-group-prepend">
                                              <Button
                                                disabled={this.state.product.amount < 2}
                                                className="btn btn-sm btn-secondary"
                                                type="button"
                                                onClick={e => this.changeAmount(e, -1)}
                                              >
                                                -
                                              </Button>
                                            </div>
                                            <Input
                                              disabled
                                              className="text-center w-25"
                                              type="text"
                                              name="currentProduct"
                                              id="currentProduct"
                                              value={this.state.product.amount}
                                              onChange={() => {}}
                                              placeholder=""
                                            />
                                            <div className="input-group-append">
                                              <Button
                                                disabled={this.state.product.amount > 29}
                                                className="btn btn-sm btn-secondary"
                                                type="button"
                                                onClick={e => this.changeAmount(e, 1)}
                                              >
                                                +
                                              </Button>
                                            </div>
                                          </InputGroup>
                                        </Col>
                                        <Col xs={2} className="text-center">
                                          <Button type="submit" className="btn-sm">
                                            Hinzufügen
                                          </Button>
                                        </Col>
                                      </Row>
                                    </ListGroupItem>
                                  </ListGroup>
                                </Col>
                              )}
                              <Col xs={12}>
                                <Input
                                  className="text-center"
                                  type="text"
                                  name="currentProduct"
                                  id="currentProduct"
                                  value={this.state.currentProduct}
                                  innerRef={input => (this.focussedInput = input)}
                                  onChange={e => this.handleOnChange(e, 'currentProduct')}
                                  placeholder="EAN-Nummer"
                                />
                              </Col>
                            </Row>
                          </Form>
                        </CardFooter>
                      </Card>
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
