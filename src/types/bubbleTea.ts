
export type TeaFlavor = 'milk' | 'green' | 'citrus';

export type Topping = 'blackPearl' | 'pineapple' | 'octopusBall' | 'squidLeg' | 'jelly';

export interface BubbleTeaConfig {
  flavor: TeaFlavor;
  toppings: Topping[];
}

export interface FlavorOption {
  id: TeaFlavor;
  name: string;
  color: string;
  description: string;
}

export interface ToppingOption {
  id: Topping;
  name: string;
  color: string;
  description: string;
}
