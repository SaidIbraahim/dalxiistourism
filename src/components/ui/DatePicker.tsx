import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        console.log('Clicking outside, closing date picker');
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('DatePicker state changed:', { isOpen, value, selectedDate });
  }, [isOpen, value, selectedDate]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange('');
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelectedDay = isSelected(date);
      const isTodayDay = isToday(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          className={`
            h-8 w-8 flex items-center justify-center text-xs font-medium rounded transition-all duration-200
            ${isSelectedDay 
              ? 'bg-blue-500 text-white shadow-md' 
              : isTodayDay 
                ? 'bg-blue-100 text-blue-600 font-bold border border-blue-300' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }
            ${!isCurrentMonth(date) ? 'text-gray-400 hover:text-gray-500' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Calculate optimal position for the date picker
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  
  useEffect(() => {
    if (isOpen && datePickerRef.current) {
      const rect = datePickerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If there's more space above and less space below, show above
      // Also consider if we're in a table context where bottom might overlap
      if (spaceAbove > spaceBelow && (spaceBelow < 300 || rect.top > 200)) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={datePickerRef}>
      {label && (
        <label className="text-sm font-semibold text-blue-800 whitespace-nowrap mb-1 block">
          {label}:
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Date picker clicked, current state:', isOpen);
            setIsOpen(!isOpen);
          }}
          className={`
            w-full h-10 px-3 py-2 bg-white border-2 border-blue-200 rounded-lg text-sm text-gray-700 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm flex items-center justify-between
            hover:border-blue-300 transition-colors cursor-pointer
            ${className}
          `}
        >
          <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {selectedDate && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {isOpen && (
          <div className={`
            absolute bg-white border border-blue-200 rounded-lg shadow-lg z-[9999] p-3 w-[280px]
            ${dropdownPosition === 'top' 
              ? 'bottom-full mb-1' 
              : 'top-full mt-1'
            }
          `}
          style={{
            left: '0',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {/* Compact Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-blue-50 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <h3 className="text-sm font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </h3>
              
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-blue-50 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Compact Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="h-6 flex items-center justify-center text-xs font-medium text-blue-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Compact Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {renderCalendar()}
            </div>

            {/* Compact Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className="flex-1 py-1.5 px-3 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-1.5 px-3 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePicker;
