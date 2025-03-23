
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { LS_PIPEDRIVE_WEBHOOK_URL, getConfig, simulateWebhook } from '@/services/pipedriveService';

const formSchema = z.object({
  webhookUrl: z.string().optional(),
});

const PipedriveSettings: React.FC = () => {
  const [isTestingWebhook, setIsTestingWebhook] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhookUrl: '',
    },
  });

  React.useEffect(() => {
    // Load saved values from localStorage
    const config = getConfig();
    form.setValue('webhookUrl', config.webhookUrl || '');
  }, [form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.webhookUrl) {
      localStorage.setItem(LS_PIPEDRIVE_WEBHOOK_URL, values.webhookUrl);
    } else {
      localStorage.removeItem(LS_PIPEDRIVE_WEBHOOK_URL);
    }
    
    toast.success('Configurações salvas com sucesso');
  };
  
  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      await simulateWebhook();
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="px-4 sm:container max-w-lg mx-auto py-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Webhook</CardTitle>
          <CardDescription>
            Configure a URL do webhook para integração com o Make ou outros serviços.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Webhook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://hook.eu1.make.com/yourwebhookid" {...field} />
                    </FormControl>
                    <FormDescription>
                      Configure este endpoint no Pipedrive para receber notificações quando um contrato entrar na etapa de elaboração.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-4">
                <Button type="submit" className="w-full">Salvar Configurações</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                >
                  {isTestingWebhook ? 'Testando...' : 'Testar Webhook (Simular Contrato Novo)'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t p-6">
          <h3 className="text-base font-medium mb-2">Integrando com o Make:</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Crie um novo cenário no Make</li>
            <li>Adicione um trigger "Webhook"</li>
            <li>Copie a URL do webhook gerado pelo Make</li>
            <li>Cole a URL no campo acima e salve</li>
            <li>Configure a integração com o Pipedrive no Make para processar os dados recebidos</li>
            <li>Quando um negócio for atualizado no Pipedrive, o webhook será disparado</li>
          </ol>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PipedriveSettings;
