import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Log dos dados recebidos
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    // Retornar os dados recebidos
    return res.status(200).json({
      status: "success",
      message: "Dados recebidos com sucesso",
      receivedData: {
        headers: req.headers,
        body: req.body
      }
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
} 