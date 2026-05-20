"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliverySchedulerProps {
  initialDate?: Date;
  timeSlots: string[];
  timeZone: string;
  onSchedule: (dateTime: { date: Date; time: string }) => void;
  className?: string;
}

const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  const startOfWeek = new Date(startDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  for (let i = 0; i < 6; i++) {
    const nextDay = new Date(startOfWeek);
    nextDay.setDate(startOfWeek.getDate() + i);
    days.push(nextDay);
  }
  return days;
};

export const DeliveryScheduler: React.FC<DeliverySchedulerProps> = ({
  initialDate = new Date(),
  timeSlots,
  timeZone,
  onSchedule,
  className,
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(timeSlots[0] || null);
  
  const weekDays = getWeekDays(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };
  
  return (
    <div className={cn('w-full space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-tight">{monthYear}</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => changeWeek('prev')} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronLeft size={14} /></button>
          <button onClick={() => changeWeek('next')} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronRight size={14} /></button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDate.toDateString() === day.toDateString();
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "h-10 md:h-12 flex flex-col items-center justify-center rounded-xl transition-all",
                isSelected ? "bg-primary text-white shadow-lg" : "bg-muted text-muted-foreground"
              )}
            >
              <span className="text-[6px] font-black uppercase opacity-60">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="text-xs font-black">{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {timeSlots.map((time) => (
          <button
            key={time}
            onClick={() => { setSelectedTime(time); onSchedule({ date: selectedDate, time }); }}
            className={cn(
              "h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
              selectedTime === time ? "bg-primary text-white shadow-lg" : "bg-muted text-muted-foreground"
            )}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
};
