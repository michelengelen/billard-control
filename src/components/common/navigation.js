import React, { PureComponent } from 'react';
import { Button, Nav, NavItem, NavLink } from 'reactstrap';
import { withRouter } from 'react-router-dom';

import { UserContext } from 'contexts/userContext';
import { authRef } from '../../firebase-config/config';

class Navigation extends PureComponent {
  constructor(props) {
    super(props);

    this.logoutUser = this.logoutUser.bind(this);
  }

  logoutUser(callback) {
    const { history } = this.props;
    authRef.signOut().then(() => {
      callback().then(() => history.push('/'));
    }).catch(function(error) {
      console.warn(error.message);
    });
  }

  render() {
    const { history, location } = this.props;
    return (
      <Nav vertical>
        <UserContext.Consumer>
          {ctxt => (
              <div>
                <h3>Logged in as <strong>{ctxt.user.name}</strong></h3>
                <Button
                  color="link"
                  type="button"
                  onClick={() => this.logoutUser(ctxt.logoutUser)}
                >
                  Abmelden
                </Button>
              </div>
            )
          }
        </UserContext.Consumer>
        <NavItem active={location.pathname === '/admin'}>
          <NavLink onClick={() => history.push('/admin')}>
            Admin-Dashboard
          </NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/members'}>
          <NavLink onClick={() => history.push('/admin/members')}>
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
            Produkte
          </NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/settlement'}>
          <NavLink onClick={() => history.push('/admin/settlement')}>
            Abrechnung
          </NavLink>
        </NavItem>
      </Nav>
    );
  }
}

export default withRouter(Navigation);
