import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import ManualReconciliation from "@/pages/ManualReconciliation";
import Upload from "@/pages/Upload";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/manual-reconciliation" component={ManualReconciliation} />
      <Route path="/upload" component={Upload} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <h2 className="text-xl font-semibold">Conciliação Pro</h2>
                  </div>
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
