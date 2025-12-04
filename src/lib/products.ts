export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sku: string;
  tags: string[]; // e.g. ["Model 3", "Подвеска и рулевое"]
  oem?: string;
  compatibility?: string; // e.g. "Model 3 2017–2023"
  condition?: "Новая" | "Б/У";
  availability?: "В наличии" | "На заказ";
};

export const demoProducts: Product[] = [
  {
    id: "AM3F-001",
    title: "Амортизатор передний Model 3",
    description:
      "Оригинальный амортизатор передний для Tesla Model 3. Состояние: новый.",
    price: 4500,
    images: ["/demo/am3f-001.jpg"],
    sku: "AM3F-001",
    tags: ["Model 3", "Подвеска и рулевое"],
    oem: "1044321-00-A",
    compatibility: "Model 3 2017–2023",
    condition: "Новая",
    availability: "В наличии",
  },
  {
    id: "FARY-L-002",
    title: "Фара левая Model Y",
    description:
      "Фара LED левая, оригинал. Проверена, б/у в отличном состоянии.",
    price: 12500,
    images: ["/demo/fary-l-002.jpg"],
    sku: "FARY-L-002",
    tags: ["Model Y", "Оптика и электрика"],
    oem: "1521420-00-B",
    compatibility: "Model Y 2020–2024",
    condition: "Б/У",
    availability: "В наличии",
  },
  {
    id: "DS19MS-003",
    title: "Диск колёсный 19'' Model S",
    description:
      "Литой диск 19\", цвет серебристый, совместим с Model S.",
    price: 9800,
    images: ["/demo/ds19ms-003.jpg"],
    sku: "DS19MS-003",
    tags: ["Model S", "Шины/диски"],
    compatibility: "Model S 2012–2020",
    condition: "Новая",
    availability: "На заказ",
  },
  {
    id: "AMF303",
    title: "Задняя левая четверть",
    description: "Без ДТП, без дефектов.",
    price: 45900,
    images: ["/четверть.jpg"],
    sku: "", // SKU не используется на сайте, можно оставить пустым или для внутреннего учёта
    tags: ["Model S", "Кузов", "четверть", "задняя четверть"],
    compatibility: "Tesla Model S 2021–2023",
    condition: "Б/У",
    availability: "В наличии",
  },
];

export const categories = [
  "Кузов",
  "Оптика и электрика",
  "Подвеска и рулевое",
  "Тормозная система",
  "Охлаждение/отопление",
  "Трансмиссия/привод",
  "Салон/интерьер",
  "Стёкла/зеркала",
  "Зарядка и HV‑компоненты",
  "Шины/диски",
  "Расходники/крепёж",
] as const;

export const models = ["Model 3", "Model Y", "Model X", "Model S", "Cybertruck"] as const;
