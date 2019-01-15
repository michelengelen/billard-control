import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {clubDataRef } from 'firebase-config';

export const MyDoc = ({ data }) => (
  <Document>
    <Page>
      <View>
        <Text>{data}</Text>
      </View>
    </Page>
  </Document>
);
