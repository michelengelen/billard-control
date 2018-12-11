import React, { PureComponent } from 'react';
import {
  Col,
  Row,
  Jumbotron,
} from 'reactstrap';

class Dashboard extends PureComponent {
  render() {
    return (
      <Row className="bc-content mr-0 pt-3">
        <Col xs={12}>
          <Jumbotron>
            <h1 className="display-3">Admin-Dashboard</h1>
            <p className="lead">Here should the overview of products, members etc. be displayed in an easy way.</p>
            <hr className="my-2" />
            <p>Just some dummy-text</p>
          </Jumbotron>
        </Col>
      </Row>
    );
  }
}

export default Dashboard;
