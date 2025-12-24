import { useFormContext } from "react-hook-form";
import type { TFormSchema } from "../schema/form.schema";
import {
  NameField,
  SortOrderField,
  IsFrameField,
  PathField,
  VisibleField,
  StatusField,
} from "./shared-fields";

export default function CatalogSubForm() {
  const { watch } = useFormContext<TFormSchema>();
  const isFrame = watch("isFrame");

  return (
    <>
      <NameField label="目录名称" placeholder="请输入目录名称" />
      <SortOrderField />
      <IsFrameField />
      {isFrame === "1" && <PathField />}
      <VisibleField />
      <StatusField />
    </>
  );
}
