import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Factory } from "lucide-react";

interface LineSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  lines?: { id: string; name: string }[];
}

export function LineSelector({ value, onValueChange, lines = [] }: LineSelectorProps) {
  // Mock data for demonstration
  const mockLines = lines.length > 0 ? lines : [
    { id: "line-1", name: "Production Line A" },
    { id: "line-2", name: "Production Line B" },
    { id: "line-3", name: "Assembly Line 1" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Factory className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[240px] bg-card border-border">
          <SelectValue placeholder="Select production line" />
        </SelectTrigger>
        <SelectContent>
          {mockLines.map((line) => (
            <SelectItem key={line.id} value={line.id}>
              {line.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
