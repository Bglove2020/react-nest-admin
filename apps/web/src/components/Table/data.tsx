"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  VisibilityState,
  OnChangeFn,
  RowSelectionState,
  HeaderContext,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ruoyi/ui";
import { SimplePagination } from "@/components/Table/simple-pagination";
import DialogLoading from "@/components/Dialog/loading";

type SortState = {
  sortField: string | null;
  sortOrder: "asc" | "desc" | null;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  total,
  pagination,
  onPaginationChange,
  sort = { sortField: null, sortOrder: null },
  onSort = () => {},
  rowSelection,
  onRowSelectionChange,
  loading = false,
}: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  total: number;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  sort?: SortState;
  onSort?: (columnId: string) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  loading?: boolean;
}) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const resolvedColumns = React.useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        header: (context: HeaderContext<T, unknown>) => {
        const accessorKey = "accessorKey" in col ? col.accessorKey : undefined;
        const columnId = String(col.id ?? accessorKey ?? "");
        const isSorted = sort.sortField === columnId;
        const isSortable = col.enableSorting === true;

        const headerContent = col.header
          ? flexRender(col.header, context)
          : columnId;

        return (
          <div
            className={`flex items-center ${
              isSortable ? "cursor-pointer select-none" : ""
            }`}
            onClick={() => isSortable && onSort(columnId)}
          >
            {headerContent}
            {isSortable && (
              <span className="ml-2 text-muted-foreground">
                {isSorted ? (sort.sortOrder === "asc" ? "↑" : "↓") : "↕"}
              </span>
            )}
          </div>
        );
      },
    })) as ColumnDef<T, unknown>[],
    [columns, onSort, sort.sortField, sort.sortOrder],
  );

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange,
    getRowId: (row) => row.id,
    state: {
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full max-w-full">
      <div className="relative max-w-full overflow-x-auto rounded-md border">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === headerGroup.headers.length - 1;
                  const stickyClass = isFirst
                    ? "sticky left-0 z-10 bg-background"
                    : isLast
                      ? "sticky right-0 z-10 bg-background"
                      : "";
                  return (
                    <TableHead key={header.id} className={stickyClass}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === row.getVisibleCells().length - 1;
                    const stickyClass = isFirst
                      ? "sticky left-0 z-10 bg-background"
                      : isLast
                        ? "sticky right-0 z-10 bg-background"
                        : "";
                    return (
                      <TableCell key={cell.id} className={stickyClass}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {loading && <DialogLoading title="加载中..." />}
      </div>

      <SimplePagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        total={total}
        onPageChange={(newPageIndex) =>
          onPaginationChange({ ...pagination, pageIndex: newPageIndex })
        }
        onPageSizeChange={(newPageSize) =>
          onPaginationChange({ pageIndex: 0, pageSize: newPageSize })
        }
        loading={loading}
      />
    </div>
  );
}
