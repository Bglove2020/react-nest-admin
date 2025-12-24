import { useFormContext, Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import { TreeSelect } from "@/components/Select/tree-select";
import type { TFormSchema } from "../schema/form.schema";
import type { MenuNode } from "@/types/tree";

// ============ 通用 Radio 选项配置 ============

type RadioOption = { value: string; label: string };

const YES_NO_OPTIONS: RadioOption[] = [
  { value: "1", label: "是" },
  { value: "0", label: "否" },
];

const STATUS_OPTIONS: RadioOption[] = [
  { value: "1", label: "正常" },
  { value: "0", label: "停用" },
];

// ============ 通用 Radio 字段组件 ============

interface RadioFieldProps {
  name: "status" | "visible" | "isFrame";
  label: string;
  options?: RadioOption[];
  idPrefix?: string;
}

function RadioField({
  name,
  label,
  options = YES_NO_OPTIONS,
  idPrefix = name,
}: RadioFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFormSchema>();

  return (
    <Field orientation="grid">
      <FieldLabel>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            className="flex flex-row gap-5"
          >
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`${idPrefix}-${opt.value}`}
                />
                <label
                  htmlFor={`${idPrefix}-${opt.value}`}
                  className="min-w-8 text-sm font-medium sm:min-w-10"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      {errors[name] && (
        <FieldError errors={[errors[name]]} className="col-start-2" />
      )}
    </Field>
  );
}

// ============ 预定义的 Radio 字段 ============

export function StatusField() {
  return (
    <RadioField
      name="status"
      label="菜单状态"
      options={STATUS_OPTIONS}
      idPrefix="status"
    />
  );
}

export function VisibleField() {
  return <RadioField name="visible" label="是否可见" idPrefix="visible" />;
}

export function IsFrameField() {
  return <RadioField name="isFrame" label="是否为外链" idPrefix="isFrame" />;
}

// ============ 输入框字段 ============

interface InputFieldProps {
  name: "name" | "perms" | "path" | "sortOrder";
  label: string;
  placeholder: string;
  type?: "text" | "number";
}

function InputField({
  name,
  label,
  placeholder,
  type = "text",
}: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFormSchema>();

  const registerOptions = type === "number" ? { valueAsNumber: true } : {};

  return (
    <Field orientation="grid">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, registerOptions)}
      />
      {errors[name] && (
        <FieldError errors={[errors[name]]} className="col-start-2" />
      )}
    </Field>
  );
}

// ============ 预定义的输入框字段 ============

interface NameFieldProps {
  label?: string;
  placeholder?: string;
}

export function NameField({
  label = "名称",
  placeholder = "请输入名称",
}: NameFieldProps) {
  return <InputField name="name" label={label} placeholder={placeholder} />;
}

export function PermsField() {
  return (
    <InputField name="perms" label="权限字符" placeholder="请输入权限字符" />
  );
}

export function PathField() {
  return (
    <InputField name="path" label="路由地址" placeholder="请输入路由地址" />
  );
}

export function SortOrderField() {
  return (
    <InputField
      name="sortOrder"
      label="排序号"
      placeholder="请输入排序号"
      type="number"
    />
  );
}

// ============ 树选择字段 ============

interface ParentSelectFieldProps {
  menuTree: MenuNode[];
  disabled?: boolean;
}

export function ParentSelectField({
  menuTree,
  disabled = false,
}: ParentSelectFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFormSchema>();

  return (
    <Field orientation="grid">
      <FieldLabel htmlFor="parentPublicId">父菜单</FieldLabel>
      <Controller
        name="parentPublicId"
        control={control}
        render={({ field }) => (
          <TreeSelect
            value={field.value}
            onChange={field.onChange}
            placeholder="请选择父菜单"
            data={menuTree}
            allowSelectParent={true}
            disabled={disabled}
          />
        )}
      />
      {errors.parentPublicId && (
        <FieldError errors={[errors.parentPublicId]} className="col-start-2" />
      )}
    </Field>
  );
}
