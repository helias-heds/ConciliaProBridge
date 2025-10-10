import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: number;
  total?: number;
  icon: LucideIcon;
  variant?: "success" | "warning" | "error" | "default";
}

export function StatusCard({ title, value, total, icon: Icon, variant = "default" }: StatusCardProps) {
  const variantStyles = {
    success: "text-chart-2",
    warning: "text-chart-3",
    error: "text-chart-4",
    default: "text-muted-foreground",
  };

  const percentage = total ? (total > 0 ? Math.round((value / total) * 100) : 0) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`h-5 w-5 ${variantStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums" data-testid={`text-${variant}-count`}>
          {value}
        </div>
        {percentage !== null && total !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {percentage}% do total ({total} transações)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
