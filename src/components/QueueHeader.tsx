
import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueHeaderProps {
  title: string;
  description: string;
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const QueueHeader: React.FC<QueueHeaderProps> = ({
  title,
  description,
  lastUpdated,
  isRefreshing,
  onRefresh
}) => {
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(lastUpdated);

  return (
    <div className="mb-8 space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Atualizado às {formattedTime}</span>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors",
            isRefreshing && "opacity-70 cursor-not-allowed"
          )}
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isRefreshing && "animate-spin"
          )} />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </button>
      </div>
    </div>
  );
};

export default QueueHeader;
