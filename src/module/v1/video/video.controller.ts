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
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../../../common/decorator/public.decorator';
import { ResponseMessage } from '../../../common/decorator/response.decorator';
import {
  DATA_FETCH,
  VIDEO_CREATED,
  VIDEO_DELETED,
  VIDEO_UPDATED,
} from '../../../common/constants/product.constants';
import { VideoService } from './video.service';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @ResponseMessage(DATA_FETCH)
  @Public()
  @Get()
  async paginate(@Query() queryData) {
    return await this.videoService.paginate(queryData);
  }

  @ResponseMessage(DATA_FETCH)
  @Public()
  @Get(':id')
  async getSingleProduct(@Param('id') id: string) {
    return await this.videoService.getSingleVideo(id);
  }

  @ResponseMessage(VIDEO_DELETED)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.videoService.delete(id);
  }

  @ResponseMessage(VIDEO_CREATED)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
  )
  async create(
    @Body() requestData,
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File[]; file?: Express.Multer.File[] },
  ) {
    return await this.videoService.create(requestData, files);
  }

  @ResponseMessage(VIDEO_UPDATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
  )
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() requestData,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
  ) {
    return await this.videoService.update(id, requestData, files);
  }
}
