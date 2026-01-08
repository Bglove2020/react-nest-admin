import { useEffect, useState, useCallback } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ruoyi/ui";
import { Checkbox } from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { SingleSelect } from "@/components/Select/single-select";
import { DataTable } from "@/components/Table/data";
import { Switch } from "@ruoyi/ui";
import { MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { axiosClient } from "@/lib/apiClient";
import { useDictDataByTypeQuery, type DictType } from "@/lib/dictQueries";
import { DialogDeleteConfirm } from "@/components/Dialog/delete-confirm";
import DictDialog from "./dialog/dict-dialog";
import { useNavigate } from "react-router-dom";
import { ApiCode, type ApiResponse } from "@ruoyi/contracts";

type Filters = {
  name: string;
  type: string;
  status: string;
};

export default function DictManage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>({
    name: "",
    type: "",
    status: "",
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);

  // 排序状态
  const [sort, setSort] = useState<{
    sortField: string | null;
    sortOrder: "asc" | "desc" | null;
  }>({
    sortField: null,
    sortOrder: null,
  });

  const [dictRowSelection, setDictRowSelection] = useState<RowSelectionState>(
    {},
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dicts, setDicts] = useState<DictType[]>([]);
  const [activeDict, setActiveDict] = useState<DictType | undefined>(undefined);

  const loadDicts = useCallback(async () => {
    const { name, type, status } = filters;
    axiosClient
      .get<ApiResponse<{ list: DictType[]; total: number }>>("/system/dict/list", {
        params: {
          pageNum: pagination.pageIndex,
          pageSize: pagination.pageSize,
          name: name || undefined,
          type: type || undefined,
          status: status || undefined,
          sortField: sort.sortField || undefined,
          sortOrder: sort.sortOrder || undefined,
        },
      })
      .then((res) => {
        setDicts(res.data.data.list);
        setTotal(res.data.data.total);
      })
      .catch((err) => toast.error(String(err)));
  }, [filters, pagination, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDicts();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadDicts]);

  // 处理排序
  const handleSort = (columnId: string) => {
    setSort((prev) => {
      if (prev.sortField === columnId) {
        if (prev.sortOrder === "asc") {
          return { sortField: columnId, sortOrder: "desc" };
        } else if (prev.sortOrder === "desc") {
          return { sortField: null, sortOrder: null };
        }
      }
      return { sortField: columnId, sortOrder: "asc" };
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const updateDictStatus = (id: string, status: boolean) => {
    axiosClient
      .post("/system/dict/update", {
        id,
        status: status ? "1" : "0",
      })
      .then((res) => {
        if (res.data.code === ApiCode.SUCCESS) {
          toast.success(res.data.msg);
          loadDicts();
        } else {
          toast.error(res.data.msg);
        }
      })
      .catch((err) => toast.error(String(err)));
  };

  const deleteDict = useCallback(async () => {
    return axiosClient.delete(`/system/dict/delete/${activeDict!.id}`);
  }, [activeDict]);

  const statusList = useDictDataByTypeQuery("status").data ?? [];

  const typeColumns: ColumnDef<DictType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="mr-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "字典名称",
      cell: ({ row }) => (
        <button
          className="cursor-pointer text-primary hover:underline"
          onClick={() =>
            navigate(
              `/system/dict-data-management?name=${row.original.name}&type=${row.original.type}`,
            )
          }
        >
          {row.getValue("name")}
        </button>
      ),
    },
    {
      accessorKey: "type",
      header: "字典类型",
      cell: ({ row }) => <button>{row.getValue("type")}</button>,
    },
    {
      accessorKey: "sortOrder",
      header: "显示顺序",
      cell: ({ row }) => row.getValue("sortOrder"),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Switch
          checked={row.getValue("status") === "1"}
          onCheckedChange={(checked) =>
            updateDictStatus(row.original.id, checked)
          }
        />
      ),
    },
    {
      accessorKey: "createTime",
      header: "创建时间",
      cell: ({ row }) =>
        row.getValue("createTime")
          ? new Date(row.getValue("createTime")).toLocaleString()
          : "-",
    },
    {
      id: "actions",
      header: "操作",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer gap-8"
              onClick={() => {
                setActiveDict(row.original);
                setIsCreate(false);
                setDialogOpen(true);
              }}
            >
              <span className="grow">编辑</span>
              <Pencil />
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              className="cursor-pointer gap-8"
              onClick={() => {
                setActiveDict(row.original);
                setDeleteDialogOpen(true);
              }}
            >
              <span className="grow text-destructive">删除</span>
              <Trash2 className="text-destructive" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4 px-8 py-6">
      <div className="flex flex-col items-start gap-2 space-y-3 rounded-md sm:flex-row sm:flex-wrap sm:gap-4">
        <div className="flex w-full max-w-[260px] items-center gap-2">
          <Input
            placeholder="请输入字典名称"
            value={filters.name}
            onChange={(e) =>
              setFilters((f) => ({ ...f, name: e.target.value }))
            }
            className="w-full py-2 text-sm"
          />
        </div>
        <div className="flex w-full max-w-[260px] items-center gap-2">
          <Input
            placeholder="请输入字典类型"
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({ ...f, type: e.target.value }))
            }
            className="w-full py-2 text-sm"
          />
        </div>
        <div className="flex w-full max-w-[260px] items-center gap-2">
          <SingleSelect
            className="w-full"
            placeholder="请选择状态"
            options={statusList}
            value={filters.status}
            label="状态"
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsCreate(true);
              setActiveDict(undefined);
              setDialogOpen(true);
            }}
          >
            <span>新增类型</span>
            <Plus />
          </Button>
          <Button variant="outline" onClick={loadDicts}>
            <span>刷新</span>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DataTable
        data={dicts}
        columns={typeColumns}
        total={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        sort={sort}
        onSort={handleSort}
        rowSelection={dictRowSelection}
        onRowSelectionChange={setDictRowSelection}
      />

      {dialogOpen && (
        <DictDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => {
            loadDicts();
            setDialogOpen(false);
            setActiveDict(undefined);
          }}
          activeDict={activeDict}
          isCreate={isCreate}
        />
      )}

      {activeDict && (
        <DialogDeleteConfirm
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          deleteApi={deleteDict}
          onSuccess={() => {
            loadDicts();
            setDeleteDialogOpen(false);
            setActiveDict(undefined);
          }}
          title="删除字典"
        >
          <span className="mb-2 block text-sm">
            确定要删除字典
            <span className="mx-1 rounded-md border border-primary bg-primary/10 px-3 py-1">
              {activeDict!.name}
            </span>
            吗？
          </span>
        </DialogDeleteConfirm>
      )}
    </div>
  );
}
