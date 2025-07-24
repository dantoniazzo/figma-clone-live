const options = {
  year: "numeric" as Intl.DateTimeFormatOptions["year"],
  month: "long" as Intl.DateTimeFormatOptions["month"],
  day: "numeric" as Intl.DateTimeFormatOptions["day"],
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", options);
};
