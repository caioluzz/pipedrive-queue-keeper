import type { VercelRequest, VercelResponse } from '@vercel/node';

// Middleware para garantir que o body está sendo parseado corretamente
const parseBody = (req: VercelRequest) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      console.error('Erro ao parsear body:', e);
      return null;
    }
  }
  return req.body;
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Log inicial
  console.log('Webhook recebido');
  console.log('Método:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Log detalhado do body
  console.log('Body type:', typeof req.body);
  console.log('Body raw:', req.body);
  
  // Parsear o body
  const parsedBody = parseBody(req);
  console.log('Body parsed:', JSON.stringify(parsedBody, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verificar se o body é um objeto válido
    if (!parsedBody || typeof parsedBody !== 'object') {
      console.error('Body inválido:', parsedBody);
      return res.status(400).json({
        status: "error",
        message: "O corpo da requisição deve ser um objeto JSON válido"
      });
    }

    // Extrair os dados necessários
    const { data } = parsedBody;
    if (!data) {
      console.error('Dados não encontrados:', parsedBody);
      return res.status(400).json({
        status: "error",
        message: "Dados não encontrados no payload"
      });
    }

    // Verificar se é do pipeline e stage corretos
    const { pipeline_id, stage_id, title, value } = data;
    
    console.log('Pipeline ID:', pipeline_id);
    console.log('Stage ID:', stage_id);
    
    // Só processa se for do pipeline 4 e stage 20
    if (pipeline_id === 4 && stage_id === 20) {
      console.log('=== DADOS DO CONTRATO ===');
      console.log('Título:', title);
      console.log('Valor:', value);
      console.log('========================');

      // Aqui você pode adicionar o código para salvar no Supabase
      // Por exemplo:
      // await supabase.from('active_contracts').insert({
      //   title: title,
      //   value: value,
      //   currency: data.currency,
      //   created_at: new Date().toISOString(),
      //   status: 'open'
      // });

      return res.status(200).json({
        status: "success",
        message: "Contrato recebido e processado com sucesso",
        data: {
          title,
          value,
          currency: data.currency
        }
      });
    } else {
      console.log('Ignorando webhook - Pipeline ou Stage não correspondem aos critérios');
      return res.status(200).json({
        status: "success",
        message: "Webhook recebido mas ignorado - não atende aos critérios"
      });
    }

  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Erro interno do servidor",
      error: JSON.stringify(error)
    });
  }
};

export default handler; 