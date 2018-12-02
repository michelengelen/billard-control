import React from 'react';
import PropTypes from 'prop-types';

import { generateUniqueKey } from 'helpers/helpers';

export const Icon = props => {
  const styles = {
    wrapper: {
      width: `${props.size}px`,
      height: `${props.size}px`,
      padding: '10px',
    },
    svg: {
      display: 'inline-block',
      alignSelf: 'center',
    },
    path: {
      fill: props.color,
    },
  };

  const handleClick = (event, callback) => {
    event.preventDefault();
    if (callback) callback();
  };

  return (
    <div style={styles.wrapper} className={props.className || ''}>
      <svg
        style={styles.svg}
        width={`${props.size - 20}px`}
        height={`${props.size - 20}px`}
        viewBox="0 0 32 32"
        onClick={event => handleClick(event, props.onClick)}
      >
        {props.icon.map(
          icon => (
            <path
              key={generateUniqueKey()}
              style={styles.path}
              d={icon}
            />
          )
        )}
      </svg>
    </div>
  );
};

Icon.propTypes = {
  icon: PropTypes.arrayOf(
    PropTypes.string
  ).isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Icon.defaultProps = {
  size: 16,
};
