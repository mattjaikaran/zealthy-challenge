'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/axios';
import { format } from 'date-fns';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserData {
  id: string;
  email: string;
  username: string;
  about_me: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  birthdate: string | null;
  created_at: string;
}

type SortConfig = {
  key: keyof UserData;
  direction: 'asc' | 'desc';
} | null;

export function DataTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-data'],
    queryFn: async () => {
      const response = await publicApi.get<UserData[]>('/users/');
      return response.data;
    },
  });

  const handleSort = (key: keyof UserData) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortData = (data: UserData[]) => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterData = (data: UserData[]) => {
    if (!searchTerm) return data;

    return data.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.about_me?.toLowerCase() || '').includes(
          searchTerm.toLowerCase(),
        ) ||
        (user.street_address?.toLowerCase() || '').includes(
          searchTerm.toLowerCase(),
        ) ||
        (user.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.state?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
    );
  };

  const processedData = sortData(filterData(users));

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-6">Loading user data...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Data</CardTitle>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('email')}>
                      Email
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('username')}
                    >
                      Username
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>About Me</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('birthdate')}
                    >
                      Birthdate
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('created_at')}
                    >
                      Created At
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.about_me || '-'}</TableCell>
                    <TableCell>
                      {user.street_address ? (
                        <>
                          {user.street_address}
                          <br />
                          {user.city}, {user.state} {user.zip_code}
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {user.birthdate
                        ? format(new Date(user.birthdate), 'PP')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'PPp')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(user.email)
                            }
                          >
                            Copy email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(user.id)
                            }
                          >
                            Copy ID
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
