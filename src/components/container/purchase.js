import React, {PureComponent}  from 'react';
import {
  Route,
  withRouter,
} from 'react-router-dom';
import {
  Col,
  Row
} from 'reactstrap';

// import of custom components
import Navigation from 'components/common/navigation';
import Dashboard from 'components/container/adminDashboard';
import Products from 'components/container/adminProducts';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Alert,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  ModalFooter,
  Button,
} from 'reactstrap';

class Purchase extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      openModal: true,
      membernumber: '',
    };

    this.handleOnChange = this.handleOnChange.bind(this);
  }
  handleOnChange(e, prop) {
    this.setState({
      [prop]: e.currentTarget.value,
    });
  }
  render() {
    return (
      <Row className="bc-content">
        <Modal
          isOpen={this.state.openModal}
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
                <Label for="membernumber">Mitgliedsnummer</Label>
                <Input
                  type="text"
                  name="membernumber"
                  id="membernumber"
                  value={this.state.membernumber}
                  onChange={e => this.handleOnChange(e, 'membernumber')}
                  placeholder="******"
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() => {}}
            >
              Log In
            </Button>
            {' '}
            <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Row>
    );
  }
}

export default withRouter(Purchase);
