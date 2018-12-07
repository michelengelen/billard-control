import React, { PureComponent } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { withRouter } from 'react-router-dom';

class Navigation extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { history, location } = this.props;
    return (
      <Nav vertical>
        <NavItem active={location.pathname === '/admin'}>
          <NavLink onClick={() => history.push('/admin')}>
            Admin-Dashboard
          </NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/member'}>
          <NavLink onClick={() => history.push('/admin/member')}>
            Mitglieder
          </NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/tarifs'}>
          <NavLink onClick={() => history.push('/admin/tarifs')}>
            Tarife
          </NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/consumables'}>
          <NavLink onClick={() => history.push('/admin/consumables')}>
            Bier/Snacks
          </NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/tables'}>
          <NavLink onClick={() => history.push('/admin/tables')}>
            Tische
          </NavLink>
        </NavItem>
      </Nav>
    );
  }
}

export default withRouter(Navigation);
