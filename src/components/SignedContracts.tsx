
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Deal } from '@/types/pipedrive';
import { fetchSignedContracts } from '@/services/pipedriveService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { CalendarIcon, Download, FileSpreadsheet, Search } from 'lucide-react';

const SignedContracts: React.FC = () => {
  const [contracts, setContracts] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [csvDownloading, setCsvDownloading] = useState(false);

  // Group contracts by date
  const contractsByDate = contracts.reduce((acc, contract) => {
    const date = format(new Date(contract.add_time), 'dd/MM/yyyy', { locale: ptBR });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(contract);
    return acc;
  }, {} as Record<string, Deal[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(contractsByDate).sort((a, b) => {
    const dateA = new Date(a.split('/').reverse().join('-'));
    const dateB = new Date(b.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const result = await fetchSignedContracts(startDate, endDate);
      setContracts(result);
    } catch (error) {
      console.error("Error fetching signed contracts:", error);
      toast.error("Falha ao buscar contratos assinados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContracts();
  };

  const totalValue = contracts.reduce((sum, contract) => sum + contract.value, 0);
  const formattedTotalValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

  const exportToCsv = () => {
    setCsvDownloading(true);
    try {
      // Create CSV content
      const headers = ['Título', 'Cliente', 'Vendedor', 'Data', 'Valor'];
      const rows = contracts.map(contract => [
        contract.title,
        contract.customer_name,
        contract.salesperson_name,
        format(new Date(contract.add_time), 'dd/MM/yyyy', { locale: ptBR }),
        contract.value.toString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Name the file with the date range
      const fileName = `contratos_assinados_${format(startDate, 'dd-MM-yyyy')}_a_${format(endDate, 'dd-MM-yyyy')}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Arquivo CSV exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Falha ao exportar arquivo CSV');
    } finally {
      setCsvDownloading(false);
    }
  };

  return (
    <div className="px-4 sm:container max-w-4xl mx-auto py-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">Contratos Assinados</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtrar por período</CardTitle>
          <CardDescription>Selecione o período para visualizar os contratos assinados</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="grid gap-2 flex-1">
              <label htmlFor="startDate" className="text-sm font-medium">Data inicial</label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={format(startDate, 'yyyy-MM-dd')}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="w-full"
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="grid gap-2 flex-1">
              <label htmlFor="endDate" className="text-sm font-medium">Data final</label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={format(endDate, 'yyyy-MM-dd')}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="w-full"
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              {contracts.length > 0 && (
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full sm:w-auto" 
                  onClick={exportToCsv}
                  disabled={csvDownloading}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando contratos...</p>
        </div>
      ) : (
        <>
          <div className="bg-primary/10 rounded-lg p-4 mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-medium">Total de contratos: {contracts.length}</h3>
              <p className="text-sm text-muted-foreground">
                Período: {format(startDate, 'dd/MM/yyyy')} até {format(endDate, 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor total</p>
              <p className="text-xl font-bold text-primary">{formattedTotalValue}</p>
            </div>
          </div>
          
          {contracts.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-lg text-muted-foreground">Nenhum contrato assinado encontrado neste período</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(date => (
                <div key={date} className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2">{date}</h3>
                  {contractsByDate[date].map(contract => (
                    <Card key={contract.id} className="overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-base sm:text-lg mb-1">{contract.title}</h3>
                            <p className="text-sm text-muted-foreground">{contract.customer_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Vendedor: {contract.salesperson_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary text-lg sm:text-xl">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: contract.currency,
                              }).format(contract.value)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SignedContracts;
