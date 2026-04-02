import { useState } from 'react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-card-bg rounded-xl shadow-md border border-border-color p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="bg-bg-secondary hover:bg-bg-tertiary text-text-primary px-3 py-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 className="text-text-primary text-lg sm:text-xl font-semibold">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="bg-bg-secondary hover:bg-bg-tertiary text-text-primary px-3 py-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-text-secondary text-xs sm:text-sm font-semibold py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center rounded-lg text-sm sm:text-base
              ${day === null 
                ? 'bg-transparent' 
                : isToday(day)
                ? 'bg-primary text-white font-semibold'
                : 'bg-bg-secondary hover:bg-bg-tertiary text-text-primary cursor-pointer transition-colors'
              }
            `}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;


