import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
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
    const { history } = this.props;
    return (
      <Row className="bc-content align-items-center justify-content-center">
        <Col lg={3}>
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
                Go somewhere
              </Button>
          </Card>
        </Col>
        <Col lg={3}>
          <Card body className="text-center">
            <CardTitle>Konto</CardTitle>
            <CardText>
              With supporting text below as a natural lead-in to additional
              content.
            </CardText>
              <Button
                color="primary"
                onClick={() => history.push('/admin')}
              >
                Go somewhere
              </Button>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default withRouter(Home);
