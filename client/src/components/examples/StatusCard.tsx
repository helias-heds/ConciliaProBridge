import { StatusCard } from "../StatusCard";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function StatusCardExample() {
  return (
    <div className="p-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Conciliados"
          value={145}
          total={200}
          icon={CheckCircle2}
          variant="success"
        />
        <StatusCard
          title="Pendentes na Planilha"
          value={35}
          total={200}
          icon={Clock}
          variant="warning"
        />
        <StatusCard
          title="Pendentes no Extrato"
          value={20}
          total={200}
          icon={AlertCircle}
          variant="error"
        />
      </div>
    </div>
  );
}
