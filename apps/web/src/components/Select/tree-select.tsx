import * as React from "react";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@ruoyi/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ruoyi/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ruoyi/ui";
import type { TreeNode } from "@/types/tree";

export type { TreeNode };

type TreeSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  data: TreeNode[];
  className?: string;
  disabled?: boolean;
  allowSelectParent?: boolean;
};

// 递归获取节点祖先节点数组
function getNodeAncestorsPublicIdArray(
  nodes: TreeNode[],
  publicId: string,
  path: string[] = []
): string[] {
  for (const node of nodes) {
    console.log("getNodeAncestorsPublicIdArray node:", node);
    if (node.publicId === publicId) {
      console.log("找到了对应的节点");
      return path;
    }
    const currentPath = [...path, node.publicId];
    if (node.children && node.children.length > 0) {
      const found = getNodeAncestorsPublicIdArray(
        node.children,
        publicId,
        currentPath
      );
      if (found.length>0) return found;
    }
  }
  return [];
}

// 根據publicId從data中找到對應的節點
function findNodeByPublicId(
  nodes: TreeNode[],
  publicId: string
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

// 树节点组件
function TreeNodeItem({
  node,
  level = 0,
  selectedPublicId,
  NodeAncestorsPublicIdArray,
  onSelect,
  allowSelectParent,
}: {
  node: TreeNode;
  level?: number;
  selectedPublicId?: string;
  NodeAncestorsPublicIdArray?: string[];
  onSelect: (id: string) => void;
  allowSelectParent?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(
    NodeAncestorsPublicIdArray?.includes(node.publicId)
  );
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.publicId === selectedPublicId;

  return (
    <div>
      {hasChildren ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {allowSelectParent ? (
            <div style={{ paddingLeft: `${level * 1 + 0.25}rem` }} aria-selected={isSelected}  className="aria-[selected=true]:bg-accent flex flex-row items-center gap-2 hover:bg-accent rounded-sm transition-colors px-2 py-1.5">
              <CollapsibleTrigger asChild>
                {/* <div
                  aria-expanded={isOpen}
                  className="group flex items-center gap-2   cursor-pointer "
                  style={{ paddingLeft: `${level * 1.5 + 0.25}rem` }}
                > */}
                  <ChevronRightIcon
                    aria-expanded={isOpen}
                    className={cn(
                      "w-3 h-3 aria-[expanded=true]:rotate-90 transform transition-transform duration-200 cursor-pointer"
                    )}
                  />
                {/* </div> */}
              </CollapsibleTrigger>
              <span className="flex-1 text-sm" onClick={() => onSelect(node.publicId)}>{node.name}</span>
              {isSelected && <CheckIcon className="w-4 h-4 text-primary" />}
            </div>
          ) : (
              <CollapsibleTrigger asChild>
                <div
                  aria-expanded={isOpen}
                  className="group flex items-center gap-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm transition-colors"
                  style={{ paddingLeft: `${level * 1 + 0.25}rem` }}
                >
                  <ChevronRightIcon
                    className={cn(
                      "w-3 h-3 group-aria-[expanded=true]:rotate-90 transform transition-transform duration-200 cursor-pointer"
                    )}
                  />
                  <span className="flex-1 text-sm">{node.name}</span>
                </div>
              </CollapsibleTrigger>
          )}
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div>
              {node.children!.map((child) => (
                <TreeNodeItem
                  key={child.publicId}
                  node={child}
                  level={level + 1}
                  selectedPublicId={selectedPublicId}
                  NodeAncestorsPublicIdArray={NodeAncestorsPublicIdArray}
                  onSelect={onSelect}
                  allowSelectParent={allowSelectParent}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div
          aria-selected={isSelected}
          className="flex items-center gap-2 py-1.5 rounded-sm hover:bg-accent transition-colors aria-[selected=true]:bg-accent"
          onClick={() => onSelect(node.publicId)}
          style={{ paddingLeft: `${level * 1+0.25}rem` }}
        >
          <div className="w-3" />
          <span className="flex-1 text-sm">{node.name}</span>
          {isSelected && <CheckIcon className="w-4 h-4 text-primary" />}
        </div>
      )}
    </div>
  );
}

export function TreeSelect({
  value,
  onChange,
  placeholder = "请选择",
  data,
  className,
  disabled,
  allowSelectParent = false,
}: TreeSelectProps) {
  // 如果value有值，获取此节点的祖先节点数组
  const NodeAncestorsPublicIdArray = value
    ? getNodeAncestorsPublicIdArray(data, value)
    : [];
  const displayText = value ? findNodeByPublicId(data, value)?.name : "";
  // 初始的展开状态为value对应的节点是否是当前节点的子节点
  const [open, setOpen] = React.useState(false);


  console.log(
    "value",
    value,
    "data",
    data,
    "NodeAncestorsPublicIdArray",
    NodeAncestorsPublicIdArray,
    "displayText",
    displayText
  );

  const handleSelect = (publicId: string) => {
    onChange?.(publicId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground group",
            className
          )}
        >
          <span className="truncate">{value ? displayText : placeholder}</span>
          <ChevronRightIcon className="ml-2 h-4 w-4 shrink-0 opacity-50 group-aria-[expanded=true]:rotate-90 transition-transform duration-200" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="max-h-[300px] overflow-y-auto p-1">
          {data.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              暂无数据
            </div>
          ) : (
            data.map((node) => (
              <TreeNodeItem
                key={node.publicId}
                node={node}
                selectedPublicId={value}
                NodeAncestorsPublicIdArray={NodeAncestorsPublicIdArray}
                onSelect={handleSelect}
                allowSelectParent={allowSelectParent}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
