
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Deal } from '@/types/pipedrive';
import { ArrowUpDown, FileCheck } from 'lucide-react';
import { format } from 'date-fns';

interface CompletedDeal extends Deal {
  completed_at?: string;
  completed_by?: string;
}

const ConcludedContracts = () => {
  const [contracts, setContracts] = useState<CompletedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'value'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Load concluded contracts from localStorage
    try {
      const savedContracts = localStorage.getItem('concluded_contracts');
      if (savedContracts) {
        setContracts(JSON.parse(savedContracts));
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load concluded contracts:', error);
      toast.error('Falha ao carregar contratos concluídos');
      setLoading(false);
    }
  }, []);

  // Sort contracts based on current sort settings
  const sortedContracts = [...contracts].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.completed_at || a.add_time).getTime();
      const dateB = new Date(b.completed_at || b.add_time).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === 'asc' ? a.value - b.value : b.value - a.value;
    }
  });

  // Toggle sort
  const toggleSort = (field: 'date' | 'value') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Calculate total value
  const totalValue = contracts.reduce((total, contract) => total + contract.value, 0);
  
  // Format currency
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Contratos Concluídos</h1>
        <p className="text-muted-foreground">
          Listagem de todos os contratos marcados como concluídos.
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-muted/40 rounded-lg p-8 text-center">
          <FileCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum contrato concluído</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Quando você marcar contratos como concluídos na página principal, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableCaption>
              Total: {formatCurrency(totalValue, contracts[0]?.currency || 'BRL')}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Concluído por</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center">
                    Data
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer"
                  onClick={() => toggleSort('value')}
                >
                  <div className="flex items-center justify-end">
                    Valor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.title}</TableCell>
                  <TableCell>{contract.salesperson_name}</TableCell>
                  <TableCell>{contract.completed_by || "Não informado"}</TableCell>
                  <TableCell>
                    {format(new Date(contract.completed_at || contract.add_time), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(contract.value, contract.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ConcludedContracts;
