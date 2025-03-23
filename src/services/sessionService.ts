import { supabase } from '@/lib/supabase';
import { ActiveSession } from '@/lib/supabase';

// Intervalo para atualizar o status online (30 segundos)
const HEARTBEAT_INTERVAL = 30000;

export const startSession = async (userId: string) => {
  try {
    const { data: session, error } = await supabase
      .from('active_sessions')
      .upsert({
        user_id: userId,
        last_active: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Iniciar heartbeat para manter a sessão ativa
    startHeartbeat(userId);

    return session;
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error);
    return null;
  }
};

export const endSession = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('active_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
  }
};

export const getActiveSessions = async (): Promise<ActiveSession[]> => {
  try {
    const { data, error } = await supabase
      .from('active_sessions')
      .select('*')
      // Considerar apenas sessões ativas nos últimos 2 minutos
      .gte('last_active', new Date(Date.now() - 120000).toISOString());

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar sessões ativas:', error);
    return [];
  }
};

let heartbeatInterval: NodeJS.Timeout | null = null;

const startHeartbeat = (userId: string) => {
  // Limpar intervalo anterior se existir
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  // Iniciar novo intervalo
  heartbeatInterval = setInterval(async () => {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro no heartbeat:', error);
    }
  }, HEARTBEAT_INTERVAL);
};

// Limpar heartbeat quando a janela for fechada
window.addEventListener('beforeunload', () => {
  const userId = localStorage.getItem('currentUser');
  if (userId) {
    endSession(userId);
  }
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
}); 