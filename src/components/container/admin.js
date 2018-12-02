import React, { PureComponent } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import {
  Card, CardText, CardTitle,
  Col,
  Row
} from 'reactstrap';

class Admin extends PureComponent {
  constructor(props) {
    super(props);

    this.showModal = this.showModal.bind(this);
  }

  showModal(modalType) {
    if (modalType && typeof modalType === 'string') {
      this.setState({
        modalOpen: true,
        modalType,
      });
    }
  }

  render() {
    return (
      <Row className="bc-content align-items-center">
        <Col lg={3}>
          <Card body className="text-center">
            <CardTitle>ADMIN</CardTitle>
            <CardText>
              With supporting text below as a natural lead-in to additional
              content.
            </CardText>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default withRouter(Admin);
