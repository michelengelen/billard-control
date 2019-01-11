import React, { PureComponent } from 'react';
import store from 'store';
import PropTypes from 'prop-types';

const getRemainingTime = time => {
  const t = new Date(time);
  const m = t.getMinutes();
  const s = t.getSeconds();
  const minutes = m < 10 ? `0${m}` : m;
  const seconds = s < 10 ? `0${s}` : s;
  return `${minutes}:${seconds}`;
};

class LogoutTimer extends PureComponent {
  constructor(props) {
    super(props);

    this.check = this.check.bind(this);
    this.reset = this.reset.bind(this);
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
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.startTimer && this.props.startTimer) {
      console.log('###### start Timer #######');
      this.setLastAction(Date.now());
      this.check();
      this.initInterval();
    }
  }

  componentWillUnmount() {
    this.removeListener();
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
      this.removeListener();
      clearInterval(this.intervalHandle);
      store.clearAll();
      this.props.callback();
    } else {
      this.setState({
        currentTime: getRemainingTime(diff),
      });
    }
  }

  initInterval() {
    this.intervalHandle = setInterval(this.check, this.props.interval);
  }

  render() {
    return <p>{this.state.currentTime}</p>;
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
