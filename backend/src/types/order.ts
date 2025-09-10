export interface IOrderItem {
  id: string;
}

export interface IOrder {
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface IOrderResponse {
  id: string;
  total: number;
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  items: string[];
}
