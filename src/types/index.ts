export type Part = {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  photos: string[];
};

export type Machine = {
  id: number;
  name: string;
  description?: string;
  photos: string[];
  parts: Part[];
  createdAt: string;
  updatedAt: string;
};
