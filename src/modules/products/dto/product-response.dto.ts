import type { Request } from 'express';
import { Product } from '../entities/product.entity.js';
import { buildFullImageUrl } from '../../../common/utils/image-url.util.js';

export class ProductOwnerResponseDto {
  /**
   * Identificador único del usuario
   * @example 1
   */
  id!: number;

  /**
   * Nombre completo del usuario
   * @example "María Gómez"
   */
  name!: string;

  /**
   * Correo electrónico del usuario
   * @example "maria@sanvipop.es"
   */
  email!: string;

  /**
   * Latitud geográfica
   * @example 38.39
   */
  lat!: number;

  /**
   * Longitud geográfica
   * @example -0.51
   */
  lng!: number;

  /**
   * URL absoluta de la fotografía de perfil
   * @example "http://localhost:3000/img/users/avatar.jpg"
   */
  photo!: string;
}

export class ProductCategoryResponseDto {
  /**
   * Identificador de la categoría
   * @example 4
   */
  id!: number;

  /**
   * Nombre de la categoría
   * @example "Deportes"
   */
  name!: string;
}

export class ProductPhotoItemDto {
  /**
   * Identificador de la foto
   * @example 1
   */
  id!: number;

  /**
   * URL absoluta de la foto
   * @example "http://localhost:3000/img/products/product-1.jpg"
   */
  url!: string;
}

export class ProductTransactionResponseDto {
  /**
   * Calificación otorgada por el vendedor (1-5)
   * @example 5
   */
  sellerRating?: number;

  /**
   * Calificación otorgada por el comprador (1-5)
   * @example 5
   */
  buyerRating?: number;

  /**
   * Comentario del vendedor
   * @example "Comprador atento y puntual"
   */
  sellerComment?: string;

  /**
   * Comentario del comprador
   * @example "Producto en excelente estado"
   */
  buyerComment?: string;

  /**
   * Fecha de la transacción
   * @example "2026-03-16T14:30:00.000Z"
   */
  dateTransaction?: Date;
}

export class ProductResponseDto {
  /**
   * Identificador único del producto
   * @example 1
   */
  id!: number;

  /**
   * Título del producto
   * @example "Bicicleta de montaña Rockrider"
   */
  title!: string;

  /**
   * Descripción del producto
   * @example "Bicicleta en perfecto estado, talla M..."
   */
  description!: string;

  /**
   * Precio en euros
   * @example 150.0
   */
  price!: number;

  /**
   * Estado del producto (1: Disponible, 2: Reservado, 3: Vendido)
   * @example 1
   */
  status!: number;

  /**
   * Fecha de publicación
   * @example "2026-03-15T10:00:00.000Z"
   */
  datePublished!: Date;

  /**
   * Número de visitas recibidas
   * @example 24
   */
  numVisits!: number;

  /**
   * Categoría a la que pertenece el producto
   */
  category!: ProductCategoryResponseDto;

  /**
   * Propietario del producto
   */
  owner!: ProductOwnerResponseDto;

  /**
   * Comprador del producto si ha sido vendido
   */
  soldTo?: ProductOwnerResponseDto;

  /**
   * URL absoluta de la foto principal del producto
   * @example "http://localhost:3000/img/products/product-1.jpg"
   */
  mainPhoto?: string;

  /**
   * Galería de fotografías asociadas al producto
   */
  photos?: ProductPhotoItemDto[];

  /**
   * Valoración y transacción si el producto fue vendido
   */
  rating?: ProductTransactionResponseDto;

  /**
   * Distancia en kilómetros respecto al usuario autenticado
   * @example 1.45
   */
  distance?: number;

  /**
   * Indica si el usuario autenticado tiene el producto en favoritos
   * @example false
   */
  bookmarked!: boolean;

  /**
   * Indica si el producto pertenece al usuario autenticado
   * @example false
   */
  mine!: boolean;

