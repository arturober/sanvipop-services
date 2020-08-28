import { IsString, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
import * as crypto from 'crypto';

export class UpdatePasswordDto {
    @IsString()
    @IsNotEmpty()
    @Transform((p) => p ? crypto.createHash('sha256').update(p).digest('base64'):null)
    password: string;
}