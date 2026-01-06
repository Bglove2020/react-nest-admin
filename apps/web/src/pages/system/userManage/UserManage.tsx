import { useEffect, useState, useCallback, useRef } from "react";
import { Input } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { SingleSelect } from "@/components/Select/single-select";
import { MultiSelect } from "@/components/Select/multi-select";
import {
  Trash,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Pencil,
  Plus,
} from "lucide-react";
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
import { UserDialog } from "@/pages/system/userManage/dialog/add-user";
import { DialogFormChangePassword } from "@/pages/system/userManage/dialog/change-password";
import { DialogDeleteConfirm } from "@/components/Dialog/delete-confirm";
import { DialogMultiDeleteConfirm } from "@/components/Dialog/multi-delete-confirm";
import { Switch } from "@ruoyi/ui";
import { Permission } from "@/hooks/usePermission";
import { useDictDataByTypeQuery, dictDataToOptions } from "@/lib/dictQueries";

type Filters = {
  account: string;
  sex: string;
  status: string[];
};

type user = {
  id: string;
  account: string;
  name: string;
  email: string;
  sex: "0" | "1" | "2";
  status: "0" | "1";
  deptId?: string;
  roleIds?: string[];
};

export default function UserManage() {
  const [filters, setFilters] = useState<Filters>({
    account: "",
    sex: "",
    status: [],
  });

  const [data, setData] = useState<user[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // 排序状态
  const [sort, setSort] = useState<{
    sortField: string | null;
    sortOrder: "asc" | "desc" | null;
  }>({
    sortField: null,
    sortOrder: null,
  });

  // 控制操作列弹窗（可编程开关）
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multiDeleteDialogOpen, setMultiDeleteDialogOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<user | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);

  const loadUsers = useCallback(
    async (addLoading: boolean = true) => {
      // 取消上一次请求
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      if (addLoading) {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      try {
        const params = {
          pageNum: pagination.pageIndex,
          pageSize: pagination.pageSize,
          account: filters.account || undefined,
          sex: filters.sex || undefined,
          status: filters.status.length > 0 ? filters.status : undefined,
          sortField: sort.sortField || undefined,
          sortOrder: sort.sortOrder || undefined,
        };

        const res = await axiosClient.get<{
          code: number;
          msg: string;
          data: { list: user[]; total: number };
        }>("/system/user/list", {
          params,
          signal: abortRef.current.signal,
        });

        setData(res.data.data.list);
        setTotal(res.data.data.total);
      } catch (e) {
        // 忽略被取消的请求
        if ((e as Error).name !== "AbortError") {
          toast.error(String(e));
        }
      } finally {
        setLoading(false);
      }
    },
    [pagination, filters, sort],
  );

  const deleteUser = useCallback(async () => {
    return await axiosClient.delete(`/system/user/delete/${activeUser?.id}`);
  }, [activeUser]);

  // 监听分页和过滤参数变化，自动加载数据（带防抖）
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      loadUsers(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // 处理排序
  const handleSort = (columnId: string) => {
    setSort((prev) => {
      // 如果点击的是当前排序字段，切换排序方向
      if (prev.sortField === columnId) {
        if (prev.sortOrder === "asc") {
          return { sortField: columnId, sortOrder: "desc" };
        } else if (prev.sortOrder === "desc") {
          return { sortField: null, sortOrder: null }; // 取消排序
        }
      }

      // 新字段排序，默认升序
      return { sortField: columnId, sortOrder: "asc" };
    });

    // 排序后重置到第一页
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // 获取状态列表（转换为选项格式）
  const statusList = dictDataToOptions(
    useDictDataByTypeQuery("status").data ?? [],
  );
  // 获取性别列表（转换为选项格式）
  const sexList = dictDataToOptions(useDictDataByTypeQuery("sex").data ?? []);

  // 统一的筛选处理函数，同时重置分页
  const handleFilterChange = <K extends keyof Filters>(
    key: K,
    value: Filters[K],
  ) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const openResetDialogFor = (u: user) => {
    setActiveUser(u);
    setResetDialogOpen(true);
  };

  const openDeleteDialogFor = (u: user) => {
    setActiveUser(u);
    setDeleteDialogOpen(true);
  };

  const columns: ColumnDef<user>[] = [
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
      header: "用户名",
      cell: ({ row }) => row.getValue("name"),
    },
    {
      accessorKey: "deptName",
      header: "部门",
      cell: ({ row }) => row.getValue("deptName"),
    },
    {
      accessorKey: "account",
      header: "账号",
      cell: ({ row }) => row.getValue("account"),
      enableSorting: true, // ✅ 启用排序
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => row.getValue("email"),
    },
    {
      accessorKey: "sex",
      header: "性别",
      cell: ({ row }) =>
        row.getValue("sex") === "0"
          ? "未知"
          : row.getValue("sex") === "1"
            ? "男"
            : "女",
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
              .post("/system/user/update", {
                id: row.original.id,
                status: checked ? "1" : "0",
              })
              .then((res) => {
                if (res.data.code === 200) {
                  toast.success(res.data.msg);
                  loadUsers();
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
      enableSorting: false, // ❌ 禁用排序
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
                  onClick={() => openResetDialogFor(row.original)}
                >
                  <span className="grow">重置密码</span>
                  <RotateCcw />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-8"
                  onClick={() => {
                    setIsCreate(false);
                    setActiveUser(row.original);
                    setUserDialogOpen(true);
                  }}
                >
                  <span className="grow">编辑用户</span>
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
            {/* 注意：不要在每一行的 cell 中渲染弹窗组件，��则会出现多层弹窗 */}
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
            placeholder="输入关键字"
            value={filters.account}
            onChange={(e) => handleFilterChange("account", e.target.value)}
            className="w-full py-2 text-sm"
          />
        </div>
        {/* 单选（DropdownMenu + radio） */}
        <div className="flex w-full max-w-[300px] items-center gap-2">
          <SingleSelect
            className="w-full"
            placeholder="请选择性别"
            options={sexList}
            value={filters.sex}
            label="性别"
            onChange={(v) => handleFilterChange("sex", v)}
          />
        </div>

        {/* 多选（DropdownMenu + checkbox） */}
        <div className="flex w-full max-w-[300px] items-center gap-2">
          <MultiSelect
            options={statusList}
            value={filters.status}
            onChange={(v) => handleFilterChange("status", v)}
            placeholder="请选择状态"
            searchPlaceholder="搜索状态..."
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-2">
        <Permission permission="system:user:create">
          <Button
            variant="outline"
            onClick={() => {
              setIsCreate(true);
              setUserDialogOpen(true);
            }}
          >
            <span>新增用户</span>
            <Plus />
          </Button>
        </Permission>

        <Button
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
        </Button>
      </div>

      <div className="w-full">
        <DataTable
          data={data}
          columns={columns}
          total={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          sort={sort}
          onSort={handleSort}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          loading={loading}
        />
      </div>

      {userDialogOpen && (
        <UserDialog
          open={userDialogOpen}
          onOpenChange={setUserDialogOpen}
          onSuccess={() => {
            loadUsers();
            setUserDialogOpen(false);
            setActiveUser(null);
          }}
          isCreate={isCreate}
          activeUser={activeUser}
        />
      )}

      {/* 全局渲染一次：重置密码弹窗（受控） */}
      {activeUser && (
        <DialogFormChangePassword
          open={resetDialogOpen}
          onOpenChange={setResetDialogOpen}
          rowData={activeUser}
          onSuccess={() => {
            loadUsers();
            setResetDialogOpen(false);
          }}
        />
      )}
      {/* 全局渲染一次：删除确认弹窗（受控） */}
      {activeUser && (
        <DialogDeleteConfirm
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          deleteApi={deleteUser}
          onSuccess={() => {
            loadUsers();
            setDeleteDialogOpen(false);
          }}
          title="删除用户"
        >
          <span className="mb-2 block text-sm">
            确定要删除
            <span className="mx-1 rounded-md border border-primary bg-primary/10 px-3 py-1">
              {activeUser?.account}
            </span>
            吗？
          </span>
          <span className="block text-sm text-muted-foreground">
            注意：删除用户后，该用户将无法登录系统。
          </span>
        </DialogDeleteConfirm>
      )}
      {rowSelection && (
        <DialogMultiDeleteConfirm
          open={multiDeleteDialogOpen}
          onOpenChange={setMultiDeleteDialogOpen}
          data={data}
          selected={rowSelection}
          onSuccess={() => {
            loadUsers();
            setRowSelection({});
            // setMultiDeleteDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
