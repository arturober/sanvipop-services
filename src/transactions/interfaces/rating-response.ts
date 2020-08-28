import { User } from "src/entities/User";
import { Product } from "src/entities/Product";

export interface RatingResponse {
    user: User;
    product: Product;
    rating: number;
    comment: string;
}

export interface RatingResponses {
    ratings: RatingResponse[]
}