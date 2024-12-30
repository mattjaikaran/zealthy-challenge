'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';

interface BirthdateStepProps {
  form: UseFormReturn<any>;
}

const months = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
] as const;

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Generate years array from 1900 to current year
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => 1900 + i,
  ).reverse();
};

export function BirthdateStep({ form }: BirthdateStepProps) {
  const years = generateYears();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Get the current value from the form
  const currentDate = form.getValues('birthdate');

  // Initialize selected values if there's a current date
  useEffect(() => {
    if (currentDate) {
      setSelectedMonth(currentDate.getMonth());
      setSelectedYear(currentDate.getFullYear());
    }
  }, [currentDate]);

  // Calculate available days based on selected month and year
  const days =
    selectedMonth !== null && selectedYear !== null
      ? Array.from(
          { length: getDaysInMonth(selectedMonth, selectedYear) },
          (_, i) => i + 1,
        )
      : [];

  const handleDateChange = (type: 'month' | 'day' | 'year', value: string) => {
    const currentValue = form.getValues('birthdate') || new Date();
    let newDate: Date;

    if (type === 'month') {
      setSelectedMonth(Number(value));
      newDate = new Date(currentValue.setMonth(Number(value)));
    } else if (type === 'day') {
      newDate = new Date(currentValue.setDate(Number(value)));
    } else {
      setSelectedYear(Number(value));
      newDate = new Date(currentValue.setFullYear(Number(value)));
    }

    form.setValue('birthdate', newDate, {
      shouldValidate: showValidation,
    });
  };

  // Show validation after first attempt to move to next step
  useEffect(() => {
    const subscription = form.watch(() => {
      if (!showValidation) setShowValidation(true);
    });
    return () => subscription.unsubscribe();
  }, [form, showValidation]);

  return (
    <FormField
      control={form.control}
      name="birthdate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date of Birth</FormLabel>
          <FormDescription>Select your date of birth</FormDescription>
          <div className="flex gap-4">
            <Select
              onValueChange={(value) => handleDateChange('month', value)}
              value={selectedMonth?.toString()}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => handleDateChange('day', value)}
              disabled={!selectedMonth || !selectedYear}
              value={field.value?.getDate()?.toString()}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => handleDateChange('year', value)}
              value={selectedYear?.toString()}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          {showValidation && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
