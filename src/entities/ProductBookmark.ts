import { Cascade, Entity, ManyToOne } from '@mikro-orm/core';
import { Product } from './Product';
import { User } from './User';

@Entity()
export class ProductBookmark {

  @ManyToOne({ entity: () => Product, fieldName: 'idProduct', cascade: [Cascade.ALL], primary: true })
  product: Product;

  @ManyToOne({ entity: () => User, fieldName: 'idUser', cascade: [Cascade.ALL], primary: true, index: 'idUser' })
  user: User;

  constructor(product: Product, user: User) {
    this.product = product;
    this.user = user;
  }
}
