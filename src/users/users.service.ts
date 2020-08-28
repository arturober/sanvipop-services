import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from 'src/entities/User';
import { EntityRepository } from '@mikro-orm/core';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { ImageService } from 'src/commons/image/image.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly imageService: ImageService,
        @InjectRepository(User) private readonly usersRepo: EntityRepository<User>,
    ) {}

    async getUser(id: number): Promise<User> {
        return this.usersRepo.findOneOrFail({id});
    }

    async getUserbyEmail(email: string): Promise<User> {
        return this.usersRepo.findOne({email});
    }

    async getUsersByName(name: string): Promise<User[]> {
        return this.usersRepo.find({name: {$like: '%' + name + '%'}});
    }

    async emailExists(email: string): Promise<boolean> {
        return (await this.usersRepo.findOne({email})) ? true : false;
    }

    async updateUserInfo(id: number, user: UpdateUserDto): Promise<void> {
        await this.usersRepo.nativeUpdate({id}, user);
    }

    async updatePassword(id: number, pass: UpdatePasswordDto): Promise<void> {
        await this.usersRepo.nativeUpdate({id}, pass);
    }

    async updatePhoto(id: number, avatar: UpdatePhotoDto): Promise<string> {
        avatar.photo = await this.imageService.saveImage('users', avatar.photo);
        await this.usersRepo.nativeUpdate(id, avatar);
        return avatar.photo;
    }
}
