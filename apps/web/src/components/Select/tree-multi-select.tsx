import * as React from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@ruoyi/ui";
import { Collapsible, CollapsibleContent } from "@ruoyi/ui";
import type { TreeNode } from "@/types/tree";

export type { TreeNode };

type TreeMultiSelectProps = {
  value?: string[]; // 选中的 publicId 数组
  onChange?: (value: string[]) => void; // 选择变化回调
  data: TreeNode[]; // 树形数据
  className?: string; // 自定义样式
  disabled?: boolean; // 是否禁用
  allowSelectParent?: boolean; // 是否允许选择父节点（默认 true）
  defaultExpanded?: string[]; // 默认展开的节点 ID 数组
  maxHeight?: string; // 容器最大高度（可选，用于滚动）
};

type NodeState = "checked" | "indeterminate" | "unchecked";

// 获取节点的所有后代节点 ID（包括自身）
function getAllDescendantIds(node: TreeNode): string[] {
  const ids: string[] = [node.publicId];
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      ids.push(...getAllDescendantIds(child));
    });
  }
  return ids;
}

// 根据 publicId 从 data 中找到对应的节点
function findNodeByPublicId(
  nodes: TreeNode[],
  publicId: string,
): TreeNode | null {
  for (const node of nodes) {
    if (node.publicId === publicId) {
      return node;
    } else if (node.children) {
      const found = findNodeByPublicId(node.children, publicId);
      if (found) return found;
    }
  }
  return null;
}

// 计算节点的选择状态
function calculateNodeState(
  node: TreeNode,
  selectedIds: Set<string>,
): NodeState {
  const isSelected = selectedIds.has(node.publicId);
  const hasChildren = node.children && node.children.length > 0;

  if (!hasChildren) {
    return isSelected ? "checked" : "unchecked";
  }

  // 对于有子节点的节点，需要检查所有子节点的状态
  let checkedCount = 0;
  let indeterminateCount = 0;

  node.children!.forEach((child) => {
    const childState = calculateNodeState(child, selectedIds);
    if (childState === "checked") {
      checkedCount++;
    } else if (childState === "indeterminate") {
      indeterminateCount++;
    }
  });

  const totalChildren = node.children!.length;

  if (checkedCount === totalChildren) {
    // 所有子节点都被选中，父节点应该是选中状态
    return isSelected ? "checked" : "checked";
  } else if (checkedCount > 0 || indeterminateCount > 0) {
    // 部分子节点被选中，父节点应该是半选状态
    return "indeterminate";
  } else {
    // 没有子节点被选中
    return isSelected ? "checked" : "unchecked";
  }
}

// 树节点组件
function TreeNodeItem({
  node,
  level = 0,
  selectedIds,
  expandedIds,
  onToggleExpand,
  onToggleSelect,
  disabled,
  allowSelectParent,
  data,
}: {
  node: TreeNode;
  level?: number;
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  disabled?: boolean;
  allowSelectParent?: boolean;
  data: TreeNode[];
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.publicId);
  const nodeState = calculateNodeState(node, selectedIds);
  const isChecked = nodeState === "checked";
  const isIndeterminate = nodeState === "indeterminate";

  // Radix UI Checkbox 支持 checked="indeterminate" 来显示半选状态
  const checkedState = isIndeterminate ? "indeterminate" : isChecked;

  // 如果节点没有子节点，且不允许选择父节点，则不允许选择
  const canSelect = allowSelectParent || !hasChildren;

  const handleCheckboxChange = (checked: boolean) => {
    if (!canSelect) return;
    onToggleSelect(node.publicId, checked);
  };

  const handleNodeNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(node.publicId);
    }
  };

  const handleExpandIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(node.publicId);
    }
  };

  return (
    <div>
      {hasChildren ? (
        <Collapsible
          open={isExpanded}
          onOpenChange={() => onToggleExpand(node.publicId)}
        >
          <div
            className={cn(
              "flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors",
              "hover:bg-accent",
            )}
            style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
          >
            <ChevronRightIcon
              className={cn(
                "h-4 w-4 shrink-0 cursor-pointer transition-transform duration-200",
                isExpanded && "rotate-90",
              )}
              onClick={handleExpandIconClick}
            />
            <Checkbox
              checked={checkedState}
              onCheckedChange={handleCheckboxChange}
              disabled={disabled || !canSelect}
            />
            <span
              className="flex-1 cursor-pointer text-sm select-none"
              onClick={handleNodeNameClick}
            >
              {node.name}
            </span>
          </div>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div>
              {node.children!.map((child) => (
                <TreeNodeItem
                  key={child.publicId}
                  node={child}
                  level={level + 1}
                  selectedIds={selectedIds}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                  onToggleSelect={onToggleSelect}
                  disabled={disabled}
                  allowSelectParent={allowSelectParent}
                  data={data}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors",
            "hover:bg-accent",
          )}
          style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
        >
          <div className="w-4 shrink-0" />
          <Checkbox
            checked={checkedState}
            onCheckedChange={handleCheckboxChange}
            disabled={disabled}
          />
          <span
            className="flex-1 cursor-pointer text-sm select-none"
            onClick={handleNodeNameClick}
          >
            {node.name}
          </span>
        </div>
      )}
    </div>
  );
}

