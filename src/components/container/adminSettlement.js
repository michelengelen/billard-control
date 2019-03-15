import React, { Component } from 'react';
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
    this.updatePurchases = this.updatePurchases.bind(this);
    this.getSettlementPositions = this.getSettlementPositions.bind(this);
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
                        <th className="text-center"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(member => (
                        <SettlementEntry
                          key={`settlement_${openedSettlement}_member_${member.id}`}
                          member={member}
                          categories={categories}
                          summary={settlements[openedSettlement][member.id]}
                          updatePurchases={this.updatePurchases}
                          addTableRent={this.addTableRent}
                        />
                      ))}
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
      return {
        settlements: {
          ...prevState.settlements,
          [openedSettlement]: {
            ...prevState.settlements[openedSettlement],
            [memberId]: {
              ...prevState.settlements[openedSettlement][memberId],
              tableRent: {
                ...prevState.settlements[openedSettlement][memberId].tableRent,
                [key]: value,
              },
            },
          },
        },
      };
    });
  }

  updatePurchases(memberId, newPurchase) {
    const { openedSettlement } = this.state;
    this.setState(prevState => ({
      ...prevState,
      settlements: {
        ...prevState.settlements,
        [openedSettlement]: {
          ...prevState.settlements[openedSettlement],
          [memberId]: newPurchase,
        },
      },
    }));
  }

  async openSettlement(key) {
    const { settlements } = this.state;

    if (!settlements[key]) {
      this.getPurchasesByKey(key).then(resp => {
        const response = {};
        resp.forEach(doc => {
          response[doc.memberId] = doc;
          response[doc.memberId].tableRent = {
            hours: 0,
            fracture: 0,
          };
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

  async getSettlementPositions({ purchases, tableRent }, member) {
    const { categories } = this.state;
    const { hours, fracture } = tableRent;

    let memberTarif = null;
    await member.tarifRef.get().then(doc => (memberTarif = doc.data()));

    const sums = {
      beverages: 0,
      snacks: 0,
      misc: 0,
      tableRents: (parseInt(hours) + parseFloat(fracture)) * memberTarif.tableFee,
      monthlyFee: memberTarif.monthlyFee,
    };

    const categoryTypes = {};
    categories.forEach(cat => (categoryTypes[cat.id] = cat.categoryType));

    purchases.forEach(purch => {
      const { categoryId } = purch;
      sums[categoryTypes[categoryId]] += purch.price * purch.amount;
    });

    return sums;
  }

  render() {
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
