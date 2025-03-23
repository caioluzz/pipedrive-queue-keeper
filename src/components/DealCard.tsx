import React, { useState } from 'react';
import { Deal } from '@/types/pipedrive';
import { Check, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLogin } from '@/contexts/LoginContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DealCardProps {
  deal: Deal;
  onComplete: (id: number, currentUser: string) => void;
  onDelete: (id: number) => void;
  isProcessing: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onComplete, onDelete, isProcessing }) => {
  const { currentUser } = useLogin();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: deal.currency,
  }).format(deal.value);

  const handleComplete = () => {
    try {
      // Save to localStorage when marking as complete
      const existingData = localStorage.getItem('concluded_contracts');
      const concludedContracts = existingData ? JSON.parse(existingData) : [];
      
      // Add current timestamp and user to the deal
      const dealWithTimestamp = {
        ...deal,
        completed_at: new Date().toISOString(),
        completed_by: currentUser || 'Usuário não identificado'
      };
      
      // Add to the beginning of the array
      concludedContracts.unshift(dealWithTimestamp);
      
      // Save back to localStorage
      localStorage.setItem('concluded_contracts', JSON.stringify(concludedContracts));
      
      // Call the original onComplete function with currentUser
      onComplete(deal.id, currentUser || 'Usuário não identificado');
    } catch (error) {
      console.error('Failed to save concluded contract:', error);
      toast.error('Falha ao salvar contrato concluído');
      // Still try to mark as complete in the UI
      onComplete(deal.id, currentUser || 'Usuário não identificado');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="relative group"
    >
      <div className="p-4 sm:p-6 rounded-xl bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-card">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1 overflow-hidden">
            <h3 className="font-medium text-base sm:text-lg truncate">{deal.title}</h3>
            
            <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
              <User className="h-3 w-3" />
              <span className="truncate">{deal.salesperson_name}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
              aria-label="Excluir contrato"
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleComplete}
              disabled={isProcessing}
              size="icon"
              className={cn(
                "bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-200",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Marcar como concluído"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end items-center">
          <span className="font-semibold text-primary text-sm sm:text-base">{formattedValue}</span>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contrato da fila?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita. O contrato será removido da fila, mas permanecerá no Pipedrive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(deal.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default DealCard;
