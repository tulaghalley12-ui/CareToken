import React from 'react';

const Badge = ({ status, className = '' }) => {
  const formatStatus = (s) => {
    if (!s) return 'UNKNOWN';
    return s.replace(/_/g, ' ');
  };

  return (
    <span className={`badge badge-${status} ${className}`}>
      {formatStatus(status)}
    </span>
  );
};

export default Badge;
