import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { ClubDataContext } from 'contexts/clubDataContext';

import { SettlementDoc } from './settlementDoc';

export const SettlementDocDownload = props => {
  const {
    title,
    summary,
    text: {
      isLoading = 'Lädt ...',
      isFinished = 'Download',
    },
    color = 'primary',
  } = props;

  console.log('##### summary: ', summary);

  return (
    <ClubDataContext.Consumer>
      {ctxt => {
        return (
          <ReactPDF.PDFViewer>
            <SettlementDoc clubData={ctxt} summary={summary}/>
          </ReactPDF.PDFViewer>
        )
      }}
    </ClubDataContext.Consumer>
  )

  // return (
  //   <ClubDataContext.Consumer>
  //     {ctxt => {
  //       return (
  //         <ReactPDF.PDFDowloadLink
  //           className={`btn btn-sm btn-${color}`}
  //           document={<SettlementDoc clubData={ctxt} summary={summary}/>}
  //           fileName={`${title}.pdf`}
  //         >
  //           {({ blob, url, loading }) => (loading ? isLoading : isFinished)}
  //         </ReactPDF.PDFDowloadLink>
  //       );
  //     }}
  //   </ClubDataContext.Consumer>
  // );
}
