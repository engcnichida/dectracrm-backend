import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../../domain/supplier.entity';
import { suppliersService } from './suppliers.service';
import { suppliersController } from './suppliers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [suppliersController],
  providers: [suppliersService],
  exports: [suppliersService],
})
export class suppliersModule {}