import React from 'react';
import { Document, Page, StyleSheet, Text, View, Font } from '@react-pdf/renderer';

import { positionList } from 'variables/constants';

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
  col6_6: {
    flex: 1,
    flexBasis: '100%',
  },
  col5_6: {
    flex: 1,
    flexBasis: `${(5 / 6).toFixed(4)}%`,
  },
  col4_6: {
    flex: 1,
    flexBasis: `${(4 / 6).toFixed(4)}%`,
  },
  col3_6: {
    flex: 1,
    flexBasis: `${(3 / 6).toFixed(4)}%`,
  },
  col2_6: {
    flex: 1,
    flexBasis: `${(2 / 6).toFixed(4)}%`,
  },
  col1_6: {
    flex: 1,
    flexBasis: `${(1 / 6).toFixed(4)}%`,
  },
  col5_5: {
    flex: 1,
    flexBasis: '100%',
  },
  col4_5: {
    flex: 1,
    flexBasis: '80%',
  },
  col3_5: {
    flex: 1,
    flexBasis: '60%',
  },
  col2_5: {
    flex: 1,
    flexBasis: '40%',
  },
  col1_5: {
    flex: 1,
    flexBasis: '20%',
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
  const boardSize = Object.keys(board).length;
  const colSize = `col1_${boardSize}`;
  return (
    <Document>
      <Page style={styles.page}>
        <View fixed style={{ ...styles.box, ...styles.header }}>
          <Text style={styles.text}>{info.name}</Text>
        </View>
        <View fixed style={{ ...styles.box, ...styles.footer }}>
          {positionList.map(position => {
            if (board[position.key] && board[position.key].firstname) {
              return (
                <View style={styles[colSize]}>
                  <Text style={styles.footer.headline}>{position.title}</Text>
                  <Text style={styles.footer.text}>
                    {`${board[position.key].firstname} ${board[position.key].lastname}`}
                  </Text>
                  {board[position.key].telephone && (
                    <Text style={styles.footer.text}>{board[position.key].telephone}</Text>
                  )}
                  {board[position.key].adress && (
                    <Text style={styles.footer.text}>
                      {`${board[position.key].adress.street} ${board[position.key].adress.number}`}
                    </Text>
                  )}
                  {board[position.key].adress && (
                    <Text style={styles.footer.text}>
                      {`${board[position.key].adress.zip} ${board[position.key].adress.city}`}
                    </Text>
                  )}
                </View>
              );
            }
            return null;
          })}
        </View>
      </Page>
    </Document>
  );
};
