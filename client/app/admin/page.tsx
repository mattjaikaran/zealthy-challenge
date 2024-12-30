'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOnboardingConfig, useUpdateConfig } from '@/lib/queries/onboarding';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const components = [
  { id: 'about', label: 'About Me' },
  { id: 'address', label: 'Address' },
  { id: 'birthdate', label: 'Birthdate' },
];

export default function AdminPage() {
  const { toast } = useToast();
  const { data: config, isLoading } = useOnboardingConfig();
  const updateConfig = useUpdateConfig();
  const [page2Components, setPage2Components] = useState<string[]>([]);
  const [page3Components, setPage3Components] = useState<string[]>([]);

  // Initialize state from config when it loads
  useEffect(() => {
    if (config) {
      setPage2Components(
        config.filter((c) => c.page_number === 2).map((c) => c.component),
      );
      setPage3Components(
        config.filter((c) => c.page_number === 3).map((c) => c.component),
      );
    }
  }, [config]);

  const handleSave = async () => {
    // Validate that each page has at least one component
    if (page2Components.length === 0 || page3Components.length === 0) {
      toast({
        title: 'Error',
        description: 'Each page must have at least one component',
        variant: 'destructive',
      });
      return;
    }

    // Validate that no component is used more than once
    const allComponents = [...page2Components, ...page3Components];
    const uniqueComponents = new Set(allComponents);
    if (allComponents.length !== uniqueComponents.size) {
      toast({
        title: 'Error',
        description: 'Each component can only be used once',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateConfig.mutateAsync({
        page2Components,
        page3Components,
      });

      toast({
        title: 'Success',
        description: 'Configuration saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-6">Loading configuration...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Page 2 Components</h3>
            <div className="grid grid-cols-3 gap-4">
              {components.map((component) => (
                <div key={component.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`page2-${component.id}`}
                    checked={page2Components.includes(component.id)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setPage2Components([...page2Components, component.id]);
                      } else {
                        setPage2Components(
                          page2Components.filter((id) => id !== component.id),
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`page2-${component.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {component.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Page 3 Components</h3>
            <div className="grid grid-cols-3 gap-4">
              {components.map((component) => (
                <div key={component.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`page3-${component.id}`}
                    checked={page3Components.includes(component.id)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setPage3Components([...page3Components, component.id]);
                      } else {
                        setPage3Components(
                          page3Components.filter((id) => id !== component.id),
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`page3-${component.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {component.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateConfig.isPending}
            className="w-full"
          >
            {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
