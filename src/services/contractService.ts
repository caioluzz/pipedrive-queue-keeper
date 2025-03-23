import { supabase } from '@/lib/supabase';
import { CompletedContract } from '@/lib/supabase';
import { Deal } from '@/types/pipedrive';

export const saveCompletedContract = async (deal: Deal, completedBy: string): Promise<boolean> => {
  try {
    const completedContract: CompletedContract = {
      id: deal.id,
      title: deal.title,
      customer_name: deal.customer_name,
      salesperson_name: deal.salesperson_name,
      value: deal.value,
      currency: deal.currency,
      completed_at: new Date().toISOString(),
      completed_by: completedBy,
      created_at: deal.add_time
    };

    const { error } = await supabase
      .from('completed_contracts')
      .upsert(completedContract);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao salvar contrato concluído:', error);
    return false;
  }
};

export const getCompletedContracts = async (startDate: Date, endDate: Date): Promise<CompletedContract[]> => {
  try {
    const { data, error } = await supabase
      .from('completed_contracts')
      .select('*')
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar contratos concluídos:', error);
    return [];
  }
};

export const getCompletedContractStats = async (): Promise<{
  total: number;
  totalValue: number;
  lastWeekCount: number;
  lastWeekValue: number;
}> => {
  try {
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    const { data, error } = await supabase
      .from('completed_contracts')
      .select('*');

    if (error) throw error;

    const contracts = data || [];
    const lastWeekContracts = contracts.filter(
      contract => new Date(contract.completed_at) >= lastWeekDate
    );

    return {
      total: contracts.length,
      totalValue: contracts.reduce((sum, contract) => sum + contract.value, 0),
      lastWeekCount: lastWeekContracts.length,
      lastWeekValue: lastWeekContracts.reduce((sum, contract) => sum + contract.value, 0)
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      total: 0,
      totalValue: 0,
      lastWeekCount: 0,
      lastWeekValue: 0
    };
  }
};

export const getActiveContracts = async (): Promise<Deal[]> => {
  try {
    const { data, error } = await supabase
      .from('active_contracts')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Converter o formato do Supabase para o formato Deal
    return (data || []).map(contract => ({
      id: contract.pipedrive_id,
      title: contract.title,
      customer_name: "Cliente via Webhook",
      salesperson_name: "Integração",
      salesperson_id: 999,
      value: contract.value,
      currency: contract.currency,
      add_time: contract.created_at,
      status: contract.status,
      stage_id: 20, // Stage de elaboração
      stage_name: "Elaborar Contrato",
      pipeline_id: 4 // Pipeline de contratos
    }));
  } catch (error) {
    console.error('Erro ao buscar contratos ativos:', error);
    return [];
  }
};

export const markContractAsCompleted = async (pipedriveId: number, completedBy: string): Promise<boolean> => {
  try {
    // Primeiro, buscar o contrato ativo
    const { data: activeContract, error: fetchError } = await supabase
      .from('active_contracts')
      .select('*')
      .eq('pipedrive_id', pipedriveId)
      .single();

    if (fetchError) throw fetchError;

    // Criar o contrato concluído
    const completedContract: CompletedContract = {
      id: activeContract.pipedrive_id,
      title: activeContract.title,
      customer_name: "Cliente via Webhook",
      salesperson_name: "Integração",
      value: activeContract.value,
      currency: activeContract.currency,
      completed_at: new Date().toISOString(),
      completed_by: completedBy,
      created_at: activeContract.created_at
    };

    // Inserir na tabela de contratos concluídos
    const { error: insertError } = await supabase
      .from('completed_contracts')
      .insert(completedContract);

    if (insertError) throw insertError;

    // Remover da tabela de contratos ativos
    const { error: deleteError } = await supabase
      .from('active_contracts')
      .delete()
      .eq('pipedrive_id', pipedriveId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Erro ao marcar contrato como concluído:', error);
    return false;
  }
};

export const removeContractFromQueue = async (pipedriveId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('active_contracts')
      .delete()
      .eq('pipedrive_id', pipedriveId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao remover contrato da fila:', error);
    return false;
  }
}; 