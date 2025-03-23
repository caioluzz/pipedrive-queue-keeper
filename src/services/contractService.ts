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