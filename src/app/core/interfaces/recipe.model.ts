export interface RecipeModel {
    title: string;
    href: string;
    ingredients: string[];
    thumbnail: string;
    favorite: boolean;
}

export interface RecipeModelApi {
    href: string;
    results: RecipeModel[];
    title: string;
    version: number;
}
