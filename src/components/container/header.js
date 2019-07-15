import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Col,
  Row
} from 'reactstrap';
import { Icon } from 'components/common/index';
import { Icons } from 'variables/constants/index';

class Header extends PureComponent {
  constructor(props) {
    super(props);

    this.goToRoute = this.goToRoute.bind(this);
  }

  goToRoute(pathname) {
    const { history } = this.props;
    if (pathname && typeof pathname === 'string') {
      history.push(pathname);
    }
  }

  render() {
    const { location } = this.props;
    if (!/purchase/g.test(location.pathname)) return null;
    return (
      <Row
        noGutters
        className="bc-header justify-content-between align-items-center"
      >
        <Col xs="auto">
          <h2>Billard Control</h2>
        </Col>
        <Col xs="auto">
          <Icon
            padding
            color="#333"
            size={52}
            icon={Icons.HOME}
            className="bc-header__button"
            onClick={() => this.goToRoute('/')}
          />
        </Col>
      </Row>
    );
  }
}

export default withRouter(Header);
