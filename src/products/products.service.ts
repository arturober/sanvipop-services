import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product } from 'src/entities/Product';
import { EntityRepository } from '@mikro-orm/core';
import { InsertProductDto } from './dto/insert-product.dto';
import { ImageService } from 'src/commons/image/image.service';
import { Category } from 'src/entities/Category';
import { ProductPhoto } from 'src/entities/ProductPhoto';
import { User } from 'src/entities/User';
import { ProductsRepository } from './products.repository';
import { EditProductDto } from './dto/edit-product.dto';
import { ProductBookmark } from 'src/entities/ProductBookmark';
import { AddPhotoDto } from './dto/add-photo.dto';
import { Transaction } from 'src/entities/Transaction';
import { FirebaseService } from 'src/commons/firebase/firebase.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductsRepository,
    @InjectRepository(ProductPhoto)
    private readonly prodPhotoRepository: EntityRepository<ProductPhoto>,
    @InjectRepository(ProductBookmark)
    private readonly prodBookmarkRepository: EntityRepository<ProductBookmark>,
    @InjectRepository(Category)
    private readonly catRepository: EntityRepository<Category>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Transaction)
    private readonly transRepository: EntityRepository<Transaction>,
    private readonly imageService: ImageService,
    private readonly firebaseService: FirebaseService,
  ) {}

  private async getAndCheckProduct(
    authUser: User,
    id: number,
    relations: (keyof Product)[] = [],
  ): Promise<Product> {
    const product = await this.productRepository.findOne({ id }, { populate : relations });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.owner.id !== authUser.id) {
      throw new ForbiddenException(
        "You can't edit or delete other user's products",
      );
    }
    return product;
  }

  async findAll(authUser: User): Promise<Product[]> {
    const products = await this.productRepository.findByDistance(
      0,
      0,
      authUser.id,
    );
    return this.productRepository.populate(products, [
      'owner',
      'mainPhoto',
      'category',
    ]);
  }

  async findAllByDistance(authUser: User): Promise<Product[]> {
    const products = await this.productRepository.findByDistance(
      authUser.lat,
      authUser.lng,
      authUser.id,
    );
    return this.productRepository.populate(products, [
      'owner',
      'mainPhoto',
      'category',
    ]);
  }

  async findBookmarked(authUser: User, idUser: number): Promise<Product[]> {
    const joinBookmark = new Map<string, any>();
    joinBookmark.set('bookmarks', { 'bookmarks.user': idUser });
    const products = await this.productRepository.findByDistance(
      authUser.lat,
      authUser.lng,
      authUser.id,
      null,
      undefined,
      joinBookmark,
    );
    return this.productRepository.populate(products, [
      'owner',
      'mainPhoto',
      'category',
    ]);
  }

  async findByOwner(authUser: User, idUser: number): Promise<Product[]> {
    const products = await this.productRepository.findByDistance(
      authUser.lat,
      authUser.lng,
      authUser.id,
      { owner: { id: idUser }, $not: { status: 3 } },
    );
    console.log(products);
    return this.productRepository.populate(products, [
      'owner',
      'mainPhoto',
      'category',
    ]);
  }

  async findSold(authUser: User, idUser: number): Promise<Product[]> {
    const products = await this.productRepository.findByDistance(
      authUser.lat,
      authUser.lng,
      authUser.id,
      { owner: { id: idUser }, status: 3 },
    );
    return this.productRepository.populate(products, [
      'owner',
      'mainPhoto',
      'category',
    ]);
  }

  async findBought(authUser: User, idUser: number): Promise<Product[]> {
    const products = await this.productRepository.findByDistance(
      authUser.lat,
      authUser.lng,
      authUser.id,
      { soldTo: { id: idUser }, status: 3 },
    );
    return this.productRepository.populate(products, [
      'owner',
      'mainPhoto',
      'category',
    ]);
  }

  async findById(authUser: User, id: number): Promise<Product> {
    const product = await this.productRepository.findById(
      id,
      authUser.id,
      authUser.lat,
      authUser.lng,
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.numVisits++;
    this.productRepository.getEntityManager().flush();
    product.rating = await this.transRepository.findOne({ product });
    return await this.productRepository.populate(product, [
      'owner',
      'soldTo',
      'mainPhoto',
      'category',
      'photos',
    ]) as unknown as Product;
  }

  async insert(authUser: User, prodDto: InsertProductDto): Promise<Product> {
    const photoUrl = await this.imageService.saveImage(
      'products',
      prodDto.mainPhoto,
    );
    const category = await this.catRepository.getReference(prodDto.category);
    const user = await this.userRepository.getReference(authUser.id);
    const mainPhoto = new ProductPhoto(photoUrl);
    const product = new Product(
      prodDto.title,
      prodDto.description,
      prodDto.price,
      user,
      category,
    );
    product.photos.add(mainPhoto);
    await this.productRepository.getEntityManager().persistAndFlush(product);
    product.mainPhoto = mainPhoto;
    await this.productRepository.getEntityManager().flush();
    this.productRepository.populate(product, ['mainPhoto']);
    return product;
  }

  async update(
    authUser: User,
    id: number,
    prodDto: EditProductDto,
  ): Promise<Product> {
    const product = await this.getAndCheckProduct(authUser, id, [
      'owner',
      'mainPhoto',
      'category',
    ]);
    if (prodDto.title) product.title = prodDto.title;
    if (prodDto.description) product.description = prodDto.description;
    if (prodDto.price) product.price = prodDto.price;
    if (prodDto.status) {
      product.status = prodDto.status;
      if (product.status === 3) {
        product.soldTo = await this.userRepository.findOne(prodDto.soldTo);
      }
    }
    if (prodDto.category) {
      product.category = await this.catRepository.findOne(prodDto.category);
      if (!product.category) {
        throw new BadRequestException('Category not found');
      }
    }
    if (prodDto.mainPhoto) {
      product.mainPhoto = await this.prodPhotoRepository.findOne(
        prodDto.mainPhoto,
      );
      if (!product.mainPhoto || product.mainPhoto.product.id !== id) {
        throw new BadRequestException("It must be a product's photo");
      }
    }
    this.productRepository.getEntityManager().flush();
    return product;
  }

  async buyProduct(authUser: User, id: number): Promise<void> {
    const product = await this.productRepository.findOne({ id }, { populate :[
      'owner',
      'mainPhoto',
      'category',
    ] });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.status = 3;
    product.soldTo = authUser;
    await this.productRepository.getEntityManager().flush();
    if (product.owner.firebaseToken) {
      await this.firebaseService.sendMessage(
        product.owner.firebaseToken,
        'You have sold a product!',
        `${authUser.name} has bought ${product.title}`,
        { prodId: '' + product.id },
      );
    }
  }

  async delete(authUser: User, id: number): Promise<void> {
    const product = await this.getAndCheckProduct(authUser, id);
    await this.productRepository.getEntityManager().removeAndFlush(product); // TODO: Usuario logueado
  }

  async addBookmark(authUser: User, idProd: number): Promise<void> {
    const bookmark = await this.prodBookmarkRepository.findOne({
      $and: [{ user: { id: authUser.id } }, { product: { id: idProd } }],
    });
    if (!bookmark) {
      try {
        await this.prodBookmarkRepository.nativeInsert({
          user: authUser.id,
          product: idProd ,
        });
      } catch (e) {
        throw new NotFoundException('Product not found');
      }
    }
  }

  async removeBookmark(authUser: User, idProd: number): Promise<void> {
    await this.prodBookmarkRepository.nativeDelete({
      user: { id: authUser.id },
      product: { id: idProd },
    });
  }

  async addPhoto(
    authUser: User,
    idProd: number,
    photoDto: AddPhotoDto,
  ): Promise<ProductPhoto> {
    const product = await this.getAndCheckProduct(authUser, idProd);
    const photoUrl = await this.imageService.saveImage(
      'products',
      photoDto.photo,
    );
    const photo = new ProductPhoto(photoUrl);
    photo.product = product;
    await this.prodPhotoRepository.getEntityManager().persist(photo);
    if (photoDto.setMain) {
      product.mainPhoto = photo;
    }
    await this.productRepository.getEntityManager().flush();
    return photo;
  }

  async removePhoto(
    authUser: User,
    idProd: number,
    idPhoto: number,
  ): Promise<void> {
    const product = await this.getAndCheckProduct(authUser, idProd, ['photos']);
    const photo = product.photos
      .getItems()
      .find((photo) => photo.id === idPhoto);
    if (!photo) {
      throw new NotFoundException('Photo not found in this product');
    }
    await this.prodPhotoRepository.getEntityManager().removeAndFlush(photo);
  }
}
