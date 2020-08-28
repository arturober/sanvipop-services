import { Entity, PrimaryKey, Property, Unique, Collection, ManyToMany } from '@mikro-orm/core';
import { Product } from './Product';
import { Exclude } from 'class-transformer';

@Entity()
export class User {

  @PrimaryKey()
  id!: number;

  @Property({ columnType: 'timestamp', fieldName: 'registrationDate', defaultRaw: `CURRENT_TIMESTAMP` })
  registrationDate!: Date;

  @Property({ length: 250 })
  name!: string;

  @Unique({ name: 'email' })
  @Property({ length: 250 })
  email!: string;

  @Property({ length: 100, nullable: true, hidden: true })
  @Exclude({toPlainOnly: true})
  password?: string;

  @Property({ columnType: 'double' })
  lat!: number;

  @Property({ columnType: 'double' })
  lng!: number;

  @Property({hidden: true})
  @Exclude()
  role!: number;

  @Property({ length: 200 })
  photo!: string;

  @Property({ fieldName: 'idGoogle', length: 100, nullable: true, hidden: true })
  @Exclude({toPlainOnly: true})
  idGoogle?: string;

  @Property({ fieldName: 'idFacebook', length: 100, nullable: true, hidden: true })
  @Exclude({toPlainOnly: true})
  idFacebook?: string;

  @Property({ fieldName: 'firebaseToken', length: 200, nullable: true, hidden: true })
  @Exclude({toPlainOnly: true})
  firebaseToken?: string;

  @ManyToMany({ entity: () => Product, owner: true, pivotTable: 'product_bookmark', joinColumn: 'idProduct', inverseJoinColumn: 'idUser'})
  @Exclude()
  bookmarks = new Collection<Product>(this);

  @Property({persist: false})
  me?: boolean;
}
