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
  PRODUCT_CREATED,
  PRODUCT_DELETED,
  PRODUCT_UPDATED,
} from '../../../common/constants/product.constants';
import { RoleEnum } from '../../../common/constants/user.constants';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { ProductDto } from './dto/product.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @ResponseMessage(PRODUCT_CREATED)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async create(
    @Body() requestData: ProductDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    return await this.productService.create(requestData, files);
  }

  @Get()
  async paginate(@Query() queryData) {
    return await this.productService.paginate(queryData);
  }

  @ResponseMessage(PRODUCT_DELETED)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.productService.delete(id);
  }

  @ResponseMessage(PRODUCT_UPDATED)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() requestData,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    return await this.productService.update(id, requestData, files);
  }
}