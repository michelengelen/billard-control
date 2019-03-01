import React, { Component } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  CardFooter,
  Col,
  Collapse,
  Form,
  FormGroup,
  Label,
  Input,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
  Table,
} from 'reactstrap';

import { ActivityIndicator, Icon } from 'components/common';
// import { SettlementDocDownload } from 'components/common/settlementDocDownload';
import { ClubDataContext } from 'contexts/clubDataContext';
import { Icons } from '../../variables/constants';
import { categoriesRef, tarifsRef } from '../../firebase-config/config';
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
    this.renderSettlementByMember = this.renderSettlementByMember.bind(this);
    this.getPurchasesByKey = this.getPurchasesByKey.bind(this);
    this.getSettlementPositions = this.getSettlementPositions.bind(this);

    this._years = [];
    this.currentYear = 2018;
    this.currentMonth = 0;

    // since first settlement in a year is from 15.12. until 14.01.
    // we need to substract 1 if the bigBang is in last years december
    let i = now.getFullYear() - bigBang.getFullYear() - (bigBang.getMonth() === 11 ? 1 : 0);

    for (i; i >= 0; i--) {
      this._years.push(now.getFullYear() - i);
    }

    this.state = {
      loading: true,
      settlements: {},
      openedSettlement: '',
      categories: [],
    };
  }

  componentDidMount() {
    let response = {};
    categoriesRef.onSnapshot(querySnapshot => {
      response.categories = [];
      querySnapshot.forEach(doc => {
        response.categories.push({ id: doc.id, ...doc.data() });
      });
      tarifsRef.onSnapshot(querySnapshot => {
        response.tarifs = [];
        querySnapshot.forEach(doc => {
          response.tarifs.push({ id: doc.id, ...doc.data() });
        });
        this.setState({
          loading: false,
          categories: sortByProperty(response.categories, 'name'),
          tarifs: sortByProperty(response.tarifs, 'name'),
        });
      });
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
    console.log('#### context: ', this.context);
    const { settlements, openedSettlement } = this.state;
    const settlementKey = `${this.currentYear}-${this.currentMonth}`;
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
              <ActivityIndicator loading={!settlements[settlementKey]} type="inline" />
              {settlements[settlementKey] &&
                members.map(member => this.renderSettlementByMember(member))}
            </Row>
          </Collapse>
        )}
      </ListGroupItem>
    );
  }

  renderSettlementByMember(member) {
    const { openedSettlement, settlements } = this.state;
    const { year, month } = getYearMonthFromKey(openedSettlement);
    const memberPurchases = settlements[openedSettlement][member.id];
    const { beverages, snacks, misc } = this.getSettlementPositions(
      memberPurchases,
      member.tarifId,
    );
    return (
      <Col xs={12} key={`settlement_${openedSettlement}_member_${member.id}`}>
        <Row form>
          <Col xs={4}>{`${member.lastname}, ${member.firstname}`}</Col>
          <Col xs={2}>
            <FormGroup>
              <Label for="name">Bezeichnung</Label>
              <Input
                type="text"
                name="name"
                id="name"
                value={memberPurchases.tableRent ? memberPurchases.tableRent.hours : ''}
                onChange={e => this.addTableRent(e, member.id, 'hours')}
                placeholder="0"
              />
            </FormGroup>
          </Col>
          <Col xs={2}>
            <FormGroup>
              <Label for="fracture">Minuten</Label>
              <Input
                type="select"
                value={memberPurchases.tableRent ? memberPurchases.tableRent.fracture : ''}
                name="select"
                id="fracture"
                onChange={e => this.addTableRent(e, member.id, 'fracture')}
              >
                <option value={0}>0 Minuten</option>
                <option value={0.25}>15 Minuten</option>
                <option value={0.5}>30 Minuten</option>
                <option value={0.75}>45 Minuten</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
      </Col>
    );
  }

  addTableRent(event, memberId, key) {
    const { openedSettlement } = this.state;
    console.log('##### event: ', event);
    console.log('##### memberId: ', memberId);
    console.log('##### key: ', key);
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    let value;

    if (event && event.currentTarget && event.currentTarget.type === 'text') {
      if (!/^[0-9]+$/.test(event.currentTarget.value)) return;
    }

    value = event.currentTarget.value;

    console.log('##### new Value: ', value);

    this.setState(prevState => {
      console.log('#### prevState: ', prevState);
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
    const startMonth = month === 0 ? 11 : month;
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
            console.log('#### snapshot: ', snapShot);
            snapShot.forEach(snap => response.purchases.push(snap.data()));
          }
          return response;
        });
    });

    return Promise.all(p);
  }

  getSettlementPositions({ purchases, tableRent }, tarifId) {
    console.log('### tarifId: ', tarifId);
    const { categories, tarifs } = this.state;
    const { hours, fracture } = tableRent;
    const memberTarif = tarifs.filter(tarif => tarif.id === tarifId)[0];
    console.log('##### tarif: ', memberTarif);
    const sums = {
      beverages: 0,
      snacks: 0,
      misc: 0,
      tableRents: (parseInt(hours) + parseFloat(fracture)) * memberTarif.tableFee,
      monthlyFee: memberTarif.monthlyFee,
    };

    console.log('##### sums: ', sums);
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
