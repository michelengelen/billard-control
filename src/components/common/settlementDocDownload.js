import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { ClubDataContext } from 'contexts/clubDataContext';

import { SettlementDoc } from './settlementDoc';

export const SettlementDocDownload = props => {
  const {
    title,
    summary,
    text: {
      isLoading,
      isFinished,
    },
    color = 'primary',
  } = props;

  console.log('##### summary: ', summary);

  return (
    <ClubDataContext.Consumer>
      {ctxt => (
        <ReactPDF.PDFDownloadLink
          className={`btn btn-sm btn-${color}`}
          document={<SettlementDoc clubData={ctxt} summary={summary}/>}
          fileName={`${title}.pdf`}
        >
          {({ blob, url, loading }) => (loading ? isLoading : isFinished)}
        </ReactPDF.PDFDownloadLink>
      )}
    </ClubDataContext.Consumer>
  );
};
