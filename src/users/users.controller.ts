import { Controller, Get, Req, Param, ParseIntPipe, NotFoundException, Put, Body, ValidationPipe, BadRequestException, UseInterceptors, ClassSerializerInterceptor, UseGuards, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/entities/User';
import { PhotoResponse } from './interfaces/photo-response';
import { UserResponseInterceptor } from './interceptors/user-response.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { Request, request } from 'express';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
    getCurrentUser(@AuthUser() authUser: User): User {
        authUser.me = true;
        return authUser;
    }

    @Get('name/:name')
    @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
    async getUsersByName(
        @AuthUser() authUser: User,
        @Param('name') name: string
    ): Promise<User[]> {
        const users = await this.usersService.getUsersByName(name);
        users.forEach(u => u.me = u.id === authUser.id);
        return users;
    }

    @Get(':id')
    @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
    async getUser(
        @AuthUser() authUser: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<User> {
        try {
            const user = await this.usersService.getUser(id);
            user.me = id === authUser.id;
            return user;
        } catch (e) {
            throw new NotFoundException();
        }
    }

    @Put('me')
    @HttpCode(204)
    async updateUserInfo(
        @AuthUser() authUser: User,
        @Body(new ValidationPipe({ transform: true, whitelist: true })) userDto: UpdateUserDto): Promise<void> {
        try {
            await this.usersService.updateUserInfo(authUser.id, userDto);
        } catch (e) {
            console.log(e);
            if (e.code === 'ER_DUP_ENTRY') {
                throw new BadRequestException('This email is already registered');
            } else {
                throw new NotFoundException();
            }
        }
    }

    @Put('me/password')
    @HttpCode(204)
    async updatePassword(
        @AuthUser() authUser: User,
        @Body(new ValidationPipe({ transform: true, whitelist: true })) passDto: UpdatePasswordDto): Promise<void> {
        try {
            await this.usersService.updatePassword(authUser.id, passDto);
        } catch (e) {
            throw new NotFoundException();
        }
    }

    @Put('me/photo')
    async updateAvatar(
        @AuthUser() authUser: User,
        @Body(new ValidationPipe({ transform: true, whitelist: true })) photoDto: UpdatePhotoDto,
        @Req() req: Request,
    ): Promise<PhotoResponse> {
        try {
            const photo = await this.usersService.updatePhoto(authUser.id, photoDto);
            return { photo: req.protocol + '://' + req.headers.host + '/' + photo };
        } catch (e) {
            throw new NotFoundException();
        }

    }
}
