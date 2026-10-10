export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
};

export type MenuCategory = {
  id: string;
  name: string;
  image: string | null;
  items: MenuItem[];
};

export type MenuData = {
  storeName: string;
  categories: MenuCategory[];
};

export type CartLine = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

export type OrderStatus = "pending" | "paid" | "cancelled";

export type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  notes?: string;
};
