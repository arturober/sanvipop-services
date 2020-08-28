import { Injectable, Inject } from '@nestjs/common';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as jwt from 'jsonwebtoken';
import * as request from 'request-promise';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ImageService } from '../commons/image/image.service';

import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { LoginTokenDto } from './dto/login-token.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from 'src/entities/User';
import { EntityRepository } from '@mikro-orm/core';
import { TokenResponse } from './interfaces/token-response';
import { RegisterResponse } from './interfaces/register-response';

@Injectable()
export class AuthService {
    constructor(
        @Inject('JWT_KEY') private jwtKey: string,
        @Inject('JWT_EXPIRATION') private jwtExpiration: number,
        @Inject('GOOGLE_ID') private googleId: string,
        @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
        private readonly imageService: ImageService,
        private readonly usersService: UsersService,
    ) { }

    private createToken(user: User): TokenResponse {
        const data: JwtPayload = {
            id: user.id
        };
        const expiresIn = this.jwtExpiration;
        const accessToken = jwt.sign(data, this.jwtKey, { expiresIn }) as string;
        return {
            expiresIn,
            accessToken,
        };
    }

    async registerUser(userDto: RegisterUserDto): Promise<RegisterResponse> {
        userDto.photo = await this.imageService.saveImage('users', userDto.photo);
        await this.userRepo.nativeInsert(userDto);
        return {email: userDto.email};
    }

    async login(userDto: LoginUserDto): Promise<TokenResponse> {
        const user = await this.userRepo.findOneOrFail({email: userDto.email, password: userDto.password});
        if (userDto.firebaseToken) {
            user.firebaseToken = userDto.firebaseToken;
        }
        if(userDto.lat && userDto.lng) {
            user.lat = userDto.lat;
            user.lng = userDto.lng;
        }
        await this.userRepo.flush();
        return this.createToken(user);
    }

    async loginGoogle(tokenDto: LoginTokenDto): Promise<TokenResponse> {
        const client = new OAuth2Client(this.googleId);
        const ticket = await client.verifyIdToken({
            idToken: tokenDto.token,
            audience: this.googleId,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        let user = await this.usersService.getUserbyEmail(email);
        
        if (!user) {
            const photo = await this.imageService.downloadImage('users', payload.picture);
            const user2 = {
                email,
                name: payload.name,
                photo,
            };
            await this.userRepo.persistAndFlush(user2);
            user = await this.usersService.getUserbyEmail(email);
        }

        if (tokenDto.firebaseToken) {
            user.firebaseToken = tokenDto.firebaseToken; 
        }

        if(tokenDto.lat && tokenDto.lng) {
            user.lat = tokenDto.lat;
            user.lng = tokenDto.lng;
        }
        await this.userRepo.flush();

        return this.createToken(user as User);
    }

    async loginFacebook(tokenDto: LoginTokenDto): Promise<TokenResponse> {
        const options = {
            method: 'GET',
            uri: 'https://graph.facebook.com/me',
            qs: {
                access_token: tokenDto.token,
                fields: 'id,name,email',
            },
            json: true,
        };
        const respUser = await request(options);

        let user = await this.usersService.getUserbyEmail(respUser.email);

        if (!user) {
            const optionsImg = {
                method: 'GET',
                uri: 'https://graph.facebook.com/me/picture',
                qs: {
                    access_token: tokenDto.token,
                    type: 'large',
                },
            };
            const respImg = request(optionsImg);
            const photo = await this.imageService.downloadImage('users', respImg.url);
            user = {
                email: respUser.email,
                name: respUser.name,
                photo,
            } as User;
            await this.userRepo.persistAndFlush(user);
        }

        if (tokenDto.firebaseToken) {
            user.firebaseToken = tokenDto.firebaseToken;
            await this.userRepo.flush();
        }

        if(tokenDto.lat && tokenDto.lng) {
            user.lat = tokenDto.lat;
            user.lng = tokenDto.lng;
        }
        await this.userRepo.flush();

        return this.createToken(user as User);
    }
}