export function TreeMultiSelect({
  value = [],
  onChange,
  data,
  className,
  disabled = false,
  allowSelectParent = true,
  defaultExpanded = [],
  maxHeight,
}: TreeMultiSelectProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(value),
  );
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    new Set(defaultExpanded),
  );

  // 当外部 value 变化时，同步内部状态
  // 使用 JSON.stringify 来比较数组内容，避免因引用变化导致不必要的更新
  const valueStr = React.useMemo(() => {
    const sorted = value ? [...value].sort() : [];
    return JSON.stringify(sorted);
  }, [value]);
  React.useEffect(() => {
    setSelectedIds(new Set(value || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueStr]);

  // 切换展开/折叠状态
  const handleToggleExpand = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // 切换选择状态
  const handleToggleSelect = React.useCallback(
    (id: string, checked: boolean) => {
      const node = findNodeByPublicId(data, id);
      if (!node) return;

      setSelectedIds((prev) => {
        const newSelectedIds = new Set(prev);
        const descendantIds = getAllDescendantIds(node);

        if (checked) {
          // 选中节点及其所有子节点
          descendantIds.forEach((descendantId) => {
            newSelectedIds.add(descendantId);
          });
        } else {
          // 取消选中节点及其所有子节点
          descendantIds.forEach((descendantId) => {
            newSelectedIds.delete(descendantId);
          });
        }

        // 更新所有祖先节点的状态
        // 从根节点开始，重新计算所有节点的状态
        const updateAncestors = (nodes: TreeNode[]) => {
          nodes.forEach((n) => {
            if (n.children && n.children.length > 0) {
              // 检查所有子节点是否都被选中
              const allChildrenSelected = n.children.every((child) => {
                const childState = calculateNodeState(child, newSelectedIds);
                return childState === "checked";
              });

              // 检查是否有子节点被选中（包括半选）
              const hasSelectedChildren = n.children.some((child) => {
                const childState = calculateNodeState(child, newSelectedIds);
                return (
                  childState === "checked" || childState === "indeterminate"
                );
              });

              if (allChildrenSelected) {
                // 所有子节点都被选中，选中父节点
                newSelectedIds.add(n.publicId);
              } else if (hasSelectedChildren) {
                // 有子节点被选中，但不全选，父节点保持半选状态（不添加到 selectedIds）
                newSelectedIds.add(n.publicId);
                // 半选状态通过 calculateNodeState 计算得出
              } else {
                // 没有子节点被选中，取消选中父节点
                newSelectedIds.delete(n.publicId);
              }

              // 递归处理子节点
              updateAncestors(n.children);
            }
          });
        };

        updateAncestors(data);

        // 通知外部
        const selectedArray = Array.from(newSelectedIds);
        onChange?.(selectedArray);

        return newSelectedIds;
      });
    },
    [data, onChange],
  );

  return (
    <div
      className={cn("w-full", className)}
      style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
    >
      {data.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          暂无数据
        </div>
      ) : (
        <div className="p-0.5">
          {data.map((node) => (
            <TreeNodeItem
              key={node.publicId}
              node={node}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
              onToggleSelect={handleToggleSelect}
              disabled={disabled}
              allowSelectParent={allowSelectParent}
              data={data}
            />
          ))}
        </div>
      )}
    </div>
  );
}
