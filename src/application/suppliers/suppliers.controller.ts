import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { suppliersService } from './suppliers.service';

@Controller('suppliers')
export class suppliersController {
  constructor(private readonly suppliersService: suppliersService) {}

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.suppliersService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.suppliersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}