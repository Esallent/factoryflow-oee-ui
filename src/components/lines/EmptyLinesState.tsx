import { EmptyState } from "@/components/ui/empty-state";
import { Factory } from "lucide-react";

interface EmptyLinesStateProps {
  onCreateLine: () => void;
}

export function EmptyLinesState({ onCreateLine }: EmptyLinesStateProps) {
  return (
    <EmptyState
      icon={Factory}
      title="No Active Lines"
      message="No active lines. Create one to start tracking production efficiency and equipment performance."
      actionLabel="Create First Line"
      onAction={onCreateLine}
    />
  );
}
