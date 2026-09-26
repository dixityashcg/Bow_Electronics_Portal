import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { addProductSchema, changePriceSchema, setStandardDiscountSchema } from '@bow/shared';
import { Internal } from '../access/rules.ts';
import { parseBody } from '../validation.ts';
import { CatalogService } from './catalog.service.ts';
import { DiscountService } from './discount.service.ts';
import { ErpFileRefused, readErpWorkbook } from './erp-reader.ts';

/** Store reads are open to internal users; every change needs the price maintainer role (story-01-04). */
@Controller('api/sales')
export class CatalogController {
  constructor(
    @Inject(CatalogService) private readonly catalog: CatalogService,
    @Inject(DiscountService) private readonly discounts: DiscountService,
  ) {}

  @Internal('search the store')
  @Get('store/products')
  search(@Query('q') q?: string) {
    return this.catalog.search(q ?? '');
  }

  @Internal('look up a part number')
  @Get('store/part-numbers/:partNumber')
  async byPartNumber(@Param('partNumber') partNumber: string) {
    const product = await this.catalog.findByPartNumber(partNumber);
    if (!product) throw new NotFoundException(`No product with part number ${partNumber} is in the store.`);
    return product;
  }

  @Internal('open a product')
  @Get('store/products/:id')
  product(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.getProduct(id);
  }

  @Internal('open a price history')
  @Get('store/products/:id/price-history')
  priceHistory(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.priceHistory(id);
  }

  @Internal('add a product', 'price maintainer')
  @Post('store/products')
  add(@Body() body: unknown) {
    return this.catalog.addProduct(parseBody(addProductSchema, body));
  }

  @Internal('change a price', 'price maintainer')
  @Post('store/products/:id/price')
  changePrice(@Req() request: FastifyRequest, @Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    return this.catalog.changePrice(request.portal!.user.id, id, parseBody(changePriceSchema, body).price);
  }

  @Internal('close a product for quoting', 'price maintainer')
  @Post('store/products/:id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.close(id);
  }

  @Internal('open the load summary')
  @Get('store/load-summary')
  async loadSummary() {
    return { summary: await this.catalog.loadSummary() };
  }

  @Internal('run the ERP load', 'price maintainer')
  @Post('store/load')
  async load(@Req() request: FastifyRequest) {
    const file = await request.file();
    if (!file) throw new BadRequestException('Choose the ERP spreadsheet (.xlsx) to load.');
    const buffer = await file.toBuffer();
    try {
      const read = await readErpWorkbook(buffer);
      return { summary: await this.catalog.load(request.portal!.user.id, file.filename, read) };
    } catch (error) {
      if (error instanceof ErpFileRefused) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Internal('see resellers')
  @Get('resellers')
  resellers() {
    return this.discounts.listResellers();
  }

  @Internal('open a discount history')
  @Get('resellers/:id/discount-history')
  discountHistory(@Param('id', ParseIntPipe) id: number) {
    return this.discounts.discountHistory(id);
  }

  @Internal('set a standard discount', 'discount setter')
  @Post('resellers/:id/standard-discount')
  setDiscount(@Req() request: FastifyRequest, @Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    return this.discounts.setStandardDiscount(request.portal!.user.id, id, parseBody(setStandardDiscountSchema, body).percent);
  }
}
