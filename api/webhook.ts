import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Log inicial
  console.log('Webhook recebido');
  console.log('Método:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Log detalhado do body
  console.log('Body type:', typeof req.body);
  console.log('Body raw:', req.body);
  console.log('Body parsed:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verificar se o body é um objeto válido
    if (!req.body || typeof req.body !== 'object') {
      console.error('Body inválido:', req.body);
      return res.status(400).json({
        status: "error",
        message: "O corpo da requisição deve ser um objeto JSON válido"
      });
    }

    // Verificar se o body tem as propriedades necessárias
    const { title, value } = req.body;
    if (!title || !value) {
      console.error('Dados incompletos:', req.body);
      return res.status(400).json({
        status: "error",
        message: "O corpo da requisição deve conter 'title' e 'value'"
      });
    }

    // Primeiro, vamos apenas retornar os dados recebidos para teste
    return res.status(200).json({
      status: "success",
      message: "Webhook recebido com sucesso",
      receivedData: req.body
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