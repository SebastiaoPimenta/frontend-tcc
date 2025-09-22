import { Location } from './location.interface';
import { Product } from './product.interface';

export interface Delivery {
  location: Location;
  products: Product[];
  customerName: string;
  customerPhone: string;
  priority: number;
}