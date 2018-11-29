import React from 'react';
import PropTypes from 'prop-types';

export const Loader = props => {
  const styles = {
    svg: {
      display: 'inline-block',
      verticalAlign: 'middle',
    },
  };

  return (
    <svg
      style={styles.svg}
      width={`${props.size}px`}
      height={`${props.size}px`}
      viewBox="0 0 105 105"
      xmlns="http://www.w3.org/2000/svg"
      fill={props.color}
    >
      <circle cx="12.5" cy="12.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="0s" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="12.5" cy="52.5" r="12.5" fill-opacity=".5">
        <animate
          attributeName="fill-opacity"
          begin="100ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="52.5" cy="12.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="300ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="52.5" cy="52.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="600ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="92.5" cy="12.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="800ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="92.5" cy="52.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="400ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="12.5" cy="92.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="700ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="52.5" cy="92.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="500ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="92.5" cy="92.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="200ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

Loader.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

Loader.defaultProps = {
  size: 16,
  color: 'rgba(255, 255, 255, 1)'
};
