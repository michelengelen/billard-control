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
} from 'reactstrap';

import { PurchaseContext } from 'contexts/purchaseContext';
import { membersRef, productsRef, purchasesRef } from 'firebase-config/config';
import { ActivityIndicator } from 'components/common';
import { getDateString } from 'helpers/helpers';

class Purchase extends PureComponent {
  constructor(props) {
    super(props);

    this.handleOnChange = this.handleOnChange.bind(this);
    this.checkMembernumber = this.checkMembernumber.bind(this);
    this.setError = this.setError.bind(this);
    this.addProduct = this.addProduct.bind(this);
    this.submitPurchase = this.submitPurchase.bind(this);

    this.state = {
      loading: false,
      membernumber: '',
      product: {},
      currentProduct: '',
      currentPurchase: [],
      error: '',
      currentPurchaseRef: null,
    };

    this.focussedInput = null;
  }

  componentDidMount() {
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
      productsRef
        .where('ean', '==', newValue)
        .get()
        .then(querySnap => {
          if (querySnap.size === 1) {
            querySnap.forEach(docRef => {
              this.setState({
                product: { ...docRef.data(), productId: docRef.id },
              });
            });
          } else {
            this.setState({
              product: {},
            });
          }
        });
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
          this.setError(
            'Es konnte kein eindeutiger Nutzer mit der Nummer gefunden werden.',
          );
        } else {
          snapShot.forEach(doc => {
            membersRef.doc(doc.id).onSnapshot(docRef => {
              this.context.setMember(
                this.state.membernumber,
                docRef.id,
                docRef.data(),
              );
              purchasesRef
                .where('userId', '==', docRef.id)
                .get()
                .then(purchSnap => {
                  if (purchSnap.size > 0) {
                    purchSnap.forEach(doc => {
                      purchasesRef
                        .doc(doc.id)
                        .collection('journal')
                        .limit(10)
                        .onSnapshot(journalSnap => {
                          const journal = [];
                          journalSnap.forEach(journalDoc =>
                            journal.push({ ...journalDoc.data() }),
                          );
                          this.context.setPurchaseJournal(journal);
                          this.setState({
                            loading: false,
                            currentPurchaseRef: purchasesRef.doc(doc.id),
                          });
                        });
                    });
                  } else {
                    purchasesRef.add({ userId: docRef.id }).then(doc => {
                      this.setState({
                        loading: false,
                        currentPurchaseRef: purchasesRef.doc(doc.id),
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
      currentPurchase: [...prevState.currentPurchase, prevState.product],
      product: {},
    }));
  }

  submitPurchase() {
    debugger;

    if (this.state.currentPurchase.length > 0) {
      this.setState({ loading: true });
      this.state.currentPurchase.map(item => {
        this.state.currentPurchaseRef
          .collection('journal')
          .add(item)
          .then(doc => {
            console.log('#### submitPurchase: ', doc.id);
          });
      });
      this.setState({ loading: false, currentPurchase: [] });
    } else {
      this.setError('Keine Produkte in der aktuellen Buchung.');
    }
  }

  setError(error) {
    this.setState({ error, loading: false });
  }

  render() {
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
                              onChange={e =>
                                this.handleOnChange(e, 'membernumber')
                              }
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
                          <h4>
                            <strong>{`${ctxt.memberData.firstname} ${
                              ctxt.memberData.lastname
                            }`}</strong>
                          </h4>
                          <p>
                            <strong>Mitgliedsnummer</strong> {ctxt.membernumber}
                          </p>
                          <p>
                            <strong>Mitglied seit</strong>{' '}
                            {getDateString(
                              ctxt.memberData.entryDate.seconds * 1000,
                            )}
                          </p>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHeader>
                          <h5 className="m-0">letzte Buchungen</h5>
                        </CardHeader>
                        <CardBody>
                          {ctxt.journal.map((item, index) => (
                            <p key={`${item.productId}_${index}`}>
                              {item.name}
                            </p>
                          ))}
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
                            <p key={`${item.productId}_${index}`}>
                              {item.name}
                            </p>
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
                                onChange={e =>
                                  this.handleOnChange(e, 'currentProduct')
                                }
                                placeholder="******"
                              />
                              {this.state.product.name && (
                                <p>{this.state.product.name}</p>
                              )}
                            </FormGroup>
                          </Form>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                  <Row className="bc-content align-items-stretch h-10 p-3">
                    <Col xs={6} className="text-right">
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
