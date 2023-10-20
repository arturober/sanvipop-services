import { Cascade, Entity, Index, ManyToOne, OneToOne, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Transform, Exclude } from 'class-transformer';
import { Category } from './Category';
import { ProductPhoto } from './ProductPhoto';
import { User } from './User';
import { ProductBookmark } from './ProductBookmark';
import { Transaction } from './Transaction';
import { ProductsRepository } from 'src/products/products.repository';

@Entity({ customRepository: () => ProductsRepository })
export class Product {

  @PrimaryKey()
  id!: number;

  @Index({ name: 'datePublished' })
  @Property({ columnType: 'timestamp', fieldName: 'datePublished', defaultRaw: `CURRENT_TIMESTAMP` })
  datePublished!: Date;

  @Property({ length: 250 })
  title!: string;

  @Property({ length: 2000 })
  description!: string;

  @Property({columnType: 'tinyint'})
  status: number = 1;

  @Property({ columnType: 'double' })
  price!: number;

  @ManyToOne({ entity: () => User, fieldName: 'idUser', cascade: [Cascade.MERGE], index: 'idUser' })
  owner!: User;

  @Property({ fieldName: 'numVisits', default: 0 })
  numVisits?: number = 0;

  @ManyToOne({ entity: () => Category, fieldName: 'idCategory', cascade: [Cascade.MERGE], index: 'idCategory' })
  category!: Category;

  @OneToOne({ entity: () => ProductPhoto, fieldName: 'mainPhoto', cascade: [Cascade.MERGE], nullable: true, index: 'mainPhoto', unique: 'mainPhoto_2' })
  @Transform(p => p.value && p.value.url)
  mainPhoto?: ProductPhoto;

  @ManyToOne({ entity: () => User, fieldName: 'soldTo', cascade: [Cascade.MERGE], nullable: true, index: 'soldTo' })
  soldTo?: User;

  @OneToOne({entity: () => Transaction, mappedBy: t => t.product})
  rating?: Transaction;

  @OneToMany({ entity: () => ProductPhoto, mappedBy: photo => photo.product, cascade: [Cascade.PERSIST]})
  @Transform(photos => photos.value.isInitialized() ? photos.value.getItems() : null)
  photos = new Collection<ProductPhoto>(this);

  @OneToMany({ entity: () => ProductBookmark, mappedBy: bm => bm.product})
  @Exclude()
  bookmarks = new Collection<ProductPhoto>(this);

  @Property({persist: false})
  bookmarked?: boolean;

  @Property({persist: false})
  distance?: number;

  constructor(title: string, description: string, price: number, owner: User, category: Category) {
    this.title = title;
    this.description = description;
    this.price = price;
    this.owner = owner;
    this.category = category;
  }

  addPhoto(photo: ProductPhoto): void {
    this.photos.add(photo);
    photo.product = this;
  }
}
