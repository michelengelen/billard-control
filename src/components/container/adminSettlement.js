import React, { Component, Fragment } from 'react';
import {
  Button,
  Card,
  CardHeader,
  Col,
  Collapse,
  FormGroup,
  Label,
  Input,
  ListGroup,
  ListGroupItem,
  Row,
  Table,
} from 'reactstrap';
import isEqual from 'lodash.isequal';

import { ActivityIndicator, Icon } from 'components/common';
import SettlementEntry from 'components/common/settlementEntry';
// import { SettlementDocDownload } from 'components/common/settlementDocDownload';
import { ClubDataContext } from 'contexts/clubDataContext';
import { Icons } from '../../variables/constants';
import { categoriesRef, settlementsRef, tarifsRef } from '../../firebase-config/config';
import { sortByProperty } from '../../helpers/helpers';
import { _ } from '../../helpers/utils';

const now = new Date();
const bigBang = new Date(1544828400000);

const monthNames = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

const getYearMonthFromKey = key => {
  const year = parseInt(key.split('-')[0], 0);
  const month = parseInt(key.split('-')[1], 0);
  return {
    year,
    month,
  };
};

class Settlement extends Component {
  constructor(props) {
    super(props);

    this.renderSettlementYear = this.renderSettlementYear.bind(this);
    this.renderSettlementMonth = this.renderSettlementMonth.bind(this);
    this.getPurchasesByKey = this.getPurchasesByKey.bind(this);
    this.updateCustoms = this.updateCustoms.bind(this);
    this.finishSettlement = this.finishSettlement.bind(this);
    this.finishSettlementEntry = this.finishSettlementEntry.bind(this);
    this.saveSettlement = this.saveSettlement.bind(this);
    this.addTableRent = this.addTableRent.bind(this);

    this._years = [];
    this.currentYear = 2018;
    this.currentMonth = 0;

    // since first settlement in a year is from 15.12. until 14.01.
    // we need to substract 1 if the bigBang is in last years december
    let i = now.getFullYear() - bigBang.getFullYear() - (bigBang.getMonth() === 11 ? 1 : 0);

    for (i; i >= 0; i--) {
      this._years.push(now.getFullYear() - i);
    }

    this.listeners = {};

    this.state = {
      loading: true,
      openedSettlement: '',
      categories: null,
      tarifs: null,
      settlements: null,
    };
  }

  componentDidMount() {
    this.listeners.categoriesRef = categoriesRef.onSnapshot(querySnapshot => {
      const categories = [];
      querySnapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      this.setState({
        categories: sortByProperty(categories, 'name'),
      });
    });
    this.listeners.tarifsRef = tarifsRef.onSnapshot(querySnapshot => {
      const tarifs = [];
      querySnapshot.forEach(doc => {
        tarifs.push({ id: doc.id, ...doc.data() });
      });
      this.setState({
        tarifs: sortByProperty(tarifs, 'name'),
      });
    });
    this.listeners.settlementsRef = settlementsRef.onSnapshot(querySnapshot => {
      const settlements = {};
      querySnapshot.forEach(doc => {
        settlements[doc.id] = doc.data();
      });
      console.warn('####### on settlement Snapshot call ########');
      this.setState({
        settlements,
      });
    });
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    const { state } = this;
    if (
      !isEqual(prevState, state) &&
      prevState.loading &&
      Array.isArray(state.categories) &&
      Array.isArray(state.tarifs) &&
      typeof state.settlements === 'object'
    ) {
      this.setState({ loading: false });
    }
  }

  componentWillUnmount() {
    const { listeners } = this;
    const listenerKeys = Object.keys(listeners);
    listenerKeys.forEach(key => {
      if (
        Object.prototype.hasOwnProperty.call(listeners, key) &&
        typeof listeners[key] === 'function'
      ) {
        listeners[key]();
      }
    });
  }

