type BranchProductProd = {
  name: string;
  vol: number;
  price: number;
  basket: number;
  atv: number;
};
type BranchProductCat = {
  name: string;
  vol: number;
  price: number;
  basket: number;
  atv: number;
  products: BranchProductProd[];
};
type BranchProductAnalysisBranch = {
  branch: string;
  vol: number;
  price: number;
  basket: number;
  atv: number;
  cats: BranchProductCat[];
};

export const BRANCH_PRODUCT_ANALYSIS: BranchProductAnalysisBranch[] = [
  {
    branch: "سوق المنارة",
    vol: 52400,
    price: 1.7,
    basket: 8.2,
    atv: 12.4,
    cats: [
      {
        name: "منتجات غذائية",
        vol: 18200,
        price: 1.8,
        basket: 12.5,
        atv: 15.8,
        products: [
          { name: "حبوب وأرز", vol: 6200, price: 2.1, basket: 14.2, atv: 18.5 },
          { name: "زيوت", vol: 4800, price: 1.6, basket: 11.8, atv: 14.2 },
          {
            name: "حليب وألبان",
            vol: 4200,
            price: 1.9,
            basket: 12.0,
            atv: 16.0,
          },
          { name: "معلبات", vol: 3000, price: 1.4, basket: 10.5, atv: 12.5 },
        ],
      },
      {
        name: "مستلزمات منزلية",
        vol: 12100,
        price: 0.9,
        basket: 10.2,
        atv: 6.4,
        products: [
          { name: "منظفات", vol: 5200, price: 0.8, basket: 11.5, atv: 7.2 },
          { name: "أدوات مطبخ", vol: 3800, price: 1.1, basket: 9.0, atv: 5.8 },
          { name: "معطرات جو", vol: 3100, price: 0.7, basket: 8.5, atv: 5.5 },
        ],
      },
      {
        name: "العناية الشخصية",
        vol: 8400,
        price: 1.4,
        basket: 5.8,
        atv: 8.5,
        products: [
          { name: "شامبو وبلسم", vol: 3200, price: 1.5, basket: 6.2, atv: 9.0 },
          { name: "معجون أسنان", vol: 2800, price: 1.2, basket: 5.5, atv: 7.8 },
          { name: "عطور", vol: 2400, price: 1.6, basket: 5.2, atv: 8.8 },
        ],
      },
      {
        name: "أجهزة وإلكترونيات",
        vol: 6200,
        price: 1.9,
        basket: 3.2,
        atv: 5.8,
        products: [
          { name: "بطاريات", vol: 2800, price: 1.8, basket: 3.5, atv: 6.2 },
          { name: "إضاءة LED", vol: 2100, price: 2.2, basket: 2.8, atv: 5.5 },
        ],
      },
      {
        name: "مسطحات",
        vol: 7500,
        price: 1.5,
        basket: 4.5,
        atv: 5.2,
        products: [
          {
            name: "مسطحات ساخنة",
            vol: 4200,
            price: 1.6,
            basket: 4.8,
            atv: 5.8,
          },
          {
            name: "مسطحات باردة",
            vol: 3300,
            price: 1.3,
            basket: 4.0,
            atv: 4.5,
          },
        ],
      },
    ],
  },
  {
    branch: "سوق البقعة",
    vol: 48800,
    price: 1.6,
    basket: 7.8,
    atv: 11.2,
    cats: [
      {
        name: "منتجات غذائية",
        vol: 16500,
        price: 1.7,
        basket: 11.8,
        atv: 14.5,
        products: [
          { name: "حبوب وأرز", vol: 5800, price: 2.0, basket: 13.5, atv: 17.2 },
          { name: "زيوت", vol: 4200, price: 1.5, basket: 10.8, atv: 13.0 },
          { name: "معلبات", vol: 3500, price: 1.4, basket: 10.0, atv: 11.8 },
        ],
      },
      {
        name: "مستلزمات منزلية",
        vol: 11200,
        price: 0.8,
        basket: 9.5,
        atv: 5.8,
        products: [
          { name: "منظفات", vol: 4800, price: 0.7, basket: 10.2, atv: 6.5 },
          {
            name: "أكياس وأغلفة",
            vol: 3200,
            price: 0.9,
            basket: 8.8,
            atv: 5.2,
          },
          { name: "معطرات جو", vol: 3200, price: 0.8, basket: 8.5, atv: 5.0 },
        ],
      },
      {
        name: "مستلزمات الأطفال",
        vol: 8200,
        price: 1.2,
        basket: 4.2,
        atv: 4.8,
        products: [
          { name: "حفاضات", vol: 3500, price: 1.1, basket: 4.5, atv: 5.2 },
          { name: "حليب أطفال", vol: 2800, price: 1.4, basket: 4.0, atv: 4.8 },
          { name: "طعام أطفال", vol: 1900, price: 1.0, basket: 3.8, atv: 4.0 },
        ],
      },
      {
        name: "فرفاشية",
        vol: 6500,
        price: 1.5,
        basket: 2.8,
        atv: 6.2,
        products: [
          { name: "مفارش", vol: 3800, price: 1.6, basket: 3.0, atv: 6.8 },
          { name: "وسائد", vol: 2700, price: 1.3, basket: 2.5, atv: 5.5 },
        ],
      },
      {
        name: "منتجات ورقية",
        vol: 6400,
        price: 2.1,
        basket: 6.8,
        atv: 7.2,
        products: [
          { name: "مناديل", vol: 2800, price: 2.0, basket: 7.2, atv: 7.8 },
          { name: "ورق تواليت", vol: 2200, price: 2.2, basket: 6.5, atv: 6.8 },
        ],
      },
    ],
  },
  {
    branch: "سوق الخبر",
    vol: 42200,
    price: 1.5,
    basket: 7.0,
    atv: 10.5,
    cats: [
      {
        name: "منتجات غذائية",
        vol: 15200,
        price: 1.6,
        basket: 11.0,
        atv: 13.8,
        products: [
          { name: "حبوب وأرز", vol: 5500, price: 1.9, basket: 12.8, atv: 16.0 },
          {
            name: "حليب وألبان",
            vol: 4200,
            price: 1.5,
            basket: 10.5,
            atv: 12.5,
          },
          { name: "زيوت", vol: 2500, price: 1.4, basket: 9.8, atv: 12.0 },
        ],
      },
      {
        name: "العناية الشخصية",
        vol: 9800,
        price: 1.3,
        basket: 5.2,
        atv: 7.8,
        products: [
          { name: "مزيل عرق", vol: 3200, price: 1.2, basket: 5.5, atv: 8.0 },
          { name: "شامبو وبلسم", vol: 3000, price: 1.4, basket: 5.0, atv: 7.5 },
          { name: "عطور", vol: 2200, price: 1.5, basket: 4.8, atv: 8.2 },
        ],
      },
      {
        name: "غير مصنف",
        vol: 8200,
        price: 1.3,
        basket: 3.5,
        atv: 5.5,
        products: [
          { name: "متفرقات", vol: 4800, price: 1.2, basket: 3.8, atv: 5.8 },
          { name: "عام", vol: 3400, price: 1.4, basket: 3.2, atv: 5.0 },
        ],
      },
      {
        name: "مسطحات",
        vol: 9000,
        price: 1.8,
        basket: 5.0,
        atv: 6.0,
        products: [
          {
            name: "مسطحات ساخنة",
            vol: 5200,
            price: 1.9,
            basket: 5.5,
            atv: 6.5,
          },
          {
            name: "مسطحات باردة",
            vol: 3800,
            price: 1.6,
            basket: 4.2,
            atv: 5.2,
          },
        ],
      },
    ],
  },
  {
    branch: "سوق القويسمة",
    vol: 38500,
    price: 1.4,
    basket: 6.5,
    atv: 9.2,
    cats: [
      {
        name: "منتجات غذائية",
        vol: 14200,
        price: 1.5,
        basket: 10.5,
        atv: 12.8,
        products: [
          { name: "حبوب وأرز", vol: 5200, price: 1.8, basket: 12.0, atv: 15.0 },
          { name: "زيوت", vol: 4000, price: 1.3, basket: 9.8, atv: 11.5 },
          { name: "معلبات", vol: 3000, price: 1.2, basket: 9.0, atv: 10.5 },
        ],
      },
      {
        name: "مستلزمات منزلية",
        vol: 10800,
        price: 0.8,
        basket: 9.0,
        atv: 5.5,
        products: [
          { name: "منظفات", vol: 4500, price: 0.7, basket: 9.8, atv: 6.0 },
          { name: "أدوات مطبخ", vol: 3500, price: 0.9, basket: 8.5, atv: 5.2 },
          {
            name: "أكياس وأغلفة",
            vol: 2800,
            price: 0.8,
            basket: 8.0,
            atv: 4.8,
          },
        ],
      },
      {
        name: "أجهزة وإلكترونيات",
        vol: 6800,
        price: 2.0,
        basket: 3.5,
        atv: 6.2,
        products: [
          { name: "بطاريات", vol: 3000, price: 1.9, basket: 3.8, atv: 6.5 },
          { name: "إضاءة LED", vol: 2200, price: 2.3, basket: 3.0, atv: 6.0 },
        ],
      },
      {
        name: "فرفاشية",
        vol: 6700,
        price: 1.5,
        basket: 2.5,
        atv: 5.8,
        products: [
          { name: "مفارش", vol: 3800, price: 1.6, basket: 2.8, atv: 6.2 },
          { name: "وسائد", vol: 2900, price: 1.3, basket: 2.2, atv: 5.2 },
        ],
      },
    ],
  },
];
