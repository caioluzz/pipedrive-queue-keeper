import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Deal } from '@/types/pipedrive';
import { fetchDealsByStage, markDealAsCompleted, removeDealFromQueue } from '@/services/pipedriveService';
import { useLogin } from '@/contexts/LoginContext';
import QueueHeader from './QueueHeader';
import DealCard from './DealCard';
import EmptyQueue from './EmptyQueue';
import LoadingState from './LoadingState';

interface PipedriveQueueProps {
  stageId?: number;
  title: string;
  description: string;
  refreshInterval?: number; // in milliseconds
}

const PipedriveQueue: React.FC<PipedriveQueueProps> = ({
  stageId,
  title,
  description,
  refreshInterval = 60000 // Default to 1 minute
}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [processingDeals, setProcessingDeals] = useState<Set<number>>(new Set());
  const { currentUser } = useLogin();
  
  // Setup browser polling for real-time updates across multiple tabs/users
  useEffect(() => {
    const channel = new BroadcastChannel('pipedrive_queue_updates');
    
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'DEALS_UPDATED') {
        fetchDeals(false);
      }
    });
    
    return () => {
      channel.close();
    };
  }, []);
  
  // Fetch deals function
  const fetchDeals = useCallback(async (showRefreshing = true) => {
    if (showRefreshing) {
      setRefreshing(true);
    }
    
    try {
      const fetchedDeals = await fetchDealsByStage(stageId);
      setDeals(fetchedDeals);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch deals:', error);
      toast.error('Falha ao buscar contratos. Tente novamente.');
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  }, [stageId]);
  
  // Function to notify other tabs/windows of updates
  const notifyUpdates = useCallback(() => {
    const channel = new BroadcastChannel('pipedrive_queue_updates');
    channel.postMessage({ type: 'DEALS_UPDATED' });
    channel.close();
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchDeals(false);
    
    // Set up polling
    const intervalId = setInterval(() => {
      fetchDeals(false);
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetchDeals, refreshInterval]);
  
  // Handle completing a deal
  const handleCompleteDeal = async (dealId: number, currentUser: string) => {
    setProcessingDeals(prev => new Set(prev).add(dealId));
    
    try {
      const success = await markDealAsCompleted(dealId, currentUser);
      
      if (success) {
        // Remove the deal from the list with animation
        setDeals(deals.filter(deal => deal.id !== dealId));
        toast.success('Contrato marcado como concluído com sucesso');
        notifyUpdates();
      }
    } catch (error) {
      console.error('Failed to mark deal as completed:', error);
      toast.error('Falha ao marcar contrato como concluído');
    } finally {
      setProcessingDeals(prev => {
        const newSet = new Set(prev);
        newSet.delete(dealId);
        return newSet;
      });
    }
  };
  
  // Handle deleting a deal from the queue
  const handleDeleteDeal = async (dealId: number) => {
    setProcessingDeals(prev => new Set(prev).add(dealId));
    
    try {
      const success = await removeDealFromQueue(dealId);
      
      if (success) {
        // Remove the deal from the list with animation
        setDeals(deals.filter(deal => deal.id !== dealId));
        toast.success('Contrato removido da fila com sucesso');
        notifyUpdates();
      }
    } catch (error) {
      console.error('Failed to remove deal from queue:', error);
      toast.error('Falha ao remover contrato da fila');
    } finally {
      setProcessingDeals(prev => {
        const newSet = new Set(prev);
        newSet.delete(dealId);
        return newSet;
      });
    }
  };
  
  // Manual refresh handler
  const handleManualRefresh = () => {
    if (!refreshing) {
      fetchDeals(true);
    }
  };
  
  return (
    <div className="px-4 sm:container max-w-4xl mx-auto py-4 sm:p-6">
      <QueueHeader
        title={title}
        description={description}
        lastUpdated={lastUpdated}
        isRefreshing={refreshing}
        onRefresh={handleManualRefresh}
      />
      
      {loading ? (
        <LoadingState />
      ) : (
        <>
          {deals.length === 0 ? (
            <EmptyQueue />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence>
                {deals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onComplete={handleCompleteDeal}
                    onDelete={handleDeleteDeal}
                    isProcessing={processingDeals.has(deal.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PipedriveQueue;
