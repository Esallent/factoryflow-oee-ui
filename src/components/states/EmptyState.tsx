import { FileX } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  message,
  icon 
}: EmptyStateProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon || <FileX className="h-16 w-16 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title || t('no_data')}</h3>
      <p className="text-muted-foreground text-sm max-w-md">{message}</p>
    </div>
  );
}
