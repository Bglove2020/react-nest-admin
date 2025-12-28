import { useCallback, useEffect, useState } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { useSearchParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ruoyi/ui";
import { Checkbox } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { DataTable } from "@/components/Table/data";
import { Switch } from "@ruoyi/ui";
import { MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { axiosClient } from "@/lib/apiClient";
import { type DictData, useDictDataByTypeQuery } from "@/lib/dictQueries";
import DictDataDialog from "./dialog/dict-data-dialog";
import { DialogDeleteConfirm } from "@/components/Dialog/delete-confirm";
import { SingleSelect } from "@/components/Select/single-select";

type DataFilters = {
  status: string;
};

const extractFilterEntries = (filters: Record<string, unknown>) =>
  Object.entries(filters).map(([key, val]) => ({
    id: key,
    value: val,
  }));

export default function DictDataPage() {
  const [searchParams] = useSearchParams();
  const dictName = searchParams.get("name") ?? "";
  const dictType = searchParams.get("type") ?? "";

  const [dataFilters, setDataFilters] = useState<DataFilters>({
    status: "",
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [dictDataList, setDictDataList] = useState<DictData[]>([]);
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [activeData, setActiveData] = useState<DictData | null>(null);
  const [dataIsCreate, setDataIsCreate] = useState(true);
  const [deleteDataDialogOpen, setDeleteDataDialogOpen] = useState(false);

  useEffect(() => {
    loadDictData();
  }, []);

  const loadDictData = useCallback(() => {
    axiosClient
      .get<{ data: DictData[] }>("/system/dict/data/list", {
        params: { type: dictType },
      })
      .then((res) => {
        setDictDataList(res.data.data);
      });
  }, [dictType]);

  const updateDataStatus = (id: string, status: boolean) => {
    axiosClient
      .post("/system/dict/data/update", {
        id,
        status: status ? "1" : "0",
      })
      .then((res) => {
        if (res.data.code === 200) {
          toast.success(res.data.msg);
          loadDictData();
        } else {
          toast.error(res.data.msg);
        }
      })
      .catch((err) => toast.error(String(err)));
  };

  const deleteDictData = useCallback(async () => {
    return axiosClient.delete(
      `/system/dict/data/delete/${activeData!.id}`,
    );
  }, [activeData]);

  const statusList = useDictDataByTypeQuery("status").data ?? [];

  const dataColumns: ColumnDef<DictData>[] = [
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
      accessorKey: "label",
      header: "字典标签",
      cell: ({ row }) => row.getValue("label"),
    },
    {
      accessorKey: "value",
      header: "字典键值",
      cell: ({ row }) => row.getValue("value"),
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
            updateDataStatus(row.original.id, checked)
          }
        />
      ),
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
                setActiveData(row.original);
                setDataIsCreate(false);
                setDataDialogOpen(true);
              }}
            >
              <span className="grow">编辑数据</span>
              <Pencil />
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              className="cursor-pointer gap-8"
              onClick={() => {
                setActiveData(row.original);
                setDeleteDataDialogOpen(true);
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
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex items-center gap-3">
          {/* <Button
            className="absolute left-[-42px]"
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </Button> */}
          <div className="flex-1 text-xl font-semibold">
            {dictName || "未命名字典"}
          </div>

          <div></div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 space-y-3 rounded-md sm:flex-row sm:flex-wrap sm:gap-4">
        <div className="flex w-full max-w-[260px] items-center gap-2">
          <SingleSelect
            className="w-full"
            placeholder="请选择状态"
            options={statusList}
            value={dataFilters.status}
            label="状态"
            onChange={(v) => setDataFilters((f) => ({ ...f, status: v }))}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setDataIsCreate(true);
            setActiveData(null);
            setDataDialogOpen(true);
          }}
        >
          <span>新增字典数据</span>
          <Plus />
        </Button>
        <Button variant="outline" onClick={loadDictData}>
          <span>刷新</span>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        filters={extractFilterEntries(dataFilters)}
        data={dictDataList}
        columns={dataColumns}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      {dataDialogOpen && (
        <DictDataDialog
          open={dataDialogOpen}
          onOpenChange={setDataDialogOpen}
          onSuccess={() => {
            loadDictData();
            setDataDialogOpen(false);
            setActiveData(null);
          }}
          isCreate={dataIsCreate}
          activeData={activeData}
          dictType={dictType}
        />
      )}

      {activeData && (
        <DialogDeleteConfirm
          open={deleteDataDialogOpen}
          onOpenChange={setDeleteDataDialogOpen}
          deleteApi={deleteDictData}
          onSuccess={() => {
            loadDictData();
            setDeleteDataDialogOpen(false);
            setActiveData(null);
          }}
          title="删除字典数据"
        >
          <span className="mb-2 block text-sm">
            确定要删除字典数据
            <span className="mx-1 rounded-md border border-primary bg-primary/10 px-3 py-1">
              {activeData.label}
            </span>
            吗？
          </span>
        </DialogDeleteConfirm>
      )}
    </div>
  );
}
