import {
  Controller,
  Get,
  Req,
  Param,
  ParseIntPipe,
  Put,
  Body,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdatePasswordDto } from './dto/update-password.dto.js';
import { UpdatePhotoDto } from './dto/update-photo.dto.js';
import { AuthUser } from '../../common/decorators/user.decorator.js';
import { User } from './entities/user.entity.js';
import { PhotoResponse } from './interfaces/photo-response.js';
import { UserResponseInterceptor } from './interceptors/user-response.interceptor.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get profile of current logged-in user' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  getCurrentUser(@AuthUser() authUser: User): User {
    authUser.me = true;
    return authUser;
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Search users by name substring' })
  @ApiResponse({ status: 200, description: 'Matching users list' })
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async getUsersByName(
    @AuthUser() authUser: User,
    @Param('name') name: string,
  ): Promise<User[]> {
    const users = await this.usersService.getUsersByName(name);
    users.forEach((u: User) => (u.me = u.id === authUser.id));
    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async getUser(
    @AuthUser() authUser: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    const user = await this.usersService.getUser(id);
    user.me = id === authUser.id;
    return user;
  }

  @Put('me')
  @HttpCode(204)
  @ApiOperation({ summary: 'Update profile information of current user' })
  @ApiResponse({ status: 204, description: 'User updated' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async updateUserInfo(
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    userDto: UpdateUserDto,
  ): Promise<void> {
    await this.usersService.updateUserInfo(authUser.id, userDto);
  }

  @Put('me/password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Update password of current user' })
  @ApiResponse({ status: 204, description: 'Password updated' })
  async updatePassword(
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    passDto: UpdatePasswordDto,
  ): Promise<void> {
    await this.usersService.updatePassword(authUser.id, passDto);
  }

  @Put('me/photo')
  @ApiOperation({ summary: 'Update avatar photo of current user' })
  @ApiResponse({ status: 200, description: 'New photo URL' })
  async updateAvatar(
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    photoDto: UpdatePhotoDto,
    @Req() req: Request,
  ): Promise<PhotoResponse> {
    const photo = await this.usersService.updatePhoto(authUser.id, photoDto);
    const basePath = this.configService.get<string>('basePath') || '';
    const prefix = basePath ? `${basePath}/` : '';
    return {
      photo: `${req.protocol}://${req.headers.host}/${prefix}${photo}`,
    };
  }
}
