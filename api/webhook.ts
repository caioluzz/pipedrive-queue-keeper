import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/lib/supabase';
import { WebhookEvent } from '../src/types/pipedrive';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const webhookData = req.body as WebhookEvent;

    // Verificar se os dados necessários estão presentes
    if (!webhookData || !webhookData.data) {
      return res.status(400).json({ 
        status: "error",
        message: "Invalid webhook data"
      });
    }

    // Extrair os dados do webhook
    const { data } = webhookData;
    const { id, stage_id, pipeline_id, title, value, customer_name, salesperson_name } = data;

    // Inserir o novo contrato na tabela de contratos ativos
    const { error } = await supabase
      .from('active_contracts')
      .upsert({
        id,
        title,
        customer_name: customer_name || 'Cliente via Webhook',
        salesperson_name: salesperson_name || 'Integração',
        value,
        currency: 'BRL',
        stage_id,
        pipeline_id,
        created_at: new Date().toISOString(),
        status: 'open'
      });

    if (error) throw error;

    // Emitir evento em tempo real para todos os clientes
    await supabase
      .from('active_contracts')
      .select('*')
      .eq('id', id)
      .single();

    return res.status(200).json({
      status: "success",
      message: "Contract added to queue"
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
} 