import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { ClubDataContext } from 'contexts/clubDataContext';

import { SettlementDoc } from './settlementDoc';

export const SettlementDocDownload = props => {
  const {
    title,
    summary,
    buttonText,
    color = 'primary',
  } = props;

  return (
    <ClubDataContext.Consumer>
      {ctxt => (
        <ReactPDF.PDFDownloadLink
          className={`btn btn-sm btn-${color}`}
          document={<SettlementDoc clubData={ctxt} summary={summary}/>}
          fileName={`${title}.pdf`}
        >
          {({ blob, url, loading }) => (loading ? '...' : buttonText)}
        </ReactPDF.PDFDownloadLink>
      )}
    </ClubDataContext.Consumer>
  );
};
