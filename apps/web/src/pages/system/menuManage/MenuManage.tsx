import { NestedDataTable } from "@/components/Table/nested-data";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { Input } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { SingleSelect } from "@/components/Select/single-select";
import {
  CirclePlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { axiosClient } from "@/lib/apiClient";
import { useEffect } from "react";
import { Switch } from "@ruoyi/ui";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ruoyi/ui";
import FormDialog from "@/pages/system/menuManage/dialog/Form";
import type { MenuNode } from "@/types/tree";
import { DialogDeleteConfirm } from "@/components/Dialog/delete-confirm";
import { useDictDataByTypeQuery } from "@/lib/dictQueries";

// 筛选条件
type Filters = {
  name: string;
  status: string;
};

// 将 filters 转换为 { id, value } 对象数组，这个类型是tanstack要求的
// 对于默认的筛选器函数，当传入的value是空字符串时，不进行筛选。
// 一定注意，这里的id，指的是columns中定义的列的id或key。
const extractFilterEntries = (filters: Filters) => {
  return Object.entries(filters).map(([key, val]) => ({
    id: key,
    value: val,
  }));
};

export default function MenuManage() {
  const [data, setData] = useState<MenuNode[]>([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuNode | undefined>(undefined);
  const [isCreate, setIsCreate] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    name: "",
    status: "",
  });

  const loadMenus = useCallback(() => {
    axiosClient.get<{ data: MenuNode[] }>("/system/menu/list").then((res) => {
      setData(res.data.data);
    });
  }, []);

  const deleteMenu = useCallback(async () => {
    return await axiosClient.delete(
      `/system/menu/delete?publicId=${activeMenu?.publicId}`,
    );
  }, [activeMenu]);

  useEffect(() => {
    loadMenus();
  }, []);

  const statusList = useDictDataByTypeQuery("status").data ?? [];

  const columns: ColumnDef<MenuNode, any>[] = [
    {
      accessorKey: "sortOrder",
      header: "顺序",
      cell: ({ row }) => row.original.sortOrder,
    },
    {
      accessorKey: "path",
      header: "路由地址",
      cell: ({ row }) => row.original.path || "-",
    },
    {
      accessorKey: "perms",
      header: "权限标识",
      cell: ({ row }) => row.original.perms || "-",
    },
    {
      accessorKey: "visible",
      header: "是否可见",
      cell: ({ row }) => {
        const isVisible = row.original.visible === "1";
        const stateClass = isVisible
          ? "bg-primary/10 border-primary text-primary"
          : "bg-muted border-input text-muted-foreground";
        return (
          <div
            className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border ${stateClass}`}
          >
            {isVisible ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isFrame",
      header: "是否外链",
      cell: ({ row }) => {
        const isFrame = row.original.isFrame === "1";
        const stateClass = isFrame
          ? "bg-primary/10 border-primary text-primary"
          : "bg-muted border-input text-muted-foreground";
        return (
          <div
            className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border ${stateClass}`}
          >
            {isFrame ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Switch
          checked={row.original.status == "1"}
          onCheckedChange={(checked) => {
            axiosClient
              .post("/system/menu/update", {
                publicId: row.original.publicId,
                status: checked ? "1" : "0",
              })
              .then((res) => {
                if (res.data.code === 200) {
                  toast.success(res.data.msg);
                  loadMenus();
                } else {
                  toast.error(res.data.msg);
                }
              })
              .catch((err) => {
                toast.error(err.response.data.msg);
              });
          }}
        />
      ),
    },
    {
      id: "actions",
      header: "操作",
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
                    setActiveMenu(row.original);
                    setIsCreate(true);
                    setOpenFormDialog(true);
                  }}
                >
                  <span className="grow">添加子菜单</span>
                  <CirclePlus />
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator className="my-1" /> */}
                <DropdownMenuItem
                  className="cursor-pointer gap-8"
                  onClick={() => {
                    setActiveMenu(row.original);
                    setIsCreate(false);
                    setOpenFormDialog(true);
                  }}
                >
                  <span className="grow">编辑菜单</span>
                  <Pencil />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="cursor-pointer gap-8"
                  onClick={() => {
                    console.log("row.original:", row.original);
                    setActiveMenu(row.original);
                    setOpenDeleteDialog(true);
                  }}
                >
                  <span className="grow text-destructive">删除</span>
                  <Trash2 className="text-destructive" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            placeholder="输入菜单名称"
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
            placeholder="请选择状态"
            options={statusList}
            value={filters.status}
            label="状态"
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setOpenFormDialog(true);
            setIsCreate(true);
            setActiveMenu(undefined);
          }}
        >
          <span>新增菜单</span>
          <CirclePlus />
        </Button>
      </div>

      <div className="w-full">
        <NestedDataTable
          firstColumnHeaderName="菜单名称"
          firstColumnKey="name"
          data={data}
          columns={columns}
          filterEntries={extractFilterEntries(filters)}
          getRowId={(r) => r.publicId}
          getSubRows={(r: MenuNode) => {
            return r.children.sort(
              (a: MenuNode, b: MenuNode) => a.sortOrder - b.sortOrder,
            );
          }}
        />
      </div>
      {openFormDialog && (
        <FormDialog
          open={openFormDialog}
          onOpenChange={() => {
            setOpenFormDialog(false);
            loadMenus();
          }}
          onSuccess={loadMenus}
          activeData={activeMenu}
          isCreate={isCreate}
        />
      )}
      {openDeleteDialog && (
        <DialogDeleteConfirm
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onSuccess={loadMenus}
          deleteApi={deleteMenu}
          title="删除菜单"
        >
          <span className="mb-2 block text-sm">
            确定要删除菜单
            <span className="mx-1 rounded-md border border-primary bg-primary/10 px-3 py-1">
              {activeMenu?.name}
            </span>
            吗？
          </span>
          <span className="block text-sm text-muted-foreground">
            注意：删除菜单后，该菜单下的所有子菜单将同时删除。
          </span>
        </DialogDeleteConfirm>
      )}
    </div>
  );
}
