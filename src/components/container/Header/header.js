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
import { Icon } from 'components/common';
import { Icons } from 'variables/constants';

class Home extends PureComponent {
  render() {
    return (
        <Row className="bc-header justify-content-between align-items-center" noGutters>
          <Col xs="auto">
            <h2>Billard Control</h2>
          </Col>
          <Col xs="auto">
            <Icon
              color="#EEEEEE"
              size="52"
              icon={Icons.SETTINGS}
              className="bc-header__button"
           />
          </Col>
        </Row>
    );
  }
}

export default Home;
