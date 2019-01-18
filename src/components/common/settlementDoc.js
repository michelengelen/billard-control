import React from 'react';
import { Document, Page, StyleSheet, Text, View, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  header: {
    borderBottom: 1,
    borderBottomColor: 'rgba(0, 0, 0, .5)',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderTop: 1,
    borderTopColor: 'rgba(0, 0, 0, .5)',
    headline: {
      color: '#999999',
      fontSize: 6,
    },
    text: {
      color: '#333333',
      fontSize: 9,
      marginBottom: 4,
    },
  },
  col4_4: {
    flex: 1,
    flexBasis: '100%',
  },
  col3_4: {
    flex: 1,
    flexBasis: '75%',
  },
  col2_4: {
    flex: 1,
    flexBasis: '50%',
  },
  col1_4: {
    flex: 1,
    flexBasis: '25%',
  },
  col2_3: {
    flex: 1,
    flexBasis: '66%',
  },
  col1_3: {
    flex: 1,
    flexBasis: '33%',
  },
  box: {
    padding: 8,
    width: '100%',
  },
  text: {
    margin: 12,
    fontSize: 14,
  },
});

Font.register('https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu72xKKTU1Kvnz.woff2', {
  family: 'Roboto',
});

export const SettlementDoc = props => {
  const { board, info } = props.clubData;
  return (
    <Document>
      <Page style={styles.page}>
        <View fixed style={{ ...styles.box, ...styles.header }}>
          <Text style={styles.text}>{info.name}</Text>
        </View>
        <View fixed style={{ ...styles.box, ...styles.footer }}>
          <View style={styles.col1_4}>
            <Text style={styles.footer.headline}>1. Vorsitzender</Text>
            <Text style={styles.footer.text}>
              {`${board.first.firstname} ${board.first.lastname}`}
            </Text>
            <Text style={styles.footer.headline}>2. Vorsitzender</Text>
            <Text style={styles.footer.text}>
              {`${board.second.firstname} ${board.second.lastname}`}
            </Text>
            <Text style={styles.footer.headline}>Kassenwart</Text>
            <Text style={styles.footer.text}>
              {`${board.accountant.firstname} ${board.accountant.lastname}`}
            </Text>
            <Text style={styles.footer.headline}>Sportwart</Text>
            <Text style={styles.footer.text}>
              {`${board.sport.firstname} ${board.sport.lastname}`}
            </Text>
            <Text style={styles.footer.headline}>Schriftwart</Text>
            <Text style={styles.footer.text}>
              {`${board.writer.firstname} ${board.writer.lastname}`}
            </Text>
          </View>
          <View style={styles.col1_4} />
          <View style={styles.col1_4} />
          <View style={styles.col1_4} />
        </View>
      </Page>
    </Document>
  );
};
