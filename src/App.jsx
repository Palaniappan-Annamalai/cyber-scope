import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import Layout from "./components/layout/Layout";
import GlobePage from "@/pages/GlobePage";
import PageNotFound from "./lib/PageNotFound";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<GlobePage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
