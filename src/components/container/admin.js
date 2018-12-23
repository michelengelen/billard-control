import React  from 'react';
import {
  Route,
  withRouter,
} from 'react-router-dom';
import {
  Col,
  Row
} from 'reactstrap';

// import of custom components
import Navigation from 'components/common/navigation';
import Dashboard from 'components/container/adminDashboard';
import Products from 'components/container/adminProducts';
import Members from 'components/container/adminMembers';

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
      </Col>
    </Row>
  );
});

export { Admin };
