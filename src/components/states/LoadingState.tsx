import { Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-sm">{message || t('loading')}</p>
    </div>
  );
}
