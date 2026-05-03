import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Forecasts from "@/pages/forecasts";
import Expiry from "@/pages/expiry";
import Alerts from "@/pages/alerts";
import Crisis from "@/pages/crisis";
import Landing from "@/pages/landing";
import Clients from "@/pages/clients";
import Onboarding from "@/pages/onboarding";
import HospitalSettings from "@/pages/settings";
import { ErrorBoundary } from "@/components/error-boundary.tsx";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app">
        {() => (
          <Layout>
            <ErrorBoundary>
              <Switch>
                <Route path="/app" component={Dashboard} />
                <Route path="/app/inventory" component={Inventory} />
                <Route path="/app/forecasts" component={Forecasts} />
                <Route path="/app/expiry" component={Expiry} />
                <Route path="/app/alerts" component={Alerts} />
                <Route path="/app/crisis" component={Crisis} />
                <Route path="/app/clients" component={Clients} />
                <Route path="/app/onboarding" component={Onboarding} />
                <Route path="/app/settings" component={HospitalSettings} />
              </Switch>
            </ErrorBoundary>
          </Layout>
        )}
      </Route>
      <Route path="/app/:rest*">
        {() => (
          <Layout>
            <ErrorBoundary>
              <Switch>
                <Route path="/app/inventory" component={Inventory} />
                <Route path="/app/forecasts" component={Forecasts} />
                <Route path="/app/expiry" component={Expiry} />
                <Route path="/app/alerts" component={Alerts} />
                <Route path="/app/crisis" component={Crisis} />
                <Route path="/app/clients" component={Clients} />
                <Route path="/app/onboarding" component={Onboarding} />
                <Route path="/app/settings" component={HospitalSettings} />
                <Route component={Dashboard} />
              </Switch>
            </ErrorBoundary>
          </Layout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="medstock-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
