import type { MenuNode } from "@/types/tree";
import {
  NameField,
  SortOrderField,
  StatusField,
  PermsField,
  ParentSelectField,
} from "./shared-fields";

interface ButtonSubFormProps {
  isCreate: boolean;
  menuTree: MenuNode[];
}

export default function ButtonSubForm({
  isCreate,
  menuTree,
}: ButtonSubFormProps) {
  return (
    <>
      {isCreate && (
        <ParentSelectField menuTree={menuTree} disabled={!isCreate} />
      )}
      <NameField label="按钮名称" placeholder="请输入按钮名称" />
      <PermsField />
      <SortOrderField />
      <StatusField />
    </>
  );
}
