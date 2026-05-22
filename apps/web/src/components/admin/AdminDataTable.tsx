import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import type { PaginatedResponse } from '@linksee/shared';

interface Column<T> {
  key: string | keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface AdminDataTableProps<T> {
  data: PaginatedResponse<T>;
  columns: Column<T>[];
  searchPlaceholder?: string;
  onSearch?: (keyword: string) => void;
  onPageChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  currentPage?: number;
  pageSize?: number;
  loading?: boolean;
  dense?: boolean;
}

export function AdminDataTable<T extends object>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onSearch,
  onPageChange,
  onSizeChange,
  onSort,
  actions,
  emptyMessage = 'No data found',
  currentPage = 1,
  pageSize = 20,
  loading = false,
  dense = false,
}: AdminDataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const totalPages = useMemo(() => {
    return Math.ceil(data.total / pageSize);
  }, [data.total, pageSize]);

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, data.total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {onSearch && (
          <div className="relative flex-1 max-w-sm">
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
              className="pl-10 pr-8"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={handleClearSearch}
              >
                <Icon icon="mdi:close" width={14} height={14} />
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {onSizeChange && (
            <>
              <span className="text-sm text-muted-foreground whitespace-nowrap">每页</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => onSizeChange(Number(v))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground whitespace-nowrap">条</span>
            </>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)} className={cn(dense && 'h-8 px-2 text-xs', column.className)}>
                  {column.sortable ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort(String(column.key))}
                    >
                      {column.label}
                      <Icon
                        icon={
                          sortKey === String(column.key) && sortDir === 'asc'
                            ? 'mdi:chevron-up'
                            : 'mdi:chevron-down'
                        }
                        width={14}
                        height={14}
                        className={cn(
                          'transition-colors',
                          sortKey === String(column.key) ? 'text-foreground' : 'text-muted-foreground/40',
                        )}
                      />
                    </button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {actions && <TableHead className="w-24">操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={cn(dense && 'px-2 py-1')}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className={cn(dense && 'px-2 py-1')}>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : data.list.length > 0 ? (
              data.list.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={cn(dense && 'px-2 py-1', column.className)}>
                      {column.render
                        ? column.render(column.key in row ? row[column.key as keyof T] : undefined, row)
                        : column.key in row
                        ? String(row[column.key as keyof T])
                        : ''}
                    </TableCell>
                  ))}
                  {actions && <TableCell className={cn('text-right', dense && 'px-2 py-1')}>{actions(row)}</TableCell>}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center h-24">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Icon icon="mdi:database-off" width={32} height={32} />
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {data.total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">
            第 {startIndex}-{endIndex} 条，共 {data.total} 条
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
