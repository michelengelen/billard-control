import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  Card,
  CardTitle,
  CardText,
  Button,
  Col,
  Row,
} from 'reactstrap';

export const NoMatch = withRouter(props =>
  (
    <Row className="bc-content align-items-center justify-content-center">
      <Col lg={4}>
        <Card body className="text-center">
          <CardTitle>Seite nicht gefunden</CardTitle>
          <CardText>
            Gratulation! Du hast eine Seite gefunden, die nicht existiert!
          </CardText>
            <Button
              color="primary"
              onClick={() => props.history.push('/')}
            >
              Zur Startseite
            </Button>
        </Card>
      </Col>
    </Row>
  )
);
