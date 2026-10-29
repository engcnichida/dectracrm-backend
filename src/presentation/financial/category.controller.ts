import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CategoryService } from '../../application/financial/category.service';

@Controller('financial/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(@Query('type') type?: 'RECEITA' | 'DESPESA') {
    return this.categoryService.findAll(type);
  }

  @Post()
  create(@Body() data: { name: string; type: 'RECEITA' | 'DESPESA'; description?: string }) {
    return this.categoryService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; description?: string; isActive?: boolean }) {
    return this.categoryService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}