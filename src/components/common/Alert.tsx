import React from 'react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  let bgColor = 'bg-blue-100';
  let textColor = 'text-blue-800';
  let icon = '💡';

  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = '✅';
      break;
    case 'warning':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = '⚠️';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = '❌';
      break;
  }

  return (
    <div className={`p-4 ${bgColor} ${textColor} rounded-md flex items-start`}>
      <span className="mr-2">{icon}</span>
      <span>{message}</span>
    </div>
  );
};

export default Alert;