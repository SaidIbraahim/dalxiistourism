import React from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';

interface ExportButtonProps {
  onClick: () => void;
  label: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false
}) => {
  const baseClasses = "flex items-center space-x-2 rounded-lg transition-colors font-medium";
  
  const variantClasses = {
    primary: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled || loading ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <FileSpreadsheet className="w-4 h-4" />
      )}
      <span>{loading ? 'Exporting...' : label}</span>
    </button>
  );
};

export default ExportButton;
