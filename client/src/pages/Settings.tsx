import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage reconciliation system settings
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Matching Settings</CardTitle>
            <CardDescription>
              Adjust reconciliation algorithm parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date-tolerance">Date Tolerance (days)</Label>
              <Input
                id="date-tolerance"
                type="number"
                defaultValue="2"
                min="0"
                max="7"
                data-testid="input-date-tolerance"
              />
              <p className="text-xs text-muted-foreground">
                Acceptable margin of error between transaction dates (±days)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
              <Input
                id="confidence-threshold"
                type="number"
                defaultValue="80"
                min="50"
                max="100"
                data-testid="input-confidence-threshold"
              />
              <p className="text-xs text-muted-foreground">
                Minimum similarity percentage for automatic matching
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Matching</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically approve high-confidence matches
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-auto-match" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notify New Matches</Label>
                <p className="text-xs text-muted-foreground">
                  Receive alerts when new matches are found
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-notify-matches" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notify Pending Items</Label>
                <p className="text-xs text-muted-foreground">
                  Alert about transactions pending reconciliation
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-notify-pending" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Configure report export options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <select
                id="export-format"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                data-testid="select-export-format"
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>

            <Button className="w-full" data-testid="button-save-settings">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
