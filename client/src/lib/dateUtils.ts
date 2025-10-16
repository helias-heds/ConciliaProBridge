export function formatDateUTC(date: Date, formatStr: string = "MM/dd/yyyy"): string {
  const dateStr = date.toISOString().split('T')[0];
  const [year, month, day] = dateStr.split('-');
  
  if (formatStr === "MM/dd/yyyy") {
    return `${month}/${day}/${year}`;
  } else if (formatStr === "yyyy-MM-dd") {
    return dateStr;
  }
  
  return dateStr;
}
