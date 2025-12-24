import { Loader2 } from "lucide-react";

export default function DialogLoading({ title }: { title?: string }) {
  return (
    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
    </div>
  );
}
