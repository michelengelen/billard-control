import React from 'react';
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

const Admin = withRouter(props => {
  const { match } = props;
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
});

export { Admin };
