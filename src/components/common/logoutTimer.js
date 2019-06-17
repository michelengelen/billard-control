import React, { Component } from 'react';
import store from 'store';
import PropTypes from 'prop-types';
import { Alert, Progress } from 'reactstrap';

const getRemainingTime = time => {
  const t = new Date(time);
  const m = t.getMinutes();
  const s = t.getSeconds();
  const minutes = m < 10 ? `0${m}` : m;
  const seconds = s < 10 ? `0${s}` : s;
  return `${minutes}:${seconds}`;
};

class LogoutTimer extends Component {
  constructor(props) {
    super(props);

    this.check = this.check.bind(this);
    this.reset = this.reset.bind(this);
    this.destroy = this.destroy.bind(this);
    this.getLastAction = this.getLastAction.bind(this);
    this.setLastAction = this.setLastAction.bind(this);
    this.initListener = this.initListener.bind(this);
    this.initInterval = this.initInterval.bind(this);
    this.removeListener = this.removeListener.bind(this);

    this.intervalHandle = '';
    this.state = {
      currentTime: '',
    };
  }

  componentDidMount() {
    this.initListener();
    this.reset();
  }

  componentWillUnmount() {
    clearInterval(this.intervalHandle);
    this.removeListener();
    store.clearAll();
  }

  getLastAction() {
    return store.get(this.props.storeKey);
  }

  setLastAction(lastAction) {
    store.set(this.props.storeKey, lastAction);
  }

  reset() {
    this.setLastAction(Date.now());
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.setState({
      currentTime: getRemainingTime(this.props.time),
    });
    this.initInterval();
  }

  initListener() {
    document.body.addEventListener('click', this.reset);
    document.body.addEventListener('keydown', this.reset);
    document.body.addEventListener('keyup', this.reset);
    document.body.addEventListener('keypress', this.reset);
  }

  removeListener() {
    document.body.removeEventListener('click', this.reset);
    document.body.removeEventListener('keydown', this.reset);
    document.body.removeEventListener('keyup', this.reset);
    document.body.removeEventListener('keypress', this.reset);
  }

  check() {
    const now = Date.now();
    const timeleft = this.getLastAction() + this.props.time;
    const diff = timeleft - now;
    const isTimeout = diff < 0;

    if (this.props.startTimer && isTimeout) {
      this.destroy();
    } else {
      this.setState({
        currentTime: getRemainingTime(diff),
      });
    }
  }

  destroy() {
    this.removeListener();
    clearInterval(this.intervalHandle);
    store.clearAll();
    this.props.callback();
  }

  initInterval() {
    this.intervalHandle = setInterval(this.check, this.props.interval);
  }

  render() {
    const t = this.getLastAction() + this.props.time - Date.now();
    const minutes = new Date(t).getMinutes();
    const secondsLeft = new Date(t).getSeconds() + (minutes * 60);
    const msecondsLeft = secondsLeft * 1000;
    const counterClass = secondsLeft < 10 ? 'danger' : 'dark';
    const progressClass = secondsLeft < 10 ? 'danger' : 'primary';
    const progress = parseInt(100 * (msecondsLeft / this.props.time));
    return (
      <Alert className="text-center" color={counterClass}>
        <h1 className={`text-${counterClass}`}>{this.state.currentTime}</h1>
        <Progress color={progressClass} value={progress} />
      </Alert>
    );
  }
}

LogoutTimer.propTypes = {
  startTimer: PropTypes.bool.isRequired,
  callback: PropTypes.func.isRequired,
  time: PropTypes.number,
  interval: PropTypes.number,
  storeKey: PropTypes.string,
};

LogoutTimer.defaultProps = {
  time: 60 * 1000,
  interval: 1000,
  storeKey: 'lastAction',
};

export { LogoutTimer };
