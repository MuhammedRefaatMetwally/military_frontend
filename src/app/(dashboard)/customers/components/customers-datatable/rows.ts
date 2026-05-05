export type CustomerLineItem = {
  materialName: string;
  repeatCount: number;
  price: number;
  discount: number;
};

export type CustomerInvoice = {
  invoiceNumber: string;
  invoiceDateTime: string;
  invoiceValue: number;
  market: string;
  discount: number;
  paymentMethod: string;
  itemCount: number;
  lines: CustomerLineItem[];
};

export type CustomerRow = {
  name: string;
  nationalId: string;
  phone: string;
  cardNumber: string;
  cardCreatedAt: string;
  invoices: CustomerInvoice[];
};

const mkLines = (
  pairs: [string, number, number, number][],
): CustomerLineItem[] =>
  pairs.map(([materialName, repeatCount, price, discount]) => ({
    materialName,
    repeatCount,
    price,
    discount,
  }));

export const rows: CustomerRow[] = [
  {
    name: "عبدالعزيز العدامات",
    nationalId: "9876543210",
    phone: "0791234567",
    cardNumber: "C-00018273",
    cardCreatedAt: "2022-03-14",
    invoices: [
      {
        invoiceNumber: "INV-240891",
        invoiceDateTime: "2024-06-12 10:24",
        invoiceValue: 184.5,
        market: "سوق المنارة",
        discount: 6.2,
        paymentMethod: "بطاقة",
        itemCount: 5,
        lines: mkLines([
          ["أرز بسمتي 5كغ", 2, 22.9, 1.0],
          ["زيت زيتون 1ل", 1, 18.5, 0],
          ["حليب كامل 1ل", 3, 1.65, 0.15],
        ]),
      },
      {
        invoiceNumber: "INV-241002",
        invoiceDateTime: "2024-07-03 18:05",
        invoiceValue: 96.0,
        market: "سوق سلاح الجو",
        discount: 4.0,
        paymentMethod: "نقدي",
        itemCount: 4,
        lines: mkLines([
          ["خبز عربي", 6, 0.45, 0],
          ["لبن زبادي", 2, 2.1, 0.2],
          ["مياه معدنية", 4, 0.35, 0],
        ]),
      },
    ],
  },
  {
    name: "عبدالحميد الشرفات",
    nationalId: "9988776655",
    phone: "0785554411",
    cardNumber: "C-00019410",
    cardCreatedAt: "2021-11-02",
    invoices: [
      {
        invoiceNumber: "INV-239410",
        invoiceDateTime: "2024-05-20 09:12",
        invoiceValue: 412.75,
        market: "فرع عمّان الغربي",
        discount: 22.5,
        paymentMethod: "بطاقة",
        itemCount: 8,
        lines: mkLines([
          ["دجاج مجمد", 2, 14.9, 0.8],
          ["صدور دجاج", 3, 9.5, 0],
          ["منظف أرضيات", 1, 5.25, 0.25],
          ["حفاضات أطفال", 2, 18.0, 1.1],
        ]),
      },
    ],
  },
  {
    name: "عبدالله العمري",
    nationalId: "1122334455",
    phone: "0779012345",
    cardNumber: "C-00025501",
    cardCreatedAt: "2020-08-21",
    invoices: [
      {
        invoiceNumber: "INV-238801",
        invoiceDateTime: "2024-04-02 12:40",
        invoiceValue: 55.2,
        market: "فرع إربد",
        discount: 2.2,
        paymentMethod: "نقدي",
        itemCount: 6,
        lines: mkLines([
          ["سكر أبيض 1كغ", 2, 1.95, 0],
          ["شاي أسود", 1, 6.5, 0.3],
        ]),
      },
      {
        invoiceNumber: "INV-239120",
        invoiceDateTime: "2024-04-18 16:22",
        invoiceValue: 128.9,
        market: "سوق المنارة",
        discount: 5.4,
        paymentMethod: "بطاقة",
        itemCount: 7,
        lines: mkLines([
          ["معكرونة سباغيتي", 4, 1.2, 0],
          ["تونة معلبة", 3, 2.85, 0.15],
          ["عصير برتقال", 2, 3.1, 0],
        ]),
      },
      {
        invoiceNumber: "INV-239556",
        invoiceDateTime: "2024-05-01 11:03",
        invoiceValue: 44.0,
        market: "فرع الزرقاء",
        discount: 0,
        paymentMethod: "نقدي",
        itemCount: 3,
        lines: mkLines([["بسكويت شوكولاتة", 5, 1.1, 0.05]]),
      },
    ],
  },
  {
    name: "رنا المومني",
    nationalId: "2233445566",
    phone: "0798877665",
    cardNumber: "C-00023340",
    cardCreatedAt: "2023-01-07",
    invoices: [
      {
        invoiceNumber: "INV-241210",
        invoiceDateTime: "2024-08-09 19:45",
        invoiceValue: 73.6,
        market: "سوق سلاح الجو",
        discount: 3.6,
        paymentMethod: "بطاقة",
        itemCount: 5,
        lines: mkLines([
          ["شامبو ضد القشرة", 1, 12.5, 0.5],
          ["صابون غسيل", 2, 4.2, 0],
          ["مناديل ورقية", 4, 2.8, 0.2],
        ]),
      },
    ],
  },
  {
    name: "محمود الطراونة",
    nationalId: "3344556677",
    phone: "0781122334",
    cardNumber: "C-00030199",
    cardCreatedAt: "2024-04-19",
    invoices: [
      {
        invoiceNumber: "INV-241330",
        invoiceDateTime: "2024-08-22 08:55",
        invoiceValue: 210.0,
        market: "سوق المنارة",
        discount: 10.0,
        paymentMethod: "بطاقة",
        itemCount: 9,
        lines: mkLines([
          ["لحمة مفرومة", 2, 24.0, 1.2],
          ["فول مدمس", 3, 2.4, 0],
          ["حمص بالطحينة", 2, 3.9, 0.1],
          ["مشروب غازي", 6, 0.75, 0],
        ]),
      },
      {
        invoiceNumber: "INV-241401",
        invoiceDateTime: "2024-08-25 13:18",
        invoiceValue: 31.5,
        market: "فرع عمّان الغربي",
        discount: 1.5,
        paymentMethod: "نقدي",
        itemCount: 4,
        lines: mkLines([
          ["شيبس مملح", 3, 1.0, 0],
          ["مكسرات مشكلة", 1, 9.5, 0.25],
        ]),
      },
    ],
  },
];
