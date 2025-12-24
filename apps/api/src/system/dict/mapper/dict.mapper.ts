import type { FrontendDictData, FrontendDictType } from '@ruoyi/contracts';
import { SysDict } from '../entities/dict.entity';
import { SysDictData } from '../entities/dict-data.entity';

export const toFrontendDictTypeDto = (
  entity: SysDict,
): FrontendDictType => ({
  publicId: entity.publicId,
  name: entity.name,
  type: entity.type,
  sortOrder: entity.sortOrder,
  status: entity.status,
  createTime: entity.createTime.toISOString(),
  updateTime: entity.updateTime.toISOString(),
});

export const toFrontendDictTypeDtos = (
  entities: SysDict[],
): FrontendDictType[] => entities.map(toFrontendDictTypeDto);

export const toFrontendDictDataDto = (
  entity: SysDictData,
): FrontendDictData => ({
  publicId: entity.publicId,
  label: entity.label,
  value: entity.value,
  sortOrder: entity.sortOrder,
  status: entity.status,
});

export const toFrontendDictDataDtos = (
  entities: SysDictData[],
): FrontendDictData[] => entities.map(toFrontendDictDataDto);
