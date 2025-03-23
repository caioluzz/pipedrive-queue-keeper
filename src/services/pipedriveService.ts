import { Deal, ApiResponse, WebhookEvent, WebhookResponse } from '../types/pipedrive';
import { toast } from 'sonner';
import { getActiveContracts, markContractAsCompleted, removeContractFromQueue, getCompletedContracts } from './contractService';
import { supabase } from '@/lib/supabase';

// Local storage keys
export const LS_PIPEDRIVE_PIPELINE_ID = 'pipedrive_pipeline_id';
export const LS_PIPEDRIVE_STAGE_ID = 'pipedrive_stage_id';
export const LS_PIPEDRIVE_WEBHOOK_URL = 'pipedrive_webhook_url';

// Get API URL base
const API_BASE_URL = '/api';

// Empty array for deals instead of mocks
const DEALS: Deal[] = [];

// Helper to get configuration from localStorage
export const getConfig = () => {
  return {
    pipelineId: parseInt(localStorage.getItem(LS_PIPEDRIVE_PIPELINE_ID) || '4', 10), // Default pipeline ID
    stageId: parseInt(localStorage.getItem(LS_PIPEDRIVE_STAGE_ID) || '21', 10), // Default stage ID for 'Elaborar Contrato'
    webhookUrl: localStorage.getItem(LS_PIPEDRIVE_WEBHOOK_URL) || ''
  };
};

// In a real app, this would fetch from your backend that connects to Pipedrive API
export const fetchDealsByStage = async (stageId?: number): Promise<Deal[]> => {
  try {
    const config = getConfig();
    const targetStageId = stageId || config.stageId;
    
    // Buscar contratos ativos do Supabase
    const activeContracts = await getActiveContracts();
    
    // Filtrar apenas os contratos do stage correto
    return activeContracts.filter(deal => 
      deal.stage_id === targetStageId && 
      (deal.pipeline_id === undefined || deal.pipeline_id === config.pipelineId)
    );
  } catch (error) {
    console.error("Error fetching deals:", error);
    toast.error("Falha ao buscar contratos");
    return [];
  }
};

// Mark a deal as completed
export const markDealAsCompleted = async (dealId: number, currentUser: string): Promise<boolean> => {
  try {
    // Marcar como concluído usando o serviço de contratos
    const success = await markContractAsCompleted(dealId, currentUser);
    
    if (success) {
      // Use broadcast channel to notify other tabs/windows
      const channel = new BroadcastChannel('pipedrive_queue_updates');
      channel.postMessage({ type: 'DEALS_UPDATED' });
      channel.close();
    }
    
    return success;
  } catch (error) {
    console.error("Error marking deal as completed:", error);
    toast.error("Falha ao marcar contrato como concluído");
    return false;
  }
};

// Remove a deal from the queue (without changing its status in Pipedrive)
export const removeDealFromQueue = async (dealId: number): Promise<boolean> => {
  try {
    // Remover da fila usando o serviço de contratos
    const success = await removeContractFromQueue(dealId);
    
    if (success) {
      // Use broadcast channel to notify other tabs/windows
      const channel = new BroadcastChannel('pipedrive_queue_updates');
      channel.postMessage({ type: 'DEALS_UPDATED' });
      channel.close();
    }
    
    return success;
  } catch (error) {
    console.error("Error removing deal from queue:", error);
    toast.error("Falha ao remover contrato da fila");
    return false;
  }
};

// Fetch signed contracts within a date range
export const fetchSignedContracts = async (startDate: Date, endDate: Date): Promise<Deal[]> => {
  try {
    // Buscar contratos concluídos do Supabase
    const completedContracts = await getCompletedContracts(startDate, endDate);
    
    // Converter o formato do Supabase para o formato Deal
    return completedContracts.map(contract => ({
      id: contract.id,
      title: contract.title,
      customer_name: contract.customer_name,
      salesperson_name: contract.salesperson_name,
      salesperson_id: 999,
      value: contract.value,
      currency: contract.currency,
      add_time: contract.created_at,
      status: "completed",
      stage_id: 20,
      stage_name: "Elaborar Contrato",
      pipeline_id: 4,
      completed_at: contract.completed_at,
      completed_by: contract.completed_by
    }));
  } catch (error) {
    console.error("Error fetching signed contracts:", error);
    toast.error("Falha ao buscar contratos assinados");
    return [];
  }
};

