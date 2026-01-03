import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { axiosClient } from "./apiClient";
import type {
  FrontendDictData as DictData,
  FrontendDictType as DictType,
} from "@ruoyi/contracts";

export type { DictData, DictType };

// 通过字典类型直接获取字典数据（不需要 id）
async function fetchDictDataByType(dictType: string): Promise<DictData[]> {
  const res = await axiosClient.get<{
    data: { list: DictData[]; total: number };
  }>("/system/dict/data/list", {
    params: { type: dictType },
  });
  return res.data.data.list;
}

// 选项格式
export type DictOption = {
  label: string;
  value: string;
};

// 将字典数据转换为选项格式的工具函数
export function dictDataToOptions(
  dictData: DictData[],
  filterStatus = true,
): DictOption[] {
  let data = dictData;

  // 过滤掉停用的数据（status === "0"）
  if (filterStatus) {
    data = dictData.filter((item) => item.status === "1");
  }

  // 按排序号排序
  data = [...data].sort((a, b) => a.sortOrder - b.sortOrder);

  // 转换为选项格式
  return data.map((item) => ({
    label: item.label,
    value: item.value,
  }));
}

// 通过字典类型直接获取字典数据的 hook（推荐使用）
export function useDictDataByTypeQuery(
  dictType: string,
  enabled = true,
): UseQueryResult<DictData[]> {
  return useQuery({
    queryKey: ["dict-type", dictType],
    queryFn: () => fetchDictDataByType(dictType),
    enabled: enabled ?? true,
    retry: false,
    staleTime: 60_000,
  });
}
