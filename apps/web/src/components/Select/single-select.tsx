import * as React from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ruoyi/ui";

type SelectWithLabelProps = {
  className?: string;
  placeholder?: string;
  label?: string;
  options: { value: any; label: string }[];
  value?: any;
  canClear?: boolean;
  onChange: (value: any) => void;
};

export function SingleSelect({
  className,
  placeholder,
  label,
  options,
  value = "",
  canClear = true,
  onChange,
}: SelectWithLabelProps) {
  const [open, setOpen] = React.useState(false);
  const clearClickedRef = React.useRef(false);

  const handleClear = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearClickedRef.current = true;
    onChange("");
    setOpen(false);
    setTimeout(() => {
      clearClickedRef.current = false;
    }, 100);
  };

  return (
    <Select 
      value={value} 
      onValueChange={onChange}
      open={open}
      onOpenChange={(newOpen) => {
        if (clearClickedRef.current) return;
        setOpen(newOpen);
      }}
    >
      <div className={`w-full flex justify-between items-center ${className}`}>
      <SelectTrigger
        hasValue={!value || !canClear}
        className={`w-full relative ${canClear && value ? '[&>svg:last-child]:hidden' : ''}`}
      >
        <SelectValue placeholder={placeholder || "Select a fruit"} />

        {canClear && value && (
          <div
            className="cursor-pointer opacity-50 hover:opacity-100 z-10"
            onMouseDown={handleClear}
            onPointerDown={handleClear}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </SelectTrigger>
      </div>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label || "Options"}</SelectLabel>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
