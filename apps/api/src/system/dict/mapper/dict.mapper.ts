import type { FrontendDictData, FrontendDictType } from '@ruoyi/contracts';
import { SysDict } from '../entities/dict.entity';
import { SysDictData } from '../entities/dict-data.entity';

export const toFrontendDictTypeDto = (entity: SysDict): FrontendDictType => ({
  id: entity.id,
  name: entity.name,
  type: entity.type,
  sortOrder: entity.sortOrder,
  status: entity.status,
  createTime:
    entity.createTime instanceof Date
      ? entity.createTime.toISOString()
      : (entity.createTime as unknown as string),
  updateTime:
    entity.updateTime instanceof Date
      ? entity.updateTime.toISOString()
      : (entity.updateTime as unknown as string),
});

export const toFrontendDictTypeDtos = (
  entities: SysDict[],
): FrontendDictType[] => entities.map(toFrontendDictTypeDto);

export const toFrontendDictDataDto = (
  entity: SysDictData,
): FrontendDictData => ({
  id: entity.id,
  label: entity.label,
  value: entity.value,
  sortOrder: entity.sortOrder,
  status: entity.status,
});

export const toFrontendDictDataDtos = (
  entities: SysDictData[],
): FrontendDictData[] => entities.map(toFrontendDictDataDto);