  renderSettlementYear(year) {
    this.currentYear = year;
    const monthsInYear = [];
    let m = now.getMonth() - (now.getDate() < 14 ? 1 : 0);
    for (let i = 0; i <= m; i++) {
      monthsInYear.push(i);
    }

    return (
      <Card key={`settlementYear_${year}`}>
        <CardHeader>
          <h5 className="m-0">{year}</h5>
        </CardHeader>
        <ListGroup flush>
          {monthsInYear.map(month => {
            this.currentMonth = month;
            return this.renderSettlementMonth();
          })}
        </ListGroup>
      </Card>
    );
  }

  renderSettlementMonth() {
    const { members } = this.context;
    const { settlements, openedSettlement, categories } = this.state;
    const settlementKey = `${this.currentYear}-${
      this.currentMonth < 10 ? `0${this.currentMonth}` : this.currentMonth
    }`;

    return (
      <ListGroupItem
        key={`settlement_${settlementKey}`}
        active={`${settlementKey}` === openedSettlement}
        className="p-0"
      >
        <Row className="p-3">
          <Col xs={9} className="align-top">
            {`${monthNames[this.currentMonth]}`}
          </Col>
          <Col xs={3} className="text-right">
            <div className="btn-group" role="group" aria-label="Basic example">
              <Button
                color="secondary"
                size="sm"
                onClick={() => this.openSettlement(settlementKey)}
              >
                <Icon
                  color="#EEEEEE"
                  size={16}
                  icon={openedSettlement === settlementKey ? Icons.CHEVRON.UP : Icons.CHEVRON.DOWN}
                />
              </Button>
            </div>
          </Col>
        </Row>
        {members.length > 0 && (
          <Collapse isOpen={openedSettlement === settlementKey} className="bg-light text-dark">
            <Row className="p-0">
              <Col xs={12}>
                <ActivityIndicator
                  loading={!!settlements && !settlements[settlementKey]}
                  type="inline"
                />
                {!!settlements && settlements[settlementKey] && (
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Mitglied</th>
                        <th className="text-center">Getränke</th>
                        <th className="text-center">Snacks</th>
                        <th className="text-center">Tischmiete</th>
                        <th className="text-center">Monatsbeitrag</th>
                        <th className="text-center">diverses</th>
                        <th className="text-right">{this.renderControls(settlements[settlementKey])}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(member => {
                        if (member.active && settlements[openedSettlement]) {
                          return (
                            <SettlementEntry
                              key={`settlement_${openedSettlement}_member_${member.id}`}
                              member={member}
                              categories={categories}
                              summary={settlements[openedSettlement][member.id]}
                              editable={!settlements[settlementKey][member.id].finished}
                              updateCustoms={this.updateCustoms}
                              addTableRent={this.addTableRent}
                              finishSettlementEntry={() => this.finishSettlementEntry(member.id)}
                              saveSettlement={() => this.saveSettlement(openedSettlement)}
                            />
                          )
                        }
                        return null;
                      })}
                    </tbody>
                  </Table>
                )}
              </Col>
            </Row>
          </Collapse>
        )}
      </ListGroupItem>
    );
  }

  renderControls(settlement) {
    const { finished } = settlement;
    const isLockable = this.isLockable(settlement);
    console.log('isLockable?: ', isLockable);
    return (
      <Fragment>
        <Button
          color="success"
          size="sm"
          disabled={!!finished || !isLockable}
          onClick={this.finishSettlement}
        >
          <Icon className="d-inline" color="#EEEEEE" size={16} icon={finished ? Icons.LOCKED : Icons.UNLOCKED} /> Abschließen
        </Button>
        <Button
          color="success"
          size="sm"
          disabled={!finished}
          onClick={() => console.log('#### generate months settlement PDF ####')}
        >
          <Icon className="d-inline" color="#EEEEEE" size={16} icon={Icons.FILE_TEXT} /> PDF generieren
        </Button>
      </Fragment>
    );
  }

  isLockable(settlement) {
    let isLockable = true;
    Object.keys(settlement).forEach(memberId => {
      if (isLockable && typeof settlement[memberId] === 'object' && Object.prototype.hasOwnProperty.call(settlement, memberId)) {
        isLockable = !!settlement[memberId].finished;
      }
    });
    return isLockable;
  }

  addTableRent(event, memberId, key) {
    const { openedSettlement } = this.state;
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    let value;

    if (
      event &&
      event.currentTarget &&
      event.currentTarget.type === 'text' &&
      event.currentTarget.value
    ) {
      if (!/^[0-9]+$/.test(event.currentTarget.value)) return;
    }

    value = !event.currentTarget.value ? '0' : event.currentTarget.value;

    this.setState(prevState => {
      const newState = _.cloneDeep(prevState);
      _.set(
        newState,
        `settlements[${openedSettlement}][${memberId}].tableRent[${key}]`,
        value,
      );

      return newState;
    });
  }

  updateCustoms(memberId, newCustoms) {
    if (!Array.isArray(newCustoms)) return;

    const { openedSettlement } = this.state;

    this.setState(prevState => {
      const newState = _.cloneDeep(prevState);

      _.set(
        newState,
        `settlements[${openedSettlement}][${memberId}].customs`,
        newCustoms,
      );

      return newState;
    });
  }

  finishSettlement() {
    const { settlements, openedSettlement } = this.state;
    if (settlements[openedSettlement].finished) return;

    this.setState(prevState => {
      const newState = _.cloneDeep(prevState);
      newState.settlements[openedSettlement].finished = true;
      return newState;
    }, () => this.saveSettlement(openedSettlement));
  }

  finishSettlementEntry(memberId) {
    const { settlements, openedSettlement } = this.state;
    if (settlements[openedSettlement][memberId].finished) return;
    this.setState(prevState => {
      const newState = _.cloneDeep(prevState);
      newState.settlements[openedSettlement][memberId].finished = true;
      return newState;
    }, () => this.saveSettlement(openedSettlement));
  }

  saveSettlement(openedSettlement) {
    return settlementsRef
      .doc(openedSettlement)
      .set(this.state.settlements[openedSettlement])
      .then(() => {
        console.log(`### Settlement ${openedSettlement} succesfully saved`);
      });
  }

  async openSettlement(key) {
    const { settlements } = this.state;

    if (!settlements[key]) {
      this.getPurchasesByKey(key).then(resp => {
        const response = {};
        resp.forEach(doc => {
          response[doc.memberId] = _.cloneDeep(doc);
          _.set(
            response[doc.memberId],
            'tableRent',
            doc.tableRent || { hours: 0, fracture: 0 },
          );
          _.set(
            response[doc.memberId],
            'customs',
            doc.customs || [],
          );
        });
        this.setState(prevState => ({
          openedSettlement: key,
          settlements: {
            ...prevState.settlements,
            [key]: response,
          },
        }));
      });
    } else {
      this.setState({
        openedSettlement: key,
      });
    }
  }

  async getPurchasesByKey(key) {
    const { members } = this.context;

    const { year, month } = getYearMonthFromKey(key);

    const startYear = year - (month === 0 ? 1 : 0);
    const startMonth = month === 0 ? 11 : month - 1;
    const startTime = new Date(startYear, startMonth, 15, 0, 0, 0, 0);

    const endYear = year + (month === 11 ? 1 : 0);
    const endMonth = month === 11 ? 0 : month;
    const endTime = new Date(endYear, endMonth, 14, 23, 59, 59, 999);

    const p = members.map(({ id, journalRef }) => {
      return journalRef
        .collection('journal')
        .orderBy('date')
        .startAt(startTime)
        .endAt(endTime)
        .get()
        .then(snapShot => {
          const response = {
            memberId: id,
            purchases: [],
          };
          if (!snapShot.empty) {
            snapShot.forEach(snap => response.purchases.push(snap.data()));
          }
          return response;
        });
    });

    return Promise.all(p);
  }

  render() {
    console.log('#### settlements: ', this.state);
    return (
      <Row className="bc-content mr-0 pt-3">
        <ActivityIndicator loading={this.state.loading} />
        <Col xs={12}>{this._years.map(year => this.renderSettlementYear(year))}</Col>
      </Row>
    );
  }
}

export default Settlement;
Settlement.contextType = ClubDataContext;
