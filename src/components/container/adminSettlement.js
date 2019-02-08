import React, { Component } from 'react';

// import { ActivityIndicator } from 'components/common';
import { SettlementDocDownload } from 'components/common/settlementDocDownload';

class Settlement extends Component {
  render() {
    return (
      <div className="bc-content__wrapper">
        <SettlementDocDownload text={'###### TEST-DOC ######'} title={'TEST'}/>
      </div>
    );
  }
}

export default Settlement;
