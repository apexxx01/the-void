import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, RedirectToSignIn, Show } from "@clerk/react";
import { AuthSetup } from "@/lib/auth-setup";
import { SOSButton } from "@/components/SOSButton";
import { CursorTrail } from "@/components/CursorTrail";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { GlitchBars } from "@/components/GlitchBars";
import { ScrollProgress } from "@/components/ScrollProgress";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import SignUpPage from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Diary from "@/pages/Diary";
import Breathe from "@/pages/Breathe";
import Reflect from "@/pages/Reflect";
import Manifest from "@/pages/Manifest";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#ffffff",
    colorBackground: "#000000",
    colorText: "#ffffff",
    colorTextSecondary: "#888888",
    colorInputBackground: "#111111",
    colorInputText: "#ffffff",
    colorDanger: "#ff4444",
    fontFamily: '"Share Tech Mono", monospace',
    borderRadius: "0rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    card: "!shadow-none !bg-black !rounded-none !border !border-white/20 w-[440px] max-w-full",
    headerTitle: "!text-white !font-bold",
    headerSubtitle: "!text-white/50",
    formFieldLabel: "!text-white",
    formFieldInput: "!bg-transparent !border !border-white/20 !text-white !rounded-none focus:!border-white",
    formButtonPrimary: "!bg-white !text-black hover:!bg-white/80 !rounded-none !shadow-none",
    footerActionLink: "!text-white hover:!text-white/80",
    footerActionText: "!text-white/50",
    dividerLine: "!bg-white/20",
    dividerText: "!text-white/50",
    socialButtonsBlockButton: "!border !border-white/20 !rounded-none hover:!bg-white/10 !text-white",
    socialButtonsBlockButtonText: "!text-white",
    alert: "!bg-red-900/20 !border-red-900 !rounded-none",
    alertText: "!text-white",
    footer: "!bg-transparent",
  },
};

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/sign-in/*?" component={Login} />
      <Route path="/sign-up/*?" component={SignUpPage} />

      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/chat">
        <ProtectedRoute component={Chat} />
      </Route>
      <Route path="/diary">
        <ProtectedRoute component={Diary} />
      </Route>
      <Route path="/breathe">
        <ProtectedRoute component={Breathe} />
      </Route>
      <Route path="/reflect">
        <ProtectedRoute component={Reflect} />
      </Route>
      <Route path="/manifest">
        <ProtectedRoute component={Manifest} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProvider
            publishableKey={clerkPubKey}
            {...(clerkProxyUrl ? { proxyUrl: clerkProxyUrl } : {})}
            appearance={clerkAppearance}
            signInUrl={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
            signInFallbackRedirectUrl={`${basePath}/dashboard`}
            signUpFallbackRedirectUrl={`${basePath}/dashboard`}
          >
            <AuthSetup>
              <Router />
              <SOSButton />
            </AuthSetup>
          </ClerkProvider>
        </WouterRouter>
        <Toaster />
        {/* Global ambient overlays */}
        <CursorTrail />
        <NoiseOverlay opacity={0.025} />
        <GlitchBars />
        <ScrollProgress />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
