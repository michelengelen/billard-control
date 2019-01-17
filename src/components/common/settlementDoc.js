import React, { PureComponent } from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  header: {
    padding: 8,
    width: '100%',
    borderBottom: 1,
    borderBottomColor: 'rgba(0, 0, 0, .5)',
  },
  box: {
    padding: 8,
    width: '100%',
  },
});

export default class SettlementDoc extends PureComponent {
  render() {
    return (
      <Document>
        <Page style={styles.page}>
          <View fixed style={styles.header}>
            <Text>{data}</Text>
          </View>
          <View fixed style={styles.box}>
            <Text>{data}</Text>
          </View>
        </Page>
      </Document>
    );
  }
}
