import * as React from "react"
import { Button } from "@ruoyi/ui"
import { Input } from "@ruoyi/ui"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@ruoyi/ui"
import {Separator} from "@ruoyi/ui"

type Option = { label: string; value: string }

type MultiSelectProps = {
  options: Option[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  maxTags?: number
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "请选择",
  searchPlaceholder = "搜索...",
  className,
  disabled,
}: MultiSelectProps) {
  const [query, setQuery] = React.useState("")

  const byValue = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const o of options) map.set(o.value, o.label)
    return map
  }, [options])

  // 过滤选项，根据查询字符串匹配标签。当查询字符串和数组变化时，重新过滤选项。
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) { return options }
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const toggle = (val: string, checked: boolean) => {
    const set = new Set(value)
    if (checked) set.add(val)
    else set.delete(val)
    onChange(Array.from(set))
  }

  const clearAll = () => onChange([])
  const selectAllFiltered = () => onChange(Array.from(new Set([...value, ...filtered.map((f) => f.value)])))
  const clearFiltered = () => {
    const filteredSet = new Set(filtered.map((f) => f.value))
    onChange(value.filter((v) => !filteredSet.has(v)))
  }

  const selectedLabels = value
    .map((v) => byValue.get(v))
    .filter(Boolean) as string[]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full px-3 ${className ?? ""}`}
          disabled={disabled}
        >
          <span className="flex w-full overflow-hidden items-center gap-1.5 text-left">
            {selectedLabels.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {selectedLabels.map((label) => (
                  <span
                    key={label}
                    className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs"
                  >
                    {label}
                  </span>
                ))}
              </>
            )}
          </span>
          <div className="shrink-0 flex flex-row items-center gap-2">
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-5 my-1" />
            <span className=" text-muted-foreground text-xs">已选 : {selectedLabels.length}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[280px] max-w-[400px]">
        <div className="pt-2 px-2 pb-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="text-sm"
          />
        </div>
        <DropdownMenuGroup className="mb-2 mx-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground">已选</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="space-y-1 max-h-[200px] overflow-y-auto px-1 pr-2">
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
        <DropdownMenuSeparator className="mx-4 mb-1"/>
        <DropdownMenuGroup className="mb-2 mx-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground">未选</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="space-y-1 max-h-[200px] overflow-y-auto px-1 pr-2">
            {filtered
            .filter((opt) => !value.includes(opt.value))
            .map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={false}   
                onCheckedChange={(checked) => toggle(opt.value, !!checked)}
                onSelect={(e) => e.preventDefault()}
                className="gap-4 py-1 px-4 data-[state=checked]:bg-muted data-[state=checked]:text-muted-foreground"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Button variant="outline" size="sm" className="text-xs" onClick={clearAll} disabled={value.length === 0}>
            清空
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={selectAllFiltered} disabled={filtered.length === 0}>
            选择筛选结果
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={clearFiltered} disabled={filtered.length === 0}>
            清空筛选结果
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}