// Send webhook event to Pipedrive or Make
export const sendWebhookEvent = async (eventData: WebhookEvent): Promise<boolean> => {
  try {
    const config = getConfig();
    
    if (!config.webhookUrl) {
      console.warn("No webhook URL configured");
      return false;
    }
    
    console.log(`Sending webhook event to ${config.webhookUrl}`, eventData);
    
    // This can work with Make or any other webhook service
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
      mode: 'no-cors', // Handle CORS issues in dev environment
    });
    
    // Since we're using no-cors, we won't get a response status
    console.log("Webhook event sent");
    return true;
  } catch (error) {
    console.error("Error sending webhook event:", error);
    toast.error("Falha ao enviar evento para o webhook");
    return false;
  }
};

// Register a webhook in Pipedrive or Make
export const registerWebhook = async (url: string): Promise<boolean> => {
  try {
    // Store the webhook URL in localStorage
    localStorage.setItem(LS_PIPEDRIVE_WEBHOOK_URL, url);
    
    // When integrating with Make:
    // 1. User creates a Make scenario with webhook trigger
    // 2. User copies the Make webhook URL
    // 3. User pastes it into your app
    // 4. Make will handle the incoming data from Pipedrive
    
    toast.success("Webhook registrado com sucesso");
    return true;
  } catch (error) {
    console.error("Error registering webhook:", error);
    toast.error("Falha ao registrar webhook");
    return false;
  }
};

// Process a webhook from Pipedrive
export const processWebhook = async (webhookData: WebhookEvent): Promise<WebhookResponse> => {
  try {
    const config = getConfig();
    
    console.log("Dados recebidos do Pipedrive:", webhookData);
    
    // Verificar se conseguimos obter os dados corretamente
    if (!webhookData || !webhookData.data) {
      return {
        status: "error",
        message: "No data received"
      };
    }
    
    // Extrair os dados do webhook
    const { data } = webhookData;
    const { id, stage_id, pipeline_id, title, value } = data;
    
    // Verificar se o negócio está na etapa correta do pipeline correto
    if (stage_id === config.stageId && pipeline_id === config.pipelineId) {
      console.log(`Nome do negocio: ${title}`);
      console.log(`Valor do negocio: R$ ${value}`);
      
      // Inserir o contrato no Supabase
      const { error } = await supabase
        .from('active_contracts')
        .insert({
          title: title,
          value: value,
          currency: "BRL",
          created_at: new Date().toISOString(),
          status: "open",
          pipedrive_id: id
        });

      if (error) throw error;
      
      // Notificar a interface sobre a chegada de um novo webhook
      const channel = new BroadcastChannel('pipedrive_queue_updates');
      channel.postMessage({ type: 'DEALS_UPDATED' });
      channel.close();
      
      return {
        status: "success",
        message: `Webhook recebido com sucesso! Nome: ${title}, Valor: ${value}`
      };
    } else {
      return {
        status: "ignored",
        message: `O negócio não está na etapa ${config.stageId} do pipeline ${config.pipelineId}.`
      };
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return {
      status: "error",
      message: `Error processing webhook: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Endpoint para testar o recebimento de um webhook
export const simulateWebhook = async (): Promise<boolean> => {
  try {
    const config = getConfig();
    
    // Gerar um ID único para o novo contrato simulado
    const newId = Math.floor(Math.random() * 100000) + 1000;
    
    // Criar um webhook simulado
    const simulatedWebhook: WebhookEvent = {
      event: "updated",
      data: {
        id: newId,
        title: "Contrato Simulado via Webhook",
        value: 50000,
        stage_id: config.stageId,
        pipeline_id: config.pipelineId
      },
      timestamp: new Date().toISOString()
    };
    
    // Processar o webhook simulado
    const response = await processWebhook(simulatedWebhook);
    
    if (response.status === "success") {
      toast.success("Webhook simulado processado com sucesso");
      return true;
    } else {
      toast.error(`Falha ao processar webhook simulado: ${response.message}`);
      return false;
    }
  } catch (error) {
    console.error("Error simulating webhook:", error);
    toast.error("Falha ao simular webhook");
    return false;
  }
};
