import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Alert,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Col,
  Row,
} from 'reactstrap';
import { AvForm, AvField } from 'availity-reactstrap-validation';

import { authRef } from 'firebase-config/config';
import { UserContext } from 'contexts/userContext';

class Home extends PureComponent {
  constructor(props) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.signInAdmin = this.signInAdmin.bind(this);

    this.state = {
      modalOpen: false,
      adminEmail: '',
      adminPass: '',
      error: '',
    };
  }

  componentDidMount() {
    const ctxt = this.context;
    authRef.onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        const refinedUserData = {
          name: user.displayName || 'Admin',
          email: user.email,
          isAuthenticated: true,
          hasAdminRights: user.isAdmin || true,
        };
        ctxt.signInUser(refinedUserData);
      } else {
        // No user is signed in.
        console.log('No user is signed in at the moment!');
      }
    });
  }

  handleOnChange(e, fieldType) {
    e.preventDefault();
    this.setState({
      [fieldType]: e.target.value,
    });
  }

  toggleModal() {
    const { isAuthenticated, hasAdminRights } = this.context.user;
    if (isAuthenticated && hasAdminRights) {
      this.props.history.push('/admin');
      return;
    }
    this.setState(prevState => ({ modalOpen: !prevState.modalOpen }));
  }

  signInAdmin(callback) {
    const { history } = this.props;
    const { adminEmail, adminPass } = this.state;
    authRef
      .signInWithEmailAndPassword(adminEmail, adminPass)
      .then(success => {
        const { user } = success;
        const refinedUserData = {
          name: user.displayName || 'Admin',
          email: user.email,
          isAuthenticated: true,
          hasAdminRights: user.isAdmin || true,
        };
        callback(refinedUserData).then(() => {
          history.push('/admin');
        });
      })
      .catch(error => {
        this.setState({
          error: error.message,
        });
      });
  }

  render() {
    const { history } = this.props;
    return (
      <Row className="bc-content align-items-center justify-content-center">
        <Col xs={3}>
          <Card className="text-center">
            <CardHeader>
              <h5 className="m-0">Buchung</h5>
            </CardHeader>
            <CardBody>
              With supporting text below as a natural lead-in to additional
              content.
            </CardBody>
            <CardFooter>
              <Button color="primary" onClick={() => history.push('/purchase')}>
                Zur Buchungsseite
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Col xs={3}>
          <Card className="text-center">
            <CardHeader>
              <h5 className="m-0">Admin-Bereich</h5>
            </CardHeader>
            <CardBody>
              Hier geht es zum Verwaltungsbereich der Billard-Control Software.
            </CardBody>
            <CardFooter>
              <Button color="primary" onClick={this.toggleModal}>
                Zum Admin-Bereich
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Modal isOpen={this.state.modalOpen} toggle={this.toggleModal}>
          <UserContext.Consumer>
            {ctxt => (
              <AvForm onValidSubmit={() => this.signInAdmin(ctxt.signInUser)}>
                <ModalHeader toggle={this.toggleModal}>Anmeldung</ModalHeader>
                <ModalBody>
                  <Alert
                    color="danger"
                    isOpen={!!this.state.error}
                    toggle={() => this.setState({ error: '' })}
                  >

                    <h4 className="alert-heading">Oops!</h4>
                    <hr />
                    <p>{this.state.error}</p>
                  </Alert>
                  <Row form>
                    <Col xs={5}>
                      <AvField
                        type="text"
                        name="adminEmail"
                        id="adminEmail"
                        onChange={e => this.handleOnChange(e, 'adminEmail')}
                        placeholder="E-Mail"
                        validate={{
                          required: {
                            value: true,
                            errorMessage: 'Bitte eine E-Mail Adresse eintragen',
                          },
                          email: {
                            value: true,
                            errorMessage:
                              'Die E-Mail Adresse ist nicht im korrekten Format',
                          },
                        }}
                      />
                    </Col>
                    <Col xs={5}>
                      <AvField
                        type="password"
                        name="adminPass"
                        id="adminPass"
                        onChange={e => this.handleOnChange(e, 'adminPass')}
                        placeholder="Passwort"
                        validate={{
                          required: {
                            value: true,
                            errorMessage: 'Bitte ein Passwort eintragen',
                          },
                          minLength: {
                            value: 6,
                            errorMessage:
                              'Das Passwort muss 6 Zeichen oder mehr haben',
                          },
                        }}
                      />
                    </Col>
                    <Col xs={2}>
                      <Button color="primary" type="submit" className="w-100">
                        Log In
                      </Button>
                    </Col>
                  </Row>
                </ModalBody>
              </AvForm>
            )}
          </UserContext.Consumer>
        </Modal>
      </Row>
    );
  }
}

export default withRouter(Home);
Home.contextType = UserContext;
