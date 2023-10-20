import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ResponseMessage } from '../../../common/decorator/response.decorator';
import {
  DATA_FETCH,
  PRODUCT_CREATED,
  PRODUCT_DELETED,
  PRODUCT_UPDATED,
} from '../../../common/constants/product.constants';
import { RoleEnum } from '../../../common/constants/user.constants';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '../../../common/decorator/public.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @ResponseMessage(PRODUCT_CREATED)
  @UseInterceptors(FilesInterceptor('images'))
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async create(
    @Body() requestData,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    return await this.productService.create(requestData, images);
  }

  @Public()
  @Get()
  async paginate(@Query() queryData) {
    return await this.productService.paginate(queryData);
  }

  @Public()
  @Get(':id')
  async getSingleProduct(@Param('id') id: string) {
    return await this.productService.getSingleProduct(id);
  }

  @ResponseMessage(PRODUCT_DELETED)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.productService.delete(id);
  }

  @ResponseMessage(PRODUCT_UPDATED)
  @UseInterceptors(FilesInterceptor('images'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() requestData,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    return await this.productService.update(id, requestData, images);
  }

  @Public()
  @ResponseMessage(DATA_FETCH)
  @Get('product/test')
  async testMethod() {
    return 'Nothing happens here';
  }
}
