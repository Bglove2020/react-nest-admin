import type { MenuNode } from "@/types/tree";
import {
  NameField,
  SortOrderField,
  IsFrameField,
  PathField,
  VisibleField,
  StatusField,
  PermsField,
  ParentSelectField,
} from "./shared-fields";

interface MenuSubFormProps {
  isCreate: boolean;
  menuTree: MenuNode[];
}

export default function MenuSubForm({ isCreate, menuTree }: MenuSubFormProps) {
  return (
    <>
      {isCreate && (
        <ParentSelectField menuTree={menuTree} disabled={!isCreate} />
      )}
      <NameField label="菜单名称" placeholder="请输入菜单名称" />
      <PermsField />
      <SortOrderField />
      <IsFrameField />
      <PathField />
      <VisibleField />
      <StatusField />
    </>
  );
}
