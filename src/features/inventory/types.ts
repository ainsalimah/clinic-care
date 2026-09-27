export interface Medicine {
  id: string;
  name: string;
  form: string | null;
  unit: string;
  price: number;
  stock: number;
  minimumStock: number;
  createdAt: string;
}
