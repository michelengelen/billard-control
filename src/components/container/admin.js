import React, { PureComponent } from 'react';
import { Route, withRouter } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

// import of custom components
import Navigation from 'components/common/navigation';
import Dashboard from 'components/container/adminDashboard';
import Products from 'components/container/adminProducts';
import Members from 'components/container/adminMembers';
import Tarifs from 'components/container/adminTarifs';
import Settlement from 'components/container/adminSettlement';
import ClubData from 'components/container/adminClubData';

import { UserContext } from 'contexts/userContext';

class Admin extends PureComponent {
  componentWillUnmount() {
    const { logoutUser } = this.context;
    logoutUser();
  }

  render() {
    const { match } = this.props;
    return (
      <Row className="bc-content">
        <Col xs={3} className="pr-0">
          <Navigation />
        </Col>
        <Col xs={9}>
          <Route path={`${match.path}`} exact component={Dashboard} />
          <Route path={`${match.path}/consumables`} component={Products} />
          <Route path={`${match.path}/members`} component={Members} />
          <Route path={`${match.path}/tarifs`} component={Tarifs} />
          <Route path={`${match.path}/settlement`} component={Settlement} />
          <Route path={`${match.path}/clubdata`} component={ClubData} />
        </Col>
      </Row>
    );
  }
}

export default withRouter(Admin);
Admin.contextType = UserContext;
