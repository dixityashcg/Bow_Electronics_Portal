import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller.ts';
import { CatalogService } from './catalog.service.ts';
import { DiscountService } from './discount.service.ts';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, DiscountService],
  exports: [CatalogService, DiscountService],
})
export class CatalogModule {}
