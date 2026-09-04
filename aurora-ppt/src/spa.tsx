import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Editor from "@/components/editor/Editor";
import "./styles.css";

const queryClient = new QueryClient();

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Editor />
    </QueryClientProvider>
  </StrictMode>,
);
