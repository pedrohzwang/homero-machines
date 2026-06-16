export type Part = {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  power: number;
  voltage: number;
  photos: string[];
  tags: string[];
};

export type Machine = {
  id: number;
  name: string;
  description?: string;
  photos: string[];
  parts: Part[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
