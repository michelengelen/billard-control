import React, { Component } from 'react';
import Home from 'components/container/Home/home';
import Header from 'components/container/Header/header';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="bc-viewport">
        <Header />
        <Home />
      </div>
    );
  }
}

export default App;
