import React, { PureComponent } from 'react';
import { Button, Nav, NavItem, NavLink } from 'reactstrap';
import { withRouter } from 'react-router-dom';

import { LogoutTimer } from 'components/common';

import { UserContext } from 'contexts/userContext';
import { authRef } from '../../firebase-config/config';

class Navigation extends PureComponent {
  constructor(props) {
    super(props);

    this.logoutUser = this.logoutUser.bind(this);
  }

  logoutUser(callback) {
    return () => {
      const { history } = this.props;
      authRef
        .signOut()
        .then(() => {
          callback().then(() => history.push('/'));
        })
        .catch(function(error) {
          console.warn(error.message);
        });
    };
  }

  render() {
    const { history, location } = this.props;
    return (
      <Nav vertical className="bc-nav">
        <UserContext.Consumer>
          {ctxt => (
            <div>
              <h3>
                Logged in as <strong>{ctxt.user.name}</strong>
              </h3>
              <div className="p-3">
                <LogoutTimer
                  callback={this.logoutUser(ctxt.logoutUser)}
                  startTimer={!!ctxt.user && ctxt.user.isAuthenticated}
                  interval={250}
                  storeKey={'lastAdminAction'}
                  time={300000}
                />
                <Button
                  type="button"
                  className="btn-danger btn-block"
                  onClick={this.logoutUser(ctxt.logoutUser)}
                >
                  Abmelden
                </Button>
              </div>
            </div>
          )}
        </UserContext.Consumer>
        <NavItem active={location.pathname === '/admin'}>
          <NavLink onClick={() => history.push('/admin')}>Admin-Dashboard</NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/members'}>
          <NavLink onClick={() => history.push('/admin/members')}>Mitglieder</NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/tarifs'}>
          <NavLink onClick={() => history.push('/admin/tarifs')}>Tarife</NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/consumables'}>
          <NavLink onClick={() => history.push('/admin/consumables')}>Produkte</NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/settlement'}>
          <NavLink onClick={() => history.push('/admin/settlement')}>Abrechnung</NavLink>
        </NavItem>
        <NavItem active={location.pathname === '/admin/clubdata'}>
          <NavLink onClick={() => history.push('/admin/clubdata')}>Vereinsdaten</NavLink>
        </NavItem>
      </Nav>
    );
  }
}

export default withRouter(Navigation);
