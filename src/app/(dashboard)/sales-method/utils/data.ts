export const paymentRows = [
  {
    method: "طلبات",
    paymentType: "دفع غير فوري",
    sales: 220000,
    volume: 2700,
    margin: 22.5,
  },
  {
    method: "ذمم",
    paymentType: "دفع غير فوري",
    sales: 116540,
    volume: 1420,
    margin: 21.6,
  },
  {
    method: "visa",
    paymentType: "الدفع الفوري",
    sales: 42000,
    volume: 520,
    margin: 19.8,
  },
  {
    method: "cash",
    paymentType: "الدفع الفوري",
    sales: 28920,
    volume: 360,
    margin: 18.9,
  },
  {
    method: "copon",
    paymentType: "الدفع الفوري",
    sales: 8000,
    volume: 100,
    margin: 17.5,
  },
];

export const salesTypeRows = [
  {
    type: "ذمم (كتب رسمية)",
    typeAr: "Receivables / official",
    sales: 198400,
    volume: 2410,
    margin: 20.2,
  },
  {
    type: "بيع الكتروني",
    typeAr: "E‑commerce",
    sales: 156200,
    volume: 1895,
    margin: 18.6,
  },
  {
    type: "دفع فوري",
    typeAr: "Instant payment",
    sales: 71250,
    volume: 837,
    margin: 16.9,
  },
];

export const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
