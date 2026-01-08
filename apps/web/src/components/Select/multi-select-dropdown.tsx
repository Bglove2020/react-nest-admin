import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@ruoyi/ui";
import { Checkbox } from "@ruoyi/ui";
import { Badge } from "@ruoyi/ui";

export type Option = {
  label: string;
  value: string;
};

export interface MultiSelectDropdownProps {
  options: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;
}

export function MultiSelectDropdown({
  options,
  value = [],
  onChange,
  placeholder = "请选择",
  searchPlaceholder = "搜索...",
  className,
  disabled = false,
  maxDisplay = 3,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // 根据 value 数组获取选中的选项
  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => value.includes(option.value));
  }, [options, value]);

  // 过滤选项
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [options, searchQuery]);

  // 切换选项选中状态
  const toggleOption = (optionValue: string) => {
    if (disabled) return;

    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    onChange?.(newValue);
  };

  // 移除单个选项
  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    const newValue = value.filter((v) => v !== optionValue);
    onChange?.(newValue);
  };

  // 清空所有选项
  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.([]);
  };

  // 全选当前过滤结果
  const selectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    const filteredValues = filteredOptions.map((opt) => opt.value);
    const newValue = Array.from(new Set([...value, ...filteredValues]));
    onChange?.(newValue);
  };

  // 计算显示的标签数量
  const displayCount = Math.min(selectedOptions.length, maxDisplay);
  const remainingCount = selectedOptions.length - displayCount;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-9 w-full justify-between px-3 py-1",
            !value.length && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <div className="flex flex-1 flex-wrap gap-1.5 overflow-hidden">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {selectedOptions.slice(0, displayCount).map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="mr-0 gap-1 px-2 py-0.5 text-xs"
                  >
                    <span>{option.label}</span>
                    {!disabled && (
                      <button
                        type="button"
                        className="ml-1 rounded-full ring-offset-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            removeOption(option.value, e as any);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => removeOption(option.value, e)}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="mr-0 px-2 py-0.5 text-xs"
                  >
                    +{remainingCount}
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {selectedOptions.length > 0 && !disabled && (
              <button
                type="button"
                className="rounded-full ring-offset-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    clearAll(e as any);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => clearAll(e)}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="flex flex-col">
          {/* 搜索框 */}
          <div className="border-b p-2">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>

          {/* 操作按钮 */}
          {filteredOptions.length > 0 && (
            <div className="flex items-center justify-between border-b p-2">
              <span className="text-xs text-muted-foreground">
                已选择 {selectedOptions.length} / {options.length}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={selectAll}
                  disabled={filteredOptions.every((opt) =>
                    value.includes(opt.value),
                  )}
                >
                  全选
                </Button>
                {value.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={clearAll}
                  >
                    清空
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 选项列表 */}
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                未找到匹配项
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent",
                        isSelected && "bg-accent",
                      )}
                      onClick={() => toggleOption(option.value)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOption(option.value)}
                        className="pointer-events-none"
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
