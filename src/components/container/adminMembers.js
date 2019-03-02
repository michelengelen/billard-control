import React, { Component } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { membersRef, purchasesRef, tarifsRef } from 'firebase-config/config';
import { sortByProperty } from 'helpers/helpers';

import MembersList from 'components/container/adminMembersList';
import MemberEdit from 'components/container/adminMemberEdit';

import { ActivityIndicator } from 'components/common';
import isEqual from 'lodash.isequal';

class Members extends Component {
  constructor(props) {
    super(props);

    this.editMember = this.editMember.bind(this);
    this.deleteDoc = this.deleteDoc.bind(this);
    this.validateAndSave = this.validateAndSave.bind(this);
    this.openCategory = this.openCategory.bind(this);
    this.setErrors = this.setErrors.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);

    this.listeners = {};

    this.state = {
      newMembernumber: 100000,
      tarifs: null,
      members: null,
      editId: '',
      openCategory: '',
      editMember: {},
      errors: [],
      showEditForm: false,
      loading: true,
    };
  }

  componentDidMount() {
    const { newMembernumber } = this.state;
    this.listeners.membersRef = membersRef.onSnapshot(querySnapshot => {
      const members = [];
      let membernumber = newMembernumber;
      querySnapshot.forEach(doc => {
        const memberData = doc.data();
        if (membernumber <= memberData.membernumber) {
          membernumber = memberData.membernumber + 1;
        }
        members.push({ id: doc.id, ...memberData });
      });
      this.setState({
        newMembernumber: membernumber,
        members: sortByProperty(members, 'lastname'),
      });
    });
    this.listeners.tarifsRef = tarifsRef.onSnapshot(querySnapshot => {
      const tarifs = {};
      querySnapshot.forEach(doc => {
        tarifs[doc.id] = { ...doc.data() };
      });
      this.setState({
        tarifs: tarifs,
      });
    });
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    const { state } = this;
    if (
      !isEqual(prevState, state) &&
      prevState.loading &&
      Array.isArray(state.members) &&
      typeof state.tarifs === 'object'
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

  editMember(id = '') {
    let member = {};
    if (id) {
      member = cloneDeep(this.state.members.find(member => member.id === id));

      delete member.id;
    }

    if (!member.membernumber) {
      member.membernumber = this.state.newMembernumber;
      member.active = true;
      member.isGuest = false;
    }

    this.setState({
      editMember: {
        ...member,
      },
      editId: id,
      showEditForm: true,
    });
  }

  deleteDoc(id) {
    membersRef
      .doc(id)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
      })
      .catch(function(error) {
        console.error('Error removing document: ', error);
      });
  }

  cancelEdit() {
    this.setState({
      editMember: {},
      editId: '',
      showEditForm: false,
    });
  }

  setErrors(errors) {
    this.setState({ errors });
  }

  handleOnChange(e, fieldKey, value) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    let newValue = 0;
    if (e && e.currentTarget) {
      newValue = e.currentTarget.value;
    } else {
      newValue = value;
    }

    if (e && e.currentTarget && e.currentTarget.type === 'date') {
      newValue = {
        timestamp: new Date(value),
        dateString: value,
      };
    }

    if (fieldKey.indexOf('.') > 0) {
      const splitFieldKey = fieldKey.split('.');
      this.setState(prevState => ({
        editMember: {
          ...prevState.editMember,
          [splitFieldKey[0]]: {
            ...prevState.editMember[splitFieldKey[0]],
            [splitFieldKey[1]]: newValue,
          },
        },
      }));
      return;
    }

    this.setState(prevState => ({
      editMember: {
        ...prevState.editMember,
        [fieldKey]: newValue,
        lastChange: new Date(),
      },
    }));
  }

  validateAndSave() {
    const { editMember, editId, tarifs } = this.state;
    if (editId) {
      membersRef
        .doc(editId)
        .set(editMember)
        .then(this.cancelEdit);
    } else {
      const tarif = tarifs[editMember.tarifId];
      const entryFeePurchase = {
        name: `Aufnahmegebühr (${tarif.name})`,
        date: new Date(),
        price: tarif.entryFee,
        public: false,
        amount: 1,
      };
      membersRef.add(editMember).then(memberDoc => {
        purchasesRef.add({ userId: memberDoc.id }).then(journalDoc => {
          purchasesRef
            .doc(journalDoc.id)
            .collection('journal')
            .add(entryFeePurchase)
            .then(() => {
              membersRef
                .doc(memberDoc.id)
                .set(
                  {
                    journalRef: purchasesRef.doc(journalDoc.id),
                    tarifRef: tarifsRef.doc(editMember.tarifId),
                  },
                  { merge: true },
                )
                .then(() => console.log('### journalRef added to member document'));
            });
        });
        this.cancelEdit();
      });
    }
  }

  openCategory(id) {
    this.setState(prevState => ({
      openCategory: prevState.openCategory === id ? '' : id,
    }));
  }

  render() {
    const { editId, editMember, errors, members, showEditForm, tarifs } = this.state;

    return (
      <div className="bc-content__wrapper">
        <ActivityIndicator loading={this.state.loading} />
        {showEditForm ? (
          <MemberEdit
            member={editMember}
            editId={editId}
            errors={errors}
            tarifs={tarifs}
            handleSave={this.validateAndSave}
            handleOnChange={this.handleOnChange}
            clearErrors={() => this.setErrors([])}
            cancelEdit={() => this.cancelEdit()}
          />
        ) : (
          <MembersList
            members={members}
            tarifs={tarifs}
            editMember={this.editMember}
            deleteMember={this.deleteDoc}
          />
        )}
      </div>
    );
  }
}

export default Members;
