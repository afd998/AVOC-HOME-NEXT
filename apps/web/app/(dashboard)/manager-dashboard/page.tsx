import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [{ value: "daily-report", label: "Daily Report" }] as const;

export default function ManagerDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="daily-report" className="w-full space-y-4">
        <TabsList className="flex w-full max-w-xl justify-start gap-2">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-4">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="daily-report" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Daily Report</CardTitle>
              <CardDescription>
                Pull today&apos;s operational snapshot and surface key actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Daily reporting widgets will live here soon.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
