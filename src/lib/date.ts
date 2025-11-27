export function excelSerialToJSDate(serial: number) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
  return jsDate;
}

export const excelDateToJSDate = (excelDate: number | string) => {
  if (typeof excelDate === "string") {
    // If it's already a string, try to parse it or return as is
    const parsed = Date.parse(excelDate);
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString().split("T")[0];
    }
    return excelDate;
  }

  if (typeof excelDate === "number" && excelDate > 0) {
    // Excel dates start from 1900-01-01, but JavaScript dates start from 1970-01-01
    // Excel incorrectly considers 1900 as leap year, so we need to subtract 1
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
    return jsDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  }

  // Fallback to current date if invalid
  return new Date().toISOString().split("T")[0];
};

export const formatCurrency = (amount: number | null) => {
  if (!amount) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};
