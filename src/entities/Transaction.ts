import { Cascade, Entity, Index, ManyToOne, Property, OneToOne, OneToMany, PrimaryKeyType } from '@mikro-orm/core';
import { Product } from './Product';
import { User } from './User';
import { Exclude } from 'class-transformer';

@Entity()
export class Transaction {

  @ManyToOne({ entity: () => User, fieldName: 'idSeller', cascade: [Cascade.MERGE], index: 'idSeller' })
  @Exclude()
  seller!: User;

  @ManyToOne({ entity: () => User, fieldName: 'idBuyer', cascade: [Cascade.MERGE], index: 'idBuyer' })
  @Exclude()
  buyer!: User;

  @OneToOne({ entity: () => Product, fieldName: 'idProduct', primary: true, owner: true, inversedBy: 'rating', index: 'idProduct', joinColumn: 'idProduct' })
  @Exclude()
  product!: Product;

  [PrimaryKeyType]: number;

  @Property({ fieldName: 'sellerRating', nullable: true  })
  sellerRating?: number;

  @Property({ fieldName: 'buyerRating', nullable: true })
  buyerRating?: number;

  @Property({ fieldName: 'sellerComment', length: 2000, nullable: true  })
  sellerComment?: string;

  @Property({ fieldName: 'buyerComment', length: 2000, nullable: true })
  buyerComment?: string;

  @Index({ name: 'dateTransaction' })
  @Property({ columnType: 'timestamp', fieldName: 'dateTransaction', defaultRaw: `CURRENT_TIMESTAMP` })
  dateTransaction!: Date;

  constructor(product: Product) {
    this.seller = product.owner;
    this.buyer = product.soldTo;
    this.product = product;
  }
}
