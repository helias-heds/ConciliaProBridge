import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, FileText, CheckCircle2 } from "lucide-react";

export default function Help() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Central de Ajuda</h1>
        <p className="text-muted-foreground">
          Encontre respostas para suas dúvidas sobre o sistema
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>
              Respostas para as dúvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Como funciona o algoritmo de conciliação?</AccordionTrigger>
                <AccordionContent>
                  O algoritmo compara transações baseado em três critérios principais: valor (correspondência exata),
                  data (com tolerância de ±2 dias) e descrição (usando análise de similaridade textual). 
                  Cada correspondência recebe uma pontuação de confiança de 0-100%.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Quais formatos de arquivo são aceitos?</AccordionTrigger>
                <AccordionContent>
                  O sistema aceita arquivos .OFX (Open Financial Exchange) e .CSV (Comma-Separated Values) 
                  para extratos bancários e de cartão de crédito. Para planilhas, utilizamos integração 
                  direta com Google Sheets.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>O que significa cada status de transação?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-chart-2 text-white border-chart-2">Conciliado</Badge>
                      <span className="text-sm">Transação encontrada em todas as fontes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-chart-3 text-white border-chart-3">Pendente Planilha</Badge>
                      <span className="text-sm">Apenas na planilha, aguardando confirmação bancária</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-chart-4 text-white border-chart-4">Pendente Extrato</Badge>
                      <span className="text-sm">Apenas no extrato, precisa ser registrado na planilha</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Como fazer correspondência manual?</AccordionTrigger>
                <AccordionContent>
                  No Dashboard, clique no botão "Correspondência Manual". Você verá as transações pendentes 
                  e poderá vincular manualmente aquelas que o algoritmo não conseguiu identificar automaticamente.
                  Revise os detalhes e confirme a correspondência.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Como conectar minha planilha do Google Sheets?</AccordionTrigger>
                <AccordionContent>
                  Na página "Upload de Arquivos", você encontrará a seção de conexão com Google Sheets.
                  Você precisará de uma chave API do Google Cloud Console e a URL da sua planilha.
                  Após inserir estas informações, clique em "Conectar Planilha".
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Guia de Início Rápido
            </CardTitle>
            <CardDescription>
              Primeiros passos com o Conciliação Pro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Conecte sua Planilha</h4>
                <p className="text-sm text-muted-foreground">
                  Configure a integração com Google Sheets para sincronizar seus lançamentos
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Faça Upload dos Extratos</h4>
                <p className="text-sm text-muted-foreground">
                  Importe seus extratos bancários e de cartão nos formatos OFX ou CSV
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Revise as Correspondências</h4>
                <p className="text-sm text-muted-foreground">
                  Verifique as transações conciliadas automaticamente e confirme correspondências manuais
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2 text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Exporte Relatórios</h4>
                <p className="text-sm text-muted-foreground">
                  Gere relatórios detalhados da conciliação para análise e auditoria
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precisa de Mais Ajuda?</CardTitle>
            <CardDescription>
              Entre em contato com nossa equipe de suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" data-testid="button-contact-support">
              Contatar Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
