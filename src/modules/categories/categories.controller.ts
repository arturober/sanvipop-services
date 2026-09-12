import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Category } from './entities/category.entity.js';
import { CategoriesService } from './categories.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly catService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'List of all categories' })
  async getAllCategories(): Promise<{ categories: Category[] }> {
    return { categories: await this.catService.findAll() };
  }
}
