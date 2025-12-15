export type Category = "head" | "body" | "accessory";

export type Side = "powerless" | "powerful";

export type Trait = {
  id: string;
  name: string;
  description: string;
  story_or_reference?: string;
  image: string;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotate?: number;
    z?: number;
  };
};

export type FeaturesData = {
  powerless: Record<Category, Trait[]>;
  powerful: Record<Category, Trait[]>;
};

export type Selections = {
  powerless: Record<Category, string | null>;
  powerful: Record<Category, string | null>;
};

