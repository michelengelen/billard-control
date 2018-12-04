import React, { PureComponent } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import {
  Card, CardText, CardTitle,
  Col,
  Row
} from 'reactstrap';
import { productsRef } from 'firebase-config/config';

class Admin extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      products: null,
    };
  }

  componentDidMount() {
    productsRef.get().then(querySnapshot => {
      const products = [];
      querySnapshot.forEach(doc => {
        products.push(doc.data());
        console.log(`${doc.id} => ${doc.data()}`);
      });
      this.setState({
        products,
      })
    });
  }

  render() {
    return (
      <Row className="bc-content">
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
