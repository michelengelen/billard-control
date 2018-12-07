import React, { Component } from 'react';
import {
  Badge,
  Button,
  Card,
  CardTitle,
  Col,
  Collapse,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
  Table,
} from 'reactstrap';
import { categoriesRef, productsRef } from 'firebase-config/config';
import { sortByProperty } from 'helpers/helpers';
import { Icon } from '../common';
import { Icons } from '../../variables/constants';
import { UserContext } from '../../contexts/userContext';
import AppRouter
  from '../router/router';

class Products extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      products: [],
      openCategory: '',
    };
  }

  componentDidMount() {
    let response = {};
    productsRef.get().then(querySnapshot => {
      response.products = [];
      querySnapshot.forEach(doc => {
        response.products.push({id: doc.id, ...doc.data()});
      });
      categoriesRef.get().then(querySnapshot => {
        response.categories = [];
        querySnapshot.forEach(doc => {
          response.categories.push({id: doc.id, ...doc.data()});
        });
        this.setState({
          categories: sortByProperty(response.categories, 'name'),
          products: sortByProperty(response.products, 'name'),
        })
      });
    });
  }

  renderTable(products) {
    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>Artikel</th>
            <th>EAN-Code</th>
            <th className="text-center">€ (int.)</th>
            <th className="text-center">€ (ext.)</th>
            <th className="text-center">Bestand</th>
            <th className="text-center">{' '}</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name || '---'}</td>
              <td>{product.EAN || '---'}</td>
              <td className="text-center">{product.priceInt || '---'}</td>
              <td className="text-center">{product.priceExt || '---'}</td>
              <td className="text-center">{product.amount || 0}</td>
              <td className="text-center">
                <Button color="primary" size="sm">
                  <Icon
                    color="#EEEEEE"
                    size={16}
                    icon={Icons.PENCIL}
                  />
                </Button>
                {' '}
                <Button color="danger" size="sm">
                  <Icon
                    color="#EEEEEE"
                    size={16}
                    icon={Icons.DELETE}
                  />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )
  }

  render() {
    console.log('### STATE: ', this.state);
    const { categories, products, openCategory } = this.state;
    return (
      <Row className="bc-content mr-0 pt-3">
        <Col xs={12}>
          <Card body>
            <CardTitle>Produkte</CardTitle>
            <ListGroup flush className="mx-neg-3">
              {categories.map(category => {
                const productsInCategory = products.filter(
                  product => product.categoryId === category.id,
                );
                return (
                  <div key={category.id}>
                    <ListGroupItem
                      action
                      active={category.id === openCategory}
                      tag="button"
                      className="justify-content-between"
                      onClick={() => this.setState({openCategory: category.id})}
                    >
                      {category.name}
                      <Badge color="success">
                        {productsInCategory.length}
                      </Badge>
                    </ListGroupItem>
                    {productsInCategory.length > 0 &&
                      <Collapse isOpen={openCategory === category.id}>
                        {this.renderTable(productsInCategory)}
                      </Collapse>
                    }
                  </div>
                );
              })}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default Products;
