import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

// import of custom components
import Header from 'components/container/header';
import Home from 'components/container/home';
import Purchase from 'components/container/purchase';
import Admin from 'components/container/admin';
import { NoMatch } from 'components/container/nomatch';
import { ActivityIndicator } from 'components/common';

import {
  authRef,
  clubDataRef,
  membersRef,
} from 'firebase-config/config';

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
      clubDataContext: {},
      loading: true,
    };
  }

  componentDidMount() {
    this.logoutUser().then(() => {});

    authRef.onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        const refinedUserData = {
          name: user.displayName || 'Admin',
          email: user.email,
          isAuthenticated: true,
          hasAdminRights: user.isAdmin || true,
        };
        this.signInUser(refinedUserData).then(() => {});
      } else {
        this.logoutUser().then(() => {});
      }
    });

    membersRef.onSnapshot(async querySnapshot => {
      const members = [];
      if (querySnapshot.size > 0) {
        await querySnapshot
          .forEach(doc => {
            const memberDoc = doc.data();
            members.push({ id: doc.id, ...memberDoc });
          });
      }

      this.setState(prevState => ({
        clubDataContext: {
          ...prevState.clubDataContext,
          members,
        },
      }));
    });

    clubDataRef.onSnapshot(querySnapshot => {
      this.setState(prevState => ({
        clubDataContext: {
          ...prevState.clubDataContext,
          board: {
            ...querySnapshot.data(),
          },
        },
      }));
    });
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    const { clubDataContext } = this.state;
    if (prevState.loading && !!clubDataContext.members && !!clubDataContext.board) {
      this.setState({ loading: false });
    }
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
          journalRef: memberData.journalRef
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
          <ClubDataContext.Provider value={this.state.clubDataContext}>
            <ActivityIndicator loading={this.state.loading} />
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
          </ClubDataContext.Provider>
        </PurchaseContext.Provider>
      </UserContext.Provider>
    );
  }
}

export default AppRouter;
