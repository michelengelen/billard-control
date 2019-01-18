import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

// import of custom components
import Home from 'components/container/home';
import Header from 'components/container/header';
import Purchase from 'components/container/purchase';
import { Admin } from 'components/container/admin';
import { NoMatch } from 'components/container/nomatch';
import { ActivityIndicator } from 'components/common';

import { clubDataRef, membersRef } from 'firebase-config/config';

import { UserContext } from 'contexts/userContext';
import { PurchaseContext } from 'contexts/purchaseContext';
import { ClubDataContext } from 'contexts/clubDataContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => (
        <UserContext.Consumer>
          {ctxt =>
            ctxt.user.isAuthenticated ? (
              <Component {...props} />
            ) : (
              <Redirect
                to={{
                  pathname: '/',
                  state: { from: props.location },
                }}
              />
            )
          }
        </UserContext.Consumer>
      )}
    />
  );
};

const Settings = () => <h2>Settings</h2>;

class AppRouter extends PureComponent {
  constructor(props) {
    super(props);

    this.signInUser = this.signInUser.bind(this);
    this.logoutUser = this.logoutUser.bind(this);
    this.setMember = this.setMember.bind(this);
    this.unsetMember = this.unsetMember.bind(this);
    this.setPurchaseJournal = this.setPurchaseJournal.bind(this);

    this.state = {
      userContext: {
        user: {
          name: '',
          email: '',
          isAuthenticated: false,
          hasAdminRights: false,
        },
        signInUser: this.signInUser,
        logoutUser: this.logoutUser,
      },
      purchaseContext: {
        membernumber: -1,
        memberId: '',
        journal: [],
        setMember: this.setMember,
        unsetMember: this.unsetMember,
        setPurchaseJournal: this.setPurchaseJournal,
      },
      clubData: {},
      loading: true,
    };
  }

  componentDidMount() {
    const response = {};
    membersRef.onSnapshot(querySnapshot => {
      response.members = [];
      querySnapshot.forEach(doc => {
        const memberDoc = doc.data();
        response.members.push({ id: doc.id, ...memberDoc });
        clubDataRef.get().then(snapShot =>
          clubDataRef.doc(snapShot.docs[0].id).onSnapshot(querySnapshot => {
            this.setState({
              clubData: {
                ...querySnapshot.data(),
                members: response.members,
              },
              loading: false,
            });
          }),
        );
      });
    });
  }

  async signInUser(userData) {
    await this.setState(prevState => ({
      userContext: {
        ...prevState.userContext,
        user: {
          name: userData.name,
          email: userData.email,
          isAuthenticated: userData.isAuthenticated,
          hasAdminRights: userData.hasAdminRights,
        },
      },
    }));
  }

  async logoutUser() {
    await this.setState(prevState => ({
      userContext: {
        ...prevState.userContext,
        user: {
          name: '',
          email: '',
          isAuthenticated: false,
          hasAdminRights: false,
        },
      },
    }));
  }

  setMember(number, memberId, memberData) {
    this.setState(prevState => ({
      purchaseContext: {
        ...prevState.purchaseContext,
        membernumber: number,
        memberId,
        memberData: {
          firstname: memberData.firstname || '',
          lastname: memberData.lastname || '',
          entryDate: memberData.entryDate,
        },
      },
    }));
  }

  unsetMember() {
    this.setState(prevState => ({
      purchaseContext: {
        ...prevState.purchaseContext,
        membernumber: -1,
        memberId: '',
        memberData: {},
      },
    }));
  }

  setPurchaseJournal(journal) {
    this.setState(prevState => ({
      purchaseContext: {
        ...prevState.purchaseContext,
        journal: [...journal],
      },
    }));
  }

  render() {
    return (
      <UserContext.Provider value={this.state.userContext}>
        <PurchaseContext.Provider value={this.state.purchaseContext}>
          <ClubDataContext.Provider value={this.state.clubData}>
            <ActivityIndicator loading={this.state.loading} />
            <Router>
              <div className="bc-viewport">
                <Switch>
                  <Route path="/" exact component={Home} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/purchase" component={Purchase} />
                  <PrivateRoute path="/admin" component={Admin} />
                  <Route component={NoMatch} />
                </Switch>
              </div>
            </Router>
          </ClubDataContext.Provider>
        </PurchaseContext.Provider>
      </UserContext.Provider>
    );
  }
}

export default AppRouter;
