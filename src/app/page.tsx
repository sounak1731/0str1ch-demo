import OstrichApp from "@/components/app/OstrichApp";
import type { Sale, ABTestResult, WhatIfScenario } from "@/lib/types";

async function getData(): Promise<{
  sales: Sale[];
  abTest: ABTestResult[];
  whatIf: WhatIfScenario[];
}> {
  const { salesData } = await import("@/data/sales");
  const { abTestData } = await import("@/data/ab-test-data");
  const { whatIfData } = await import("@/data/what-if-data");
  return {
    sales: salesData,
    abTest: abTestData,
    whatIf: whatIfData,
  };
}

export default async function Home() {
  const initialData = await getData();

  return (
    <main className="min-h-screen">
      <OstrichApp
        initialSalesData={initialData.sales}
        initialABTestData={initialData.abTest}
        initialWhatIfData={initialData.whatIf}
      />
    </main>
  );
}
