import React, { PureComponent } from 'react';
import {
  Card,
  CardTitle,
  CardText,
  Button,
  Col,
  Row,
} from 'reactstrap';

class Home extends PureComponent {
  render() {
    return (
      <Row className="bc-content align-items-center justify-content-center">
        <Col lg={3}>
          <Card body className="text-center">
            <CardTitle>Buchung</CardTitle>
            <CardText>
              With supporting text below as a natural lead-in to additional
              content.
            </CardText>
            <Button color="primary">Go somewhere</Button>
          </Card>
        </Col>
        <Col lg={3}>
          <Card body className="text-center">
            <CardTitle>Konto</CardTitle>
            <CardText>
              With supporting text below as a natural lead-in to additional
              content.
            </CardText>
            <Button color="success">Go somewhere</Button>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default Home;
