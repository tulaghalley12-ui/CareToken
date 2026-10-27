import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const Alert = ({ type = 'info', message, children, className = '' }) => {
  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      <Icon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>{message || children}</div>
    </div>
  );
};

export default Alert;
