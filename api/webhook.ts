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

    // Verificar se o body tem a estrutura esperada do Pipedrive
    const { event, data } = parsedBody;
    if (!event || !data) {
      console.error('Estrutura inválida:', parsedBody);
      return res.status(400).json({
        status: "error",
        message: "O corpo da requisição deve conter 'event' e 'data'"
      });
    }

    // Log detalhado dos dados recebidos
    console.log('=== DADOS RECEBIDOS DO PIPEDRIVE ===');
    console.log('Evento:', event);
    console.log('Dados completos:', JSON.stringify(data, null, 2));
    console.log('Estrutura dos dados:', Object.keys(data));
    console.log('=====================================');

    // Aqui você pode copiar os dados que aparecerem no log e me enviar
    // para eu implementar o tratamento específico que você precisar
    
    // Retornar sucesso
    return res.status(200).json({
      status: "success",
      message: "Webhook recebido com sucesso",
      receivedData: parsedBody
    });

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