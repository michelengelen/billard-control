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
      <circle cx="12.5" cy="52.5" r="12.5" fillOpacity=".5">
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

export const MiniLoader = props => {
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
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      fill={props.color}
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <circle strokeOpacity=".5" cx="18" cy="18" r="18"/>
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite"/>
          </path>
        </g>
      </g>
    </svg>
  )
};

MiniLoader.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

MiniLoader.defaultProps = {
  size: 16,
  color: 'rgba(255, 255, 255, 1)'
};

export const ActivityIndicator = ({ loading, type }) => {
  if (type === 'inline') {
    return (
      <div className={`bc-loader${loading ? '' : ' hidden'} ${type}`}>
        <Loader color="rgba(33, 33, 33, 1)" size={40} />
      </div>
    );
  }

  return (
    <div className={`bc-loader${loading ? '' : ' hidden'}`}>
      <Loader color="rgba(255,255,255,1)" size={80} />
    </div>
  );
};
