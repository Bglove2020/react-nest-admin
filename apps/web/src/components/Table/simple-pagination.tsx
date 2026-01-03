import { Button } from "@ruoyi/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ruoyi/ui";

interface SimplePaginationProps {
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
}

export function SimplePagination({
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: SimplePaginationProps) {
  const pageCount = Math.ceil(total / pageSize);
  const currentPage = pageIndex + 1; // 显示时转为 1-based

  return (
    <div className="flex items-center justify-between py-4">
      {/* 左侧：每页几行，共多少页 */}
      <div className="flex items-center gap-2 text-sm">
        <span>每页</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
          disabled={loading}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
        <span>行，共 {pageCount || 1} 页</span>
      </div>

      {/* 右侧：前进后退按钮 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 中间：当前页码 */}
        <div className="text-sm text-muted-foreground"> {currentPage} </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1 || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
