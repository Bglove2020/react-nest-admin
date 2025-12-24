import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@ruoyi/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { refreshAccessToken } from "@/lib/apiClient";

const queryClient = new QueryClient();

refreshAccessToken().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster position="top-center" />
      </QueryClientProvider>
    </StrictMode>,
  );
});
