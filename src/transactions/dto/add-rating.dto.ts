import { IsNumber, IsString, Min, Max } from "class-validator";

export class AddRatingDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;
    
    @IsString()
    comment: string;

    @IsNumber()
    product: number;
}