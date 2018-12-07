import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

// import of custom components
import Home from 'components/container/home';
import Header from 'components/container/header';
import { Admin } from 'components/container/admin';
import { NoMatch } from 'components/container/nomatch';

import { UserContext } from 'contexts/userContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={props => (
      <UserContext.Consumer>
        {user => (
          user.isAuthenticated
            ? <Component {...props} />
            : <Redirect to={{
              pathname: '/',
              state: { from: props.location }
            }} />
        )}
      </UserContext.Consumer>
    )} />
  )
};

const Settings = () => <h2>Settings</h2>;
const Purchase = () => <h2>Purchase</h2>;

class AppRouter extends PureComponent {
  constructor(props) {
    super(props);

    this.signInUser = this.signInUser.bind(this);

    this.state = {
      user: {
        name: '',
        email: '',
        isAuthenticated: false,
        hasAdminRights: false,
        signInUser: this.signInUser,
      }
    }
  }

  async signInUser(userData) {
    console.log('onmount?');
    await this.setState({
      user: {
        name: userData.name,
        email: userData.email,
        isAuthenticated: userData.isAuthenticated,
        hasAdminRights: userData.hasAdminRights,
      }
    })
  }

  render() {
    return (
      <UserContext.Provider value={this.state.user}>
        <Router>
          <div className="bc-viewport">
            <Header />
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/settings" component={Settings} />
              <Route path="/purchase" component={Purchase} />
              <PrivateRoute path="/admin" component={Admin} />
              <Route component={NoMatch} />
            </Switch>
          </div>
        </Router>
      </UserContext.Provider>
    );
  }
}

export default AppRouter;
