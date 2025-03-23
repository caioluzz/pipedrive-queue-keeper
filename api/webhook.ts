import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/lib/supabase';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { event, data } = req.body;

    // Verificar se os dados necessários estão presentes
    if (!data || !data.title || !data.value) {
      return res.status(400).json({ 
        status: "error",
        message: "Dados inválidos. É necessário enviar title e value"
      });
    }

    // Inserir o novo contrato na tabela de contratos ativos
    const { error } = await supabase
      .from('active_contracts')
      .insert({
        title: data.title,
        value: data.value,
        currency: 'BRL',
        created_at: new Date().toISOString(),
        status: 'open'
      });

    if (error) {
      console.error('Erro ao inserir no Supabase:', error);
      throw error;
    }

    return res.status(200).json({
      status: "success",
      message: "Contrato adicionado à fila",
      receivedData: data
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({
      status: "error",
      message: "Erro interno do servidor"
    });
  }
} 