import React from 'react';
import Home from 'components/container/home';
import Header from 'components/container/header';
import Admin from 'components/container/admin';
import { BrowserRouter as Router, Route } from 'react-router-dom';

const Settings = () => <h2>Settings</h2>;
const Purchase = () => <h2>Purchase</h2>;

const AppRouter = () => (
  <Router>
    <div className="bc-viewport">
      <Header />
      <Route path="/" exact component={Home} />
      <Route path="/settings/" component={Settings} />
      <Route path="/purchase/" component={Purchase} />
      <Route path="/admin/" component={Admin} />
    </div>
  </Router>
);

export default AppRouter;
