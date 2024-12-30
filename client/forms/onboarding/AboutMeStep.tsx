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
import { Textarea } from '@/components/ui/textarea';

interface AboutMeStepProps {
  form: UseFormReturn<any>;
}

export function AboutMeStep({ form }: AboutMeStepProps) {
  return (
    <FormField
      control={form.control}
      name="about_me"
      render={({ field }) => (
        <FormItem>
          <FormLabel>About Me</FormLabel>
          <FormDescription>
            Tell us about yourself, your interests, and what brings you here.
          </FormDescription>
          <FormControl>
            <Textarea
              placeholder="Tell us about yourself..."
              className="min-h-[100px] resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
