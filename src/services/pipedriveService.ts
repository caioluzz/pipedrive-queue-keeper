
import { Deal, ApiResponse, WebhookEvent, WebhookResponse } from '../types/pipedrive';
import { toast } from 'sonner';

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
    
    // In production with Make or n8n, you would create a webhook that:
    // 1. Handles authentication 
    // 2. Gets deals from Pipedrive API
    // 3. Returns them to your frontend
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`Fetching deals for pipeline ${config.pipelineId}, stage ${targetStageId}`);
    
    // Return deals from our array instead of mocks
    return DEALS.filter(deal => 
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
export const markDealAsCompleted = async (dealId: number): Promise<boolean> => {
  try {
    const config = getConfig();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Marking deal ${dealId} as completed`);
    
    // Remove the deal from our array
    const index = DEALS.findIndex(deal => deal.id === dealId);
    if (index !== -1) {
      DEALS.splice(index, 1);
    }
    
    // If webhook URL is configured, notify Pipedrive about the change
    if (config.webhookUrl) {
      await sendWebhookEvent({
        event: 'deal.completed',
        data: {
          id: dealId,
          title: "Deal completed via app",
          value: 0,
          stage_id: config.stageId,
          pipeline_id: config.pipelineId
        },
        timestamp: new Date().toISOString(),
        user: localStorage.getItem('currentUser') || 'unknown',
      });
    }
    
    // Use broadcast channel to notify other tabs/windows
    const channel = new BroadcastChannel('pipedrive_queue_updates');
    channel.postMessage({ type: 'DEALS_UPDATED' });
    channel.close();
    
    return true;
  } catch (error) {
    console.error("Error marking deal as completed:", error);
    toast.error("Falha ao marcar contrato como concluído");
    return false;
  }
};

// Remove a deal from the queue (without changing its status in Pipedrive)
export const removeDealFromQueue = async (dealId: number): Promise<boolean> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    console.log(`Removing deal ${dealId} from queue`);
    
    // Remove the deal from our array
    const index = DEALS.findIndex(deal => deal.id === dealId);
    if (index !== -1) {
      DEALS.splice(index, 1);
    }
    
    // Use broadcast channel to notify other tabs/windows
    const channel = new BroadcastChannel('pipedrive_queue_updates');
    channel.postMessage({ type: 'DEALS_UPDATED' });
    channel.close();
    
    return true;
  } catch (error) {
    console.error("Error removing deal from queue:", error);
    toast.error("Falha ao remover contrato da fila");
    return false;
  }
};

// Fetch signed contracts within a date range
export const fetchSignedContracts = async (startDate: Date, endDate: Date): Promise<Deal[]> => {
  try {
    // Get completed contracts from localStorage instead of mocks
    const completedContractsStr = localStorage.getItem('concluded_contracts');
    let completedContracts: Deal[] = [];
    
    if (completedContractsStr) {
      completedContracts = JSON.parse(completedContractsStr);
    }
    
    // Filter by date range
    return completedContracts.filter(deal => {
      const dealDate = new Date(deal.completed_at || deal.add_time);
      return dealDate >= startDate && dealDate <= endDate;
    });
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
      
      // Adicionar o contrato à nossa array de deals
      const newDeal: Deal = {
        id,
        title,
        customer_name: "Cliente via Webhook",
        salesperson_name: "Integração",
        salesperson_id: 999,
        value,
        currency: "BRL",
        add_time: new Date().toISOString(),
        status: "open",
        stage_id,
        stage_name: "Elaborar Contrato",
        pipeline_id
      };
      
      // Adicionar ao array apenas se ainda não existir
      if (!DEALS.some(deal => deal.id === id)) {
        DEALS.push(newDeal);
      }
      
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