  /**
   * Método estático de factoría para transformar una entidad Product a ProductResponseDto
   */
  static fromEntity(
    product: Product,
    req?: Request,
    authUserId?: number,
  ): ProductResponseDto {
    const isMine =
      authUserId !== undefined && product.owner
        ? product.owner.id === authUserId
        : false;

    let mainPhotoUrl: string | undefined;
    if (product.mainPhoto) {
      const isInit =
        typeof (product.mainPhoto as any).isInitialized === 'function'
          ? (product.mainPhoto as any).isInitialized()
          : (product.mainPhoto as any).__helper &&
              typeof (product.mainPhoto as any).__helper.isInitialized === 'function'
            ? (product.mainPhoto as any).__helper.isInitialized()
            : true;
      if (isInit) {
        const rawUrl =
          typeof product.mainPhoto === 'string'
            ? product.mainPhoto
            : (product.mainPhoto as any).url;
        if (rawUrl) {
          mainPhotoUrl = buildFullImageUrl(req, rawUrl);
        }
      }
    }

    let photosList: ProductPhotoItemDto[] | undefined;
    if (product.photos) {
      const isCollection =
        typeof (product.photos as any).getItems === 'function';
      const isInit = isCollection
        ? typeof (product.photos as any).isInitialized === 'function'
          ? (product.photos as any).isInitialized()
          : true
        : true;

      if (isInit) {
        const rawPhotos = isCollection
          ? (product.photos as any).getItems()
          : Array.isArray(product.photos)
            ? product.photos
            : [];

        if (rawPhotos.length > 0) {
          photosList = rawPhotos.map((photo: any) => ({
            id: photo.id,
            url: buildFullImageUrl(req, photo.url),
          }));
        }
      }
    }

    let ratingDto: ProductTransactionResponseDto | undefined;
    if (product.rating) {
      const r = product.rating as any;
      const isInit =
        typeof r.isInitialized === 'function'
          ? r.isInitialized()
          : r.__helper && typeof r.__helper.isInitialized === 'function'
            ? r.__helper.isInitialized()
            : true;
      if (isInit && (r.sellerRating !== undefined || r.buyerRating !== undefined)) {
        ratingDto = {
          sellerRating: r.sellerRating,
          buyerRating: r.buyerRating,
          sellerComment: r.sellerComment,
          buyerComment: r.buyerComment,
          dateTransaction: r.dateTransaction,
        };
      }
    }

    let soldToDto: ProductOwnerResponseDto | undefined;
    if (product.soldTo) {
      const s = product.soldTo as any;
      const isInit =
        typeof s.isInitialized === 'function'
          ? s.isInitialized()
          : s.__helper && typeof s.__helper.isInitialized === 'function'
            ? s.__helper.isInitialized()
            : true;
      if (isInit && s.name !== undefined) {
        soldToDto = {
          id: s.id,
          name: s.name,
          email: s.email,
          lat: s.lat,
          lng: s.lng,
          photo: buildFullImageUrl(req, s.photo),
        };
      }
    }

    let ownerDto: ProductOwnerResponseDto | undefined;
    if (product.owner) {
      const o = product.owner as any;
      const isInit =
        typeof o.isInitialized === 'function'
          ? o.isInitialized()
          : o.__helper && typeof o.__helper.isInitialized === 'function'
            ? o.__helper.isInitialized()
            : true;
      if (isInit) {
        ownerDto = {
          id: o.id,
          name: o.name,
          email: o.email,
          lat: o.lat,
          lng: o.lng,
          photo: buildFullImageUrl(req, o.photo),
        };
      }
    }

    const dto = new ProductResponseDto();
    dto.id = product.id;
    dto.title = product.title;
    dto.description = product.description;
    dto.price = product.price;
    dto.status = Number(product.status);
    dto.datePublished = product.datePublished;
    dto.numVisits = product.numVisits ?? 0;
    dto.category = {
      id: product.category?.id,
      name: product.category?.name,
    };
    dto.owner = ownerDto as any;
    dto.soldTo = soldToDto;
    dto.mainPhoto = mainPhotoUrl;
    dto.photos = photosList;
    dto.rating = ratingDto;
    dto.distance =
      product.distance !== undefined ? Number(product.distance) : undefined;
    dto.bookmarked = Boolean(product.bookmarked);
    dto.mine = isMine;

    return dto;
  }
}

/**
 * DTO que encapsula los metadatos de paginación de productos.
 */
export class ProductsPaginationDto {
  /**
   * Página actual solicitada
   * @example 1
   */
  page!: number;

  /**
   * Número total de páginas disponibles
   * @example 3
   */
  total_pages!: number;

  /**
   * Total de elementos disponibles en la consulta
   * @example 28
   */
  total_products!: number;
}

/**
 * DTO que contiene el listado de productos de base de datos y sus metadatos de paginación.
 */
export class PaginatedProductsDto extends ProductsPaginationDto {
  products!: Product[];

  static create(
    products: Product[],
    page: number,
    limit: number,
    total_products: number,
  ): PaginatedProductsDto {
    const dto = new PaginatedProductsDto();
    dto.products = products;
    dto.page = page;
    dto.total_pages = Math.ceil(total_products / limit);
    dto.total_products = total_products;
    return dto;
  }
}

/**
 * DTO de respuesta paginada con productos formateados para el cliente.
 */
export class PaginatedProductsResponseDto extends ProductsPaginationDto {
  /**
   * Lista de productos de la página actual
   */
  products!: ProductResponseDto[];

  static from(
    result: PaginatedProductsDto,
    req?: Request,
    authUserId?: number,
  ): PaginatedProductsResponseDto {
    const dto = new PaginatedProductsResponseDto();
    dto.products = result.products.map((p) =>
      ProductResponseDto.fromEntity(p, req, authUserId),
    );
    dto.page = result.page;
    dto.total_pages = result.total_pages;
    dto.total_products = result.total_products;
    return dto;
  }
}

export class ProductsResponseDto {
  /**
   * Lista de productos
   */
  products!: ProductResponseDto[];

  static from(
    products: Product[],
    req?: Request,
    authUserId?: number,
  ): ProductsResponseDto {
    const dto = new ProductsResponseDto();
    dto.products = products.map((p) =>
      ProductResponseDto.fromEntity(p, req, authUserId),
    );
    return dto;
  }
}

export class SingleProductResponseDto {
  /**
   * Detalle del producto
   */
  product!: ProductResponseDto;

  static from(
    product: Product,
    req?: Request,
    authUserId?: number,
  ): SingleProductResponseDto {
    const dto = new SingleProductResponseDto();
    dto.product = ProductResponseDto.fromEntity(product, req, authUserId);
    return dto;
  }
}

export class PhotoUploadResponseDto {
  /**
   * Foto subida
   */
  photo!: ProductPhotoItemDto;

  static from(photo: any, req?: Request): PhotoUploadResponseDto {
    const dto = new PhotoUploadResponseDto();
    dto.photo = {
      id: photo.id,
      url: buildFullImageUrl(req, photo.url),
    };
    return dto;
  }
}

export const toProductResponseDto = ProductResponseDto.fromEntity;
