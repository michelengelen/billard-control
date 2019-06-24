import React from 'react';
import { Document, Page, StyleSheet, Text, View, Font } from '@react-pdf/renderer';

import { positionList } from 'variables/constants';
import { getPriceString } from '../../helpers/helpers';

// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: '../../assets/fonts/Roboto-Thin.ttf', fontWeight: 100 },
//     { src: '../../assets/fonts/Roboto-ThinItalic.ttf', fontStyle: 'italic', fontWeight: 100 },
//     { src: '../../assets/fonts/Roboto-Light.ttf', fontWeight: 300 },
//     { src: '../../assets/fonts/Roboto-LightItalic.ttf', fontStyle: 'italic', fontWeight: 300 },
//     { src: '../../assets/fonts/Roboto-Regular.ttf', fontWeight: 400 },
//     { src: '../../assets/fonts/Roboto-Italic.ttf', fontStyle: 'italic', fontWeight: 400  },
//     { src: '../../assets/fonts/Roboto-Medium.ttf', fontWeight: 500 },
//     { src: '../../assets/fonts/Roboto-MediumItalic.ttf', fontStyle: 'italic', fontWeight: 500 },
//     { src: '../../assets/fonts/Roboto-Bold.ttf', fontWeight: 700 },
//     { src: '../../assets/fonts/Roboto-BoldItalic.ttf', fontStyle: 'italic', fontWeight: 700 },
//     { src: '../../assets/fonts/Roboto-Black.ttf', fontWeight: 900 },
//     { src: '../../assets/fonts/Roboto-BlackItalic.ttf', fontStyle: 'italic', fontWeight: 900  },
//   ],
// });

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

const tableStyles = StyleSheet.create({
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'none',
    borderColor: '#FFF',
    borderWidth: 0,
    margin: 0,
    marginTop: 12,
    marginBottom: 12,
  },
  tr: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    margin: 0,
    padding: 0,
    odd: {
      backgroundColor: '#DDD',
    },
    even: {
      backgroundColor: '#FFF',
    },
  },
  td: {
    padding: 6,
    margin: 0,
    textAlign: 'left',
  },
  tCenter: {
    textAlign: 'center',
  },
  tRight: {
    textAlign: 'right',
  },
});

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
      fontSize: 7,
      marginBottom: 2,
      fontFamily: 'Oswald',
      fontWeight: 700,
    },
    text: {
      color: '#333333',
      fontSize: 9,
      marginBottom: 1,
      fontWeight: 400,
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
    marginBottom: 2,
    fontSize: 11,
    fontWeight: 400,
  },
  tdText: {
    margin: 0,
    fontSize: 7,
    fontWeight: 700,
  },
  thText: {
    margin: 0,
    fontSize: 7,
    fontWeight: 700,
  },
});

export const SettlementDoc = props => {
  const {
    summary,
    clubData: {
      board,
      info,
    },
  } = props;
  const boardSize = Object.keys(board).length;
  const colSize = `col1_${boardSize}`;
  return (
    <Document>
      <Page style={styles.page}>
        <View fixed style={{ ...styles.box, ...styles.header }}>
          <Text style={styles.text}>{info.name}</Text>
        </View>
        <View style={tableStyles.table}>
          <View style={{ ...tableStyles.tr, borderBottom: 1, borderColor: '#DDD' }}>
            <View style={{ ...tableStyles.td, ...styles.col2_6 }}>
              <Text style={styles.thText}>
                Position
              </Text>
            </View>
            <View style={{ ...tableStyles.td, ...styles.col1_6 , ...tableStyles.tCenter }}>
              <Text style={styles.thText}>
                EAN
              </Text>
            </View>
            <View style={{ ...tableStyles.td, ...styles.col1_6 , ...tableStyles.tCenter }}>
              <Text style={styles.thText}>
                Preis
              </Text>
            </View>
            <View style={{ ...tableStyles.td, ...styles.col1_6 , ...tableStyles.tCenter }}>
              <Text style={styles.thText}>
                Menge
              </Text>
            </View>
            <View style={{ ...tableStyles.td, ...styles.col1_6 , ...tableStyles.tRight }}>
              <Text style={styles.thText}>
                Summe
              </Text>
            </View>
          </View>
          {Array.isArray(summary.purchases) && summary.purchases.map((p, index) => {
            const mod = index % 2 === 0 ? 'even' : 'odd';
            const rowStyle = { ...tableStyles.tr, ...tableStyles.tr[mod]};
            return (
              <View style={rowStyle}>
                <View style={{ ...tableStyles.td, ...styles.col2_6 }}>
                  <Text style={styles.tdText}>
                    {p.name}
                  </Text>
                </View>
                <View style={{ ...tableStyles.td, ...styles.col1_6, ...tableStyles.tCenter }}>
                  <Text style={styles.tdText}>
                    {p.ean}
                  </Text>
                </View>
                <View style={{ ...tableStyles.td, ...styles.col1_6, ...tableStyles.tCenter }}>
                  <Text style={styles.tdText}>
                    {getPriceString(p.price)}
                  </Text>
                </View>
                <View style={{ ...tableStyles.td, ...styles.col1_6, ...tableStyles.tCenter }}>
                  <Text style={styles.tdText}>
                    {p.amount}
                  </Text>
                </View>
                <View style={{ ...tableStyles.td, ...styles.col1_6, ...tableStyles.tRight }}>
                  <Text style={styles.thText}>
                    {getPriceString(p.price * p.amount)}
                  </Text>
                </View>
              </View>
            )}
          )}
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
