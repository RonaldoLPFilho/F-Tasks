import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
}

export function DatePicker({ selectedDate, onDateSelect }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex items-center border border-gray-300 px-4 py-2 rounded-md text-sm bg-white hover:bg-gray-50"
      >
        <CalendarDays className="w-4 h-4 mr-1 text-gray-600" />
        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Data"}
      </button>
      
      {showCalendar && (
        <div className="absolute right-0 mt-2 z-50 bg-white rounded-xl border shadow-xl p-4 w-[320px]">
          <DayPicker
            animate
            navLayout="around" 
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateSelect(date);
                setShowCalendar(false);
              }
            }}
            locale={ptBR}
            modifiersClassNames={{
              selected: "bg-purple-500 text-white font-semibold",
              today: "border border-purple-500",
            }}
            classNames={{
              months: "justify-center",
              month: "space-y-4",
              caption: "flex justify-between items-center mb-4 text-sm font-medium",
              nav: "flex items-center gap-2",
              nav_button: "text-gray-500 hover:text-purple-600 p-1",
              head: "grid grid-cols-7 gap-1 mb-2",
              head_cell: "text-xs text-gray-500 font-medium text-center p-2",
              row: "grid grid-cols-7 gap-1",
              cell: "text-sm",
              day: "w-9 h-9 rounded-md hover:bg-gray-100  transition-all cursor-pointer font-medium",
            }}
            styles={{
              day_selected: {
                backgroundColor: '#a855f7',
                color: 'white',
              },
              day_today: {
                border: '1px solid #a855f7',
              }
            }}
          />
        </div>
      )}
    </div>
  );
}