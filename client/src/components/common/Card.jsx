import React from 'react';

const Card = ({ title, action, children, className = '', headerClassName = '' }) => {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className={`card-header ${headerClassName}`}>
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
