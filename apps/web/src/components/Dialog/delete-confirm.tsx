import { Button } from "@ruoyi/ui";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ruoyi/ui";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ApiCode, type ApiResponse } from "@ruoyi/contracts";

export function DialogDeleteConfirm({
  open,
  onOpenChange,
  onSuccess,
  title,
  deleteApi,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  title?: string;
  deleteApi: () => Promise<{ data: ApiResponse<unknown> }>;
  children?: React.ReactNode;
}) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await deleteApi();
      if (res.data.code === ApiCode.SUCCESS) {
        toast.success(res.data.msg);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(res.data.msg);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || err?.message || "操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-foreground mt-2">
            {children}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onSubmit();
            }}
          >
            确定
          </Button>
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  正在删除用户...
                </span>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
