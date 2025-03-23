import type { VercelRequest, VercelResponse } from '@vercel/node';

interface DealData {
  deal: {
    title: string;
    value: number;
    created_at: string;
  }
}

// Array temporário para armazenar os contratos (será substituído por banco de dados depois)
let contractsQueue: DealData[] = [];

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Verificar se é uma requisição POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data: DealData = request.body;

    // Validar os dados recebidos
    if (!data.deal || !data.deal.title || typeof data.deal.value !== 'number') {
      return response.status(400).json({ error: 'Invalid data format' });
    }

    // Adicionar à fila de contratos
    contractsQueue.push(data);

    // Log para debug
    console.log('Novo contrato adicionado:', data);

    return response.status(200).json({ 
      success: true,
      message: 'Contract added to queue',
      queueSize: contractsQueue.length
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
} 