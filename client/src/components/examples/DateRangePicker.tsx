import { DateRangePicker } from "../DateRangePicker";

export default function DateRangePickerExample() {
  return (
    <div className="p-8">
      <DateRangePicker
        onDateChange={(range) => console.log("Date range changed:", range)}
      />
    </div>
  );
}
