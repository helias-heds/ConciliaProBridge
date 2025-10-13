import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, FileText, CheckCircle2 } from "lucide-react";

export default function Help() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to your questions about the system
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does the reconciliation algorithm work?</AccordionTrigger>
                <AccordionContent>
                  The algorithm compares transactions based on three main criteria: amount (exact match),
                  date (with ±2 day tolerance), and description (using text similarity analysis). 
                  Each match receives a confidence score from 0-100%.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>What file formats are accepted?</AccordionTrigger>
                <AccordionContent>
                  The system accepts .OFX (Open Financial Exchange) and .CSV (Comma-Separated Values) 
                  files for bank and credit card statements. For ledgers, we use direct integration 
                  with Google Sheets.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>What does each transaction status mean?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-chart-2 text-white border-chart-2">Reconciled</Badge>
                      <span className="text-sm">Transaction found in all sources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-chart-3 text-white border-chart-3">Pending Ledger</Badge>
                      <span className="text-sm">Only in ledger, awaiting bank confirmation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-chart-4 text-white border-chart-4">Pending Statement</Badge>
                      <span className="text-sm">Only in statement, needs to be recorded in ledger</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How do I do manual matching?</AccordionTrigger>
                <AccordionContent>
                  On the Dashboard, click the "Manual Match" button. You'll see pending transactions 
                  and can manually link those that the algorithm couldn't identify automatically.
                  Review the details and confirm the match.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>How do I connect my Google Sheets spreadsheet?</AccordionTrigger>
                <AccordionContent>
                  On the "File Upload" page, you'll find the Google Sheets connection section.
                  You'll need a Google Cloud Console API key and your spreadsheet URL.
                  After entering this information, click "Connect Spreadsheet".
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              First steps with Reconciliation Pro
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
                <h4 className="font-medium mb-1">Connect Your Spreadsheet</h4>
                <p className="text-sm text-muted-foreground">
                  Set up Google Sheets integration to sync your ledger entries
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
                <h4 className="font-medium mb-1">Upload Statements</h4>
                <p className="text-sm text-muted-foreground">
                  Import your bank and card statements in OFX or CSV formats
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
                <h4 className="font-medium mb-1">Review Matches</h4>
                <p className="text-sm text-muted-foreground">
                  Check automatically reconciled transactions and confirm manual matches
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
                <h4 className="font-medium mb-1">Export Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Generate detailed reconciliation reports for analysis and audit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              Contact our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" data-testid="button-contact-support">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
