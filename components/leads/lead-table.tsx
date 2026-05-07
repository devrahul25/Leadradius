"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Phone,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { BusinessLead } from "@/lib/types";
import { cn, formatKm, formatNumber } from "@/lib/utils";
import { labelStyles } from "@/lib/lead-scoring";

interface Props {
  data: BusinessLead[];
  onSelectionChange?: (rows: BusinessLead[]) => void;
}

const PAGE_SIZE = 12;

export function LeadTable({ data, onSelectionChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<BusinessLead>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
            onChange={(v) => table.toggleAllPageRowsSelected(v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(v) => row.toggleSelected(v)}
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "name",
        header: "Business",
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="min-w-0">
              <p className="font-medium text-text-primary truncate">{l.name}</p>
              <p className="text-xs text-text-muted truncate">{l.address}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge className="capitalize">{row.original.category}</Badge>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300 shrink-0" />
            <span className="font-medium text-text-primary">{row.original.rating.toFixed(1)}</span>
          </div>
        ),
      },
      {
        accessorKey: "totalReviews",
        header: "Reviews",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-text-secondary">{formatNumber(row.original.totalReviews)}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
          const phone = row.original.phone;
          if (!phone) return <span className="text-xs text-text-muted">—</span>;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard?.writeText(phone);
              }}
              className="group inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-300 transition-colors"
              title="Click to copy"
            >
              <Phone className="h-3 w-3" />
              <span className="font-mono text-xs">{phone}</span>
              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        },
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">{row.original.city}</span>
        ),
      },
      {
        accessorKey: "distanceKm",
        header: "Distance",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-text-secondary">{formatKm(row.original.distanceKm)}</span>
        ),
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-medium text-text-primary tabular-nums">{row.original.score.toFixed(1)}</span>
            <ScoreBar score={row.original.score} />
          </div>
        ),
      },
      {
        accessorKey: "label",
        header: "Quality",
        cell: ({ row }) => (
          <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", labelStyles(row.original.label))}>
            {row.original.label}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(next);
      if (onSelectionChange) {
        const rowIds = Object.keys(next).filter((k) => next[k]);
        onSelectionChange(data.filter((_, idx) => rowIds.includes(String(idx))));
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
    enableRowSelection: true,
    globalFilterFn: (row, _id, value) => {
      const v = String(value).toLowerCase();
      const l = row.original;
      return [l.name, l.address, l.category, l.city, l.phone].some((f) =>
        (f ?? "").toLowerCase().includes(v)
      );
    },
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageInfo = table.getState().pagination;
  const start = pageInfo.pageIndex * pageInfo.pageSize + 1;
  const end = Math.min((pageInfo.pageIndex + 1) * pageInfo.pageSize, totalRows);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Filter by name, city, phone…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
        <p className="text-xs text-text-muted ml-auto">
          {totalRows === data.length
            ? `${formatNumber(totalRows)} leads`
            : `${formatNumber(totalRows)} of ${formatNumber(data.length)} leads`}
        </p>
      </div>

      <div className="glass overflow-hidden p-0">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-bg-surface/40">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-text-muted whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                          className={cn(
                            "inline-flex items-center gap-1.5",
                            header.column.getCanSort() && "hover:text-text-primary"
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className={cn("h-3 w-3 opacity-40", header.column.getIsSorted() && "opacity-100 text-brand-300")} />
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-white/[0.02]",
                    row.getIsSelected() && "bg-brand-500/5"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-text-muted text-sm">
                    No leads match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-bg-surface/40 text-xs">
          <p className="text-text-muted">
            {totalRows ? `Showing ${start}–${end} of ${formatNumber(totalRows)}` : "0 results"}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <span className="px-3 text-text-secondary">
              Page <span className="text-text-primary font-medium">{pageInfo.pageIndex + 1}</span> of {table.getPageCount() || 1}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  indeterminate,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate;
      }}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-border bg-bg-surface text-brand-500 focus:ring-2 focus:ring-brand-500/40"
    />
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, (score / 140) * 100);
  return (
    <div className="hidden lg:block w-12 h-1 rounded-full bg-bg-elevated overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
