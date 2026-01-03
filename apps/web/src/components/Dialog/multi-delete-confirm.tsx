import { Button } from "@ruoyi/ui"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ruoyi/ui"
import { useState } from "react"
import { axiosClient } from "@/lib/apiClient"
import { Loader2 } from "lucide-react"
import { toast } from 'sonner'
import qs from 'qs'

export function DialogMultiDeleteConfirm({
  open,
  onOpenChange,
  data,
  selected,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: {id: string, account: string}[];
  selected:Record<string, boolean>;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const accounts = (data || []).filter(row => selected[row.id]).map(row => row.account)

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const res = await axiosClient.delete(`system/user/delete-by-accounts?${qs.stringify({ "accounts": accounts }, { arrayFormat: 'repeat' })}`);
      if (res.data?.code === 200) {
        if(accounts.length <=2) {
          toast.success(`${accounts.join("、")} 删除成功！`);
        }
        else{
          toast.success(`${accounts.slice(0,2).join("、")} 等 ${accounts.length} 个用户删除成功！`);
        }
        onSuccess?.();
        onOpenChange(false)
      } else {
        console.error("用户删除失败", res);
        toast.error(res.data?.msg || "用户删除失败，请稍后重试。");
      }
    } catch (error) {
      console.error("删除用户时出错", error);
      toast.error("删除用户时出错，请稍后重试。");
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除用户</DialogTitle>
          <DialogDescription>
            {`确定要删除这 ${accounts.length} 个用户吗？`}
          </DialogDescription>
        </DialogHeader>
          <div className="flex flex-wrap gap-3 max-h-[30vh] overflow-auto py-2">
            {
            accounts.map((account) => (
              <div key={account} className="bg-primary/10 border border-primary rounded-md px-3 py-1 text-sm">
                {account}
              </div>
            ))
          }
          </div>
        <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
                onSubmit()
            }}
          >
            确定
          </Button>
          {isSubmitting && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">正在删除用户...</span>
                </div>
              </div>
            )}
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
