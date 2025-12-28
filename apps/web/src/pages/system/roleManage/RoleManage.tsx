import { useEffect, useState, useCallback } from "react";
import { Input } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { SingleSelect } from "@/components/Select/single-select";
import { MoreHorizontal, Trash2, Plus, Pencil } from "lucide-react";
import { DataTable } from "@/components/Table/data";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Checkbox } from "@ruoyi/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ruoyi/ui";
import { axiosClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { DialogDeleteConfirm } from "@/components/Dialog/delete-confirm";
import { Switch } from "@ruoyi/ui";
import AddRoleDialog from "./dialog/add-role";
import { useDictDataByTypeQuery } from "@/lib/dictQueries";

type Filters = {
  name: string;
  roleKey: string;
  status: string;
};

type role = {
  id: string;
  name: string;
  roleKey: string;
  status: "0" | "1";
  remark: string;
  sortOrder: number;
};

// 将 filters 转换为 { id, value } 对象数组
const extractFilterEntries = (filters: Filters) => {
  return Object.entries(filters).map(([key, val]) => ({
    id: key,
    value: val,
  }));
};

export default function RoleManage() {
  // alert('设备宽度:'+window.innerWidth+'设备高度:'+window.innerHeight)
  const [filters, setFilters] = useState<Filters>({
    name: "",
    roleKey: "",
    status: "",
  });

  // const [loading, setLoading] = useState(false);
  const [data, setData] = useState<role[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // 控制操作列弹窗（可编程开关）
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<role | null>(null);
  const [isCreate, setIsCreate] = useState(false);

  const loadRoles = useCallback(() => {
    axiosClient
      .get<{ data: role[] }>("/system/role/list")
      .then((res) => {
        setData(res.data.data);
      })
      .catch((e) => {
        toast.error(String(e));
      });
  }, []);

  const deleteRole = useCallback(async () => {
    return await axiosClient.delete(
      `/system/role/delete/${activeRole?.id}`,
    );
  }, [activeRole]);

  useEffect(() => {
    // 初始加载
    loadRoles();
  }, [loadRoles]);
  const statusList = useDictDataByTypeQuery("status").data ?? [];

  const openDeleteDialogFor = (r: role) => {
    setActiveRole(r);
    setDeleteDialogOpen(true);
  };

  const columns: ColumnDef<role>[] = [
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
            className=""
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className=""
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "角色名称",
      cell: ({ row }) => row.getValue("name"),
    },
    {
      accessorKey: "roleKey",
      header: "权限字符",
      cell: ({ row }) => row.getValue("roleKey"),
    },
    {
      accessorKey: "sortOrder",
      header: "排序号",
      cell: ({ row }) => row.getValue("sortOrder"),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Switch
          checked={row.getValue("status") === "1"}
          onCheckedChange={(checked) => {
            console.log("checked", checked);
            console.log("row.getValue('id')", row.original.id);
            axiosClient
              .post("/system/role/update", {
                id: row.original.id,
                status: checked ? "1" : "0",
              })
              .then((res) => {
                if (res.data.code === 200) {
                  toast.success(res.data.msg);
                  loadRoles();
                } else {
                  toast.error(res.data.msg);
                }
              })
              .catch((e) => {
                toast.error(String(e));
              });
          }}
        />
      ),
      filterFn: (row, value, filterValue) => {
        console.log("过滤数据", row, value, filterValue);
        if (!filterValue || filterValue.length === 0) return true;
        return filterValue.includes(row.getValue("status"));
      },
    },
    {
      id: "actions",
      header: "操作",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <>
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
                    setActiveRole(row.original);
                    setIsCreate(false);
                    setAddRoleDialogOpen(true);
                  }}
                >
                  <span className="grow">编辑角色</span>
                  <Pencil />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="cursor-pointer gap-8"
                  onClick={() => openDeleteDialogFor(row.original)}
                >
                  <span className="grow text-destructive">删除</span>
                  <Trash2 className="text-destructive" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* 注意：不要在每一行的 cell 中渲染弹窗组件，否则会出现多层弹窗 */}
          </>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 px-8 py-6">
      {/* 筛选区域 */}
      <div className="flex flex-col items-start gap-2 space-y-3 rounded-md sm:flex-row sm:flex-wrap sm:gap-4">
        {/* 搜索框 */}
        <div className="flex w-full max-w-[300px] items-center gap-2">
          <Input
            id="search"
            placeholder="请输入角色名称"
            value={filters.name}
            onChange={(e) =>
              setFilters((f) => ({ ...f, name: e.target.value }))
            }
            className="w-full py-2 text-sm"
          />
        </div>
        {/* 单选（DropdownMenu + radio） */}
        <div className="flex w-full max-w-[300px] items-center gap-2">
          <SingleSelect
            className="w-full"
            placeholder="请选择角色状态"
            options={statusList}
            value={filters.status}
            label="角色状态"
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-2">
        {/* <Button variant="outline">
          <span>导入</span>
          <Import />
        </Button>
        <Button variant="outline">
          <span>导出</span>
          <Download />
        </Button> */}
        <Button
          variant="outline"
          onClick={() => {
            setIsCreate(true);
            setAddRoleDialogOpen(true);
          }}
        >
          <span>新增角色</span>
          <Plus />
        </Button>

        {/* <Button
          variant="outline"
          disabled={Object.keys(rowSelection).length === 0}
          onClick={() => {
            if (Object.keys(rowSelection).length === 0) {
              toast.error("请先选择要删除的行");
              return;
            }
            console.log("选中的行:", rowSelection);
            setMultiDeleteDialogOpen(true);
            // TODO: 在这里调用后端进行批量删除，完成后刷新表格
            // axiosClient.post('/user/batch-delete', { ids: Object.keys(rowSelection) }).then(() => loadUsers())
          }}
        >
          <span>批量删除</span>
          <Trash />
        </Button> */}
      </div>

      <div className="w-full">
        <DataTable
          filters={extractFilterEntries(filters)}
          data={data}
          columns={columns}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>

      {addRoleDialogOpen && (
        <AddRoleDialog
          open={addRoleDialogOpen}
          onOpenChange={setAddRoleDialogOpen}
          onSuccess={() => {
            loadRoles();
            setAddRoleDialogOpen(false);
          }}
          isCreate={isCreate}
          activeRole={activeRole}
        />
      )}

      {/* 全局渲染一次：删除确认弹窗（受控） */}
      {activeRole && (
        <DialogDeleteConfirm
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          deleteApi={deleteRole}
          onSuccess={() => {
            setDeleteDialogOpen(false);
            loadRoles();
          }}
          title="删除角色"
        >
          <div className="mb-2 text-sm">
            确定要删除角色
            <span className="mx-1 rounded-md border border-primary bg-primary/10 px-3 py-1">
              {activeRole?.name}
            </span>
            吗？
          </div>
        </DialogDeleteConfirm>
      )}
    </div>
  );
}
