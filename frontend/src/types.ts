export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}


