import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { ClubDataContext } from 'contexts/clubDataContext';

import { SettlementDoc } from './settlementDoc';

export const SettlementDocDownload = ({ title }) => (
  <div>
    <ClubDataContext.Consumer>
      {ctxt => {
        return (
          <ReactPDF.PDFDownloadLink
            className="btn btn-primary"
            document={<SettlementDoc clubData={ctxt} />}
            fileName={`${title}.pdf`}
          >
            {({ blob, url, loading }) => (loading ? 'Loading document...' : 'Download now!')}
          </ReactPDF.PDFDownloadLink>
        );
      }}
    </ClubDataContext.Consumer>
  </div>
);
