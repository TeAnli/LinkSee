import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { PaginatedResponse } from '@linksee/shared';

interface Column<T> {
  key: string | keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  data: PaginatedResponse<T>;
  columns: Column<T>[];
  searchPlaceholder?: string;
  onSearch?: (keyword: string) => void;
  onPageChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  currentPage?: number;
  pageSize?: number;
}

export function AdminDataTable<T extends object>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onSearch,
  onPageChange,
  onSizeChange,
  actions,
  emptyMessage = 'No data found',
  currentPage = 1,
  pageSize = 20,
}: AdminDataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    onSearch?.(searchValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onSearch?.('');
  };

  const totalPages = useMemo(() => {
    return Math.ceil(data.total / pageSize);
  }, [data.total, pageSize]);

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, data.total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {onSearch && (
          <div className="relative flex-1 max-w-md">
            <Icon
              icon="mdi:search"
              width={18}
              height={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={handleClearSearch}
              >
                <Icon icon="mdi:close" width={14} height={14} />
              </Button>
            )}
          </div>
        )}
        {onSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <select
              className="h-8 px-3 rounded-md border border-border bg-background text-sm"
              onChange={(e) => onSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)} className={cn(column.className)}>
                  {column.label}
                </TableHead>
              ))}
              {actions && <TableHead className="w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.list.length > 0 ? (
              data.list.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={cn(column.className)}>
                      {column.render
                        ? column.render(column.key in row ? row[column.key as keyof T] : undefined, row)
                        : column.key in row
                        ? String(row[column.key as keyof T])
                        : ''}
                    </TableCell>
                  ))}
                  {actions && <TableCell className="text-right">{actions(row)}</TableCell>}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center h-20">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {data.total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex}-{endIndex} of {data.total} entries
          </span>
          <Pagination
            page={currentPage}
            total={data.total}
            pageSize={pageSize}
            onChange={(page) => onPageChange?.(page)}
          />
        </div>
      )}
    </div>
  );
}
