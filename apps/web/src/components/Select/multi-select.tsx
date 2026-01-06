import * as React from "react";
import { Button } from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@ruoyi/ui";
import { Separator } from "@ruoyi/ui";

type Option = { label: string; value: string };

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "请选择",
  searchPlaceholder = "搜索...",
  className,
  disabled,
}: MultiSelectProps) {
  const [query, setQuery] = React.useState("");

  const byValue = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const o of options) map.set(o.value, o.label);
    return map;
  }, [options]);

  // 过滤选项，根据查询字符串匹配标签。当查询字符串和数组变化时，重新过滤选项。
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (val: string, checked: boolean) => {
    const set = new Set(value);
    if (checked) set.add(val);
    else set.delete(val);
    onChange(Array.from(set));
  };

  const clearAll = () => onChange([]);
  const selectAllFiltered = () =>
    onChange(Array.from(new Set([...value, ...filtered.map((f) => f.value)])));
  const clearFiltered = () => {
    const filteredSet = new Set(filtered.map((f) => f.value));
    onChange(value.filter((v) => !filteredSet.has(v)));
  };

  const selectedLabels = value
    .map((v) => byValue.get(v))
    .filter(Boolean) as string[];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full px-3 font-normal ${className ?? ""}`}
          disabled={disabled}
        >
          <span className="flex w-full items-center gap-1.5 overflow-hidden text-left">
            {selectedLabels.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {selectedLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </>
            )}
          </span>
          <div className="flex shrink-0 flex-row items-center gap-2">
            <Separator
              orientation="vertical"
              className="my-1 data-[orientation=vertical]:h-5"
            />
            <span className="text-xs text-muted-foreground">
              已选 : {selectedLabels.length}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
        <div className="px-2 pt-2 pb-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="text-sm"
          />
        </div>
        <DropdownMenuGroup className="mx-2 mb-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            已选
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[200px] space-y-1 overflow-y-auto px-1 pr-2">
            {filtered
              .filter((opt) => value.includes(opt.value))
              .map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={true}
                  onCheckedChange={(checked) => toggle(opt.value, !!checked)}
                  // 这里需要阻止默认事件，防止选择元素时关闭下拉菜单
                  onSelect={(e) => e.preventDefault()}
                  className="gap-4 py-1 pl-8 data-[state=checked]:bg-muted data-[state=checked]:text-muted-foreground"
                >
                  {opt.label}
                </DropdownMenuCheckboxItem>
              ))}
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-4 mb-1" />
        <DropdownMenuGroup className="mx-2 mb-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            未选
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[200px] space-y-1 overflow-y-auto px-1 pr-2">
            {filtered
              .filter((opt) => !value.includes(opt.value))
              .map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={false}
                  onCheckedChange={(checked) => toggle(opt.value, !!checked)}
                  onSelect={(e) => e.preventDefault()}
                  className="gap-4 px-4 py-1 data-[state=checked]:bg-muted data-[state=checked]:text-muted-foreground"
                >
                  {opt.label}
                </DropdownMenuCheckboxItem>
              ))}
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-normal"
            onClick={clearAll}
            disabled={value.length === 0}
          >
            清空
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-normal"
            onClick={selectAllFiltered}
            disabled={filtered.length === 0}
          >
            选择筛选结果
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-normal"
            onClick={clearFiltered}
            disabled={filtered.length === 0}
          >
            清空筛选结果
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
