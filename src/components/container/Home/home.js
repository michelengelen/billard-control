import React, { PureComponent } from 'react';
import {
  Card,
  CardTitle,
  CardText,
  Button,
  Container,
  Col,
  Row
} from 'reactstrap';

class Home extends PureComponent {
  render() {
    return (
      <Container fluid>
        <Row className="align-items-center justify-content-center">
          <Col lg={3}>
            <Card body className="text-center">
              <CardTitle>Buchung</CardTitle>
              <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              <Button color="primary">Go somewhere</Button>
            </Card>
          </Col>
          <Col lg={3}>
            <Card body className="text-center">
              <CardTitle>Konto</CardTitle>
              <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              <Button color="success">Go somewhere</Button>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Home;
