import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Log inicial
  console.log('Webhook recebido');
  console.log('Método:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Log detalhado do body
  console.log('Body type:', typeof req.body);
  console.log('Body raw:', req.body);
  
  // Tentar parsear o body se for string
  let parsedBody = req.body;
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body);
    } catch (e) {
      console.error('Erro ao parsear body:', e);
      return res.status(400).json({
        status: "error",
        message: "O corpo da requisição não é um JSON válido"
      });
    }
  }
  
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

    // Verificar se o body tem a estrutura esperada
    const { event, data } = parsedBody;
    if (!event || !data) {
      console.error('Estrutura inválida:', parsedBody);
      return res.status(400).json({
        status: "error",
        message: "O corpo da requisição deve conter 'event' e 'data'"
      });
    }

    // Verificar se os dados necessários estão presentes
    const { title, value } = data;
    if (!title || !value) {
      console.error('Dados incompletos:', data);
      return res.status(400).json({
        status: "error",
        message: "O objeto 'data' deve conter 'title' e 'value'"
      });
    }

    // Primeiro, vamos apenas retornar os dados recebidos para teste
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