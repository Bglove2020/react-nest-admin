"use client";
import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type Row,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ruoyi/ui";

type NestedDataTableProps<T extends object> = {
  filterEntries: { id: string; value: unknown }[];
  data: T[];
  columns: ColumnDef<T, any>[];
  firstColumnHeaderName: string;
  firstColumnKey: string;
  getRowId?: (row: T) => string;
  getSubRows?: (row: T) => T[] | undefined;
};

function ExpanderCell<T extends object>({ row }: { row: Row<T> }) {
  if (!row.getCanExpand()) return <></>;
  return (
    <button
      aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
      onClick={row.getToggleExpandedHandler()}
      className="inline-flex cursor-pointer items-center justify-center"
    >
      <ChevronRight
        strokeWidth={1.5}
        className={cn(
          "size-4 transition-transform",
          row.getIsExpanded() && "rotate-90",
        )}
      />
    </button>
  );
}

export function NestedDataTable<T extends Record<string, any>>({
  firstColumnHeaderName,
  firstColumnKey,
  data,
  columns,
  filterEntries,
  getRowId,
  getSubRows,
}: NestedDataTableProps<T>) {
  const [expanded, setExpanded] = React.useState({} as Record<string, boolean>);

  const handleExpandedChange = React.useCallback((updaterOrValue: any) => {
    setExpanded((prev) => {
      if (typeof updaterOrValue === "function") {
        return updaterOrValue(prev);
      }
      return updaterOrValue;
    });
  }, []);

  const table = useReactTable({
    data,
    columns: [
      {
        id: firstColumnKey,
        accessorKey: firstColumnKey,
        header: ({ table }) => (
          <div className="flex items-center gap-1 pl-2">
            <span>{firstColumnHeaderName}</span>
            <button
              type="button"
              onClick={() => table.toggleAllRowsExpanded()}
              className="flex cursor-pointer items-center justify-center rounded-md p-1 transition-colors hover:bg-accent"
              title={table.getIsAllRowsExpanded() ? "全部收起" : "全部展开"}
            >
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="relative flex items-center gap-2 pl-5">
            <div className="absolute top-0 bottom-0 left-0 flex items-center justify-center">
              <ExpanderCell row={row} />
            </div>
            <div>{row.original[firstColumnKey]}</div>
          </div>
        ),
        // size: 40,
      } as ColumnDef<T, any>,
      ...columns,
    ],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: getRowId as any,
    getSubRows: (row) =>
      getSubRows ? getSubRows(row as T) : (row as any)?.subRows,
    onExpandedChange: handleExpandedChange,
    // 默认情况下，只筛选顶级父行，如果需要筛选叶子节点，则需要设置 filterFromLeafRows 为 true
    filterFromLeafRows: true,
    state: { expanded, columnFilters: filterEntries },
  });

  return (
    <div className="w-full max-w-full">
      <div className="relative max-w-full overflow-x-auto rounded-md border">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, idx) => (
                    <TableCell key={cell.id}>
                      {idx === 0 ? (
                        // 第一列（包含展开按钮）在嵌套层级时添加缩进
                        <div style={{ paddingLeft: row.depth * 16 + "px" }}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
