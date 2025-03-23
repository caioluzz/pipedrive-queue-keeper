import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Criar cliente do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('Método:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { event, data } = req.body;

    console.log('Dados recebidos:', { event, data });

    // Verificar se os dados necessários estão presentes
    if (!data || !data.title || !data.value) {
      console.log('Dados inválidos:', data);
      return res.status(400).json({ 
        status: "error",
        message: "Dados inválidos. É necessário enviar title e value"
      });
    }

    // Verificar conexão com Supabase
    const { data: testData, error: testError } = await supabase
      .from('active_contracts')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Erro ao testar conexão com Supabase:', testError);
      throw new Error('Erro na conexão com Supabase');
    }

    console.log('Conexão com Supabase OK');

    // Inserir o novo contrato na tabela de contratos ativos
    const { data: insertedData, error } = await supabase
      .from('active_contracts')
      .insert({
        title: data.title,
        value: data.value,
        currency: 'BRL',
        created_at: new Date().toISOString(),
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir no Supabase:', error);
      throw error;
    }

    console.log('Dados inseridos com sucesso:', insertedData);

    return res.status(200).json({
      status: "success",
      message: "Contrato adicionado à fila",
      receivedData: data,
      insertedData
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Erro interno do servidor",
      details: error
    });
  }
} 