import { CheckCircle2 } from "lucide-react";

interface SuccessStateProps {
  message: string;
}

export function SuccessState({ message }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <CheckCircle2 className="h-12 w-12 text-success mb-4" />
      <p className="text-foreground font-medium">{message}</p>
    </div>
  );
}
