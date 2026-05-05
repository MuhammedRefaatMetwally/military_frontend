export const getArabicDate = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-JO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return dateStr;
};
