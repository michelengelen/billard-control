import React from 'react';
import ReactPDF, { Document, Page, Text, View } from '@react-pdf/renderer';

const MyDoc = ({ data }) => (
  <Document>
    <Page>
      <View>
        <Text>{data}</Text>
      </View>
    </Page>
  </Document>
);

export const SettlementDocDownload = ({ title, text }) => (
  <div>
    <ReactPDF.PDFDownloadLink document={<MyDoc data={text} />} fileName={`${title}.pdf`}>
      {({ blob, url, loading }) => (
        <a
          className={`btn btn-primary ${!loading && 'btn-disabled'}`}
          href={!loading && url}
          target="_blank"
        >
          {loading ? 'Loading document...' : 'Download now!'}
        </a>
      )}
    </ReactPDF.PDFDownloadLink>
  </div>
);
