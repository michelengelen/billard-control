import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Alert,
  Card,
  CardTitle,
  CardText,
  Form,
  FormGroup,
  FormFeedback,
  Input,
  Label,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Col,
  Row,
} from 'reactstrap';

import { validateEmail } from 'helpers/helpers';
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
          hasAdminRights: user.isAdmin || true
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
    })
  }

  toggleModal() {
    console.log('toggle', this.context);
    const { isAuthenticated, hasAdminRights } = this.context.user;
    if (isAuthenticated && hasAdminRights) {
      console.log('admin?');
      this.props.history.push('/admin');
    }
    this.setState(prevState => ({modalOpen: !prevState.modalOpen}));
  }

  signInAdmin(callback) {
    const { history } = this.props;
    const { adminEmail, adminPass } = this.state;
    authRef.signInWithEmailAndPassword(adminEmail, adminPass)
      .then(success => {
        const { user } = success;
        const refinedUserData = {
          name: user.displayName || 'Admin',
          email: user.email,
          isAuthenticated: true,
          hasAdminRights: user.isAdmin || true
        };
        callback(refinedUserData).then(() => { history.push('/admin') });
      })
      .catch(error => {
        this.setState({
          error: error.message,
        });
      });
  }

  render() {
    const emailValid = validateEmail(this.state.adminEmail);
    const { history } = this.props;
    return (
      <Row className="bc-content align-items-center justify-content-center">
        <Col xs={3}>
          <Card body className="text-center">
            <CardTitle>Buchung</CardTitle>
            <CardText>
              With supporting text below as a natural lead-in to additional
              content.
            </CardText>
              <Button
                color="primary"
                onClick={() => history.push('/purchase')}
              >
                Zur Buchungsseite
              </Button>
          </Card>
        </Col>
        <Col xs={3}>
          <Card body className="text-center">
            <CardTitle>Admin</CardTitle>
            <CardText>
              Hier geht es zum Verwaltungsbereich der Billard-Control Software.
            </CardText>
              <Button
                color="primary"
                onClick={this.toggleModal}
              >
                Zum Admin-Bereich
              </Button>
          </Card>
        </Col>
        <Modal
          isOpen={this.state.modalOpen}
          toggle={this.toggleModal}
        >
          <ModalHeader toggle={this.toggleModal}>Modal title</ModalHeader>
          <ModalBody>
            <Alert
              color="danger"
              isOpen={!!this.state.error}
              toggle={() => this.setState({error: ''})}
            >
              {this.state.error}
            </Alert>
            <Form>
              <FormGroup>
                <Label for="adminEmail">Email</Label>
                <Input
                  type="email"
                  name="email"
                  id="adminEmail"
                  invalid={!emailValid}
                  onChange={e => this.handleOnChange(e, 'adminEmail')}
                  placeholder="E-mail Adresse"
                />
                  <FormFeedback>
                    Die Email-Adresse ist nicht im korrekten Format
                  </FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="adminPass">Password</Label>
                <Input
                  type="password"
                  name="password"
                  id="adminPass"
                  onChange={e => this.handleOnChange(e, 'adminPass')}
                  placeholder="Passwort"
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <UserContext.Consumer>
              {ctxt => (
                <Button
                  color="primary"
                  onClick={() => this.signInAdmin(ctxt.signInUser)}
                >
                  Log In
                </Button>
              )}
            </UserContext.Consumer>
            {' '}
            <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Row>
    );
  }
}

Home.contextType = UserContext;

export default withRouter(Home);
