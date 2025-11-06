import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface SuccessStateProps {
  message: string;
}

export function SuccessState({ message }: SuccessStateProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <CheckCircle2 className="h-12 w-12 text-success mb-4" />
      <p className="text-foreground font-medium">{message || t('success')}</p>
    </div>
  );
}
