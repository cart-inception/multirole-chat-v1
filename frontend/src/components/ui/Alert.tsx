import { XCircle, AlertCircle, CheckCircle, Info } from 'lucide-react';

// Types for alert
export type AlertType = 'error' | 'warning' | 'success' | 'info';

// Props for the Alert component
interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const Alert = ({ type, message, onClose }: AlertProps) => {
  // Configuration for each alert type
  const alertConfig = {
    error: {
      icon: XCircle,
      background: 'bg-red-50',
      border: 'border-red-400',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
    },
    warning: {
      icon: AlertCircle,
      background: 'bg-yellow-50',
      border: 'border-yellow-400',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
    },
    success: {
      icon: CheckCircle,
      background: 'bg-green-50',
      border: 'border-green-400',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
    },
    info: {
      icon: Info,
      background: 'bg-blue-50',
      border: 'border-blue-400',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
    },
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-md p-4 border ${config.background} ${config.border}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
        </div>
        <div className={`ml-3 ${config.textColor}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.background} ${config.textColor}`}
              >
                <span className="sr-only">Dismiss</span>
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;