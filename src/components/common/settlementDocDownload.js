import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { ClubDataContext } from 'contexts/clubDataContext';

import { SettlementDoc } from './settlementDoc';
import { SingleSettlementDoc } from './singleSettlementDoc';

export const SettlementDocDownload = props => {
  const {
    members = null,
    singleSettlement = false,
    title,
    summary,
    buttonText,
    color = 'primary',
  } = props;

  const Doc = singleSettlement ? SingleSettlementDoc : SettlementDoc;

  return (
    <ClubDataContext.Consumer>
      {ctxt => (
        <ReactPDF.PDFDownloadLink
          className={`btn btn-sm btn-${color}`}
          document={<Doc clubData={ctxt} summary={summary} members={members} />}
          fileName={`${title}.pdf`}
        >
          {({ blob, url, loading }) => (loading ? '...' : buttonText)}
        </ReactPDF.PDFDownloadLink>
      )}
    </ClubDataContext.Consumer>
  );
};
