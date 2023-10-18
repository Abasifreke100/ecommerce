import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from './schema/video.schema';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    private spacesService: SpacesService,
  ) {}
  async paginate(query: any) {
    let { currentPage, size, sort } = query;

    currentPage = Number(currentPage) ? parseInt(currentPage) : 1;
    size = Number(size) ? parseInt(size) : 10;
    sort = sort ? sort : 'desc';

    delete query.currentPage;
    delete query.size;
    delete query.sort;

    const count = await this.videoModel.count();
    const response = await this.videoModel
      .find()
      .skip(size * (currentPage - 1))
      .limit(size)
      .sort({ createdAt: sort });

    return {
      response,
      pagination: {
        total: count,
        currentPage,
        size,
      },
    };
  }
  async getSingleVideo(id) {
    const video = await this.videoModel.findOne({
      _id: id,
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async delete(id) {
    const video = await this.videoModel.findByIdAndDelete({
      _id: id,
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return;
  }

  async create(requestData, files = null) {
    const [thumbnailUrl, fileUrl] = await Promise.all([
      this.spacesService.uploadFile(
        files?.thumbnail?.length > 0 && files.thumbnail[0],
      ),
      this.spacesService.uploadFile(files?.file?.length > 0 && files.file[0]),
    ]);

    const uploadUrls = {
      thumbnail: thumbnailUrl,
      file: fileUrl,
    };

    const data = { ...requestData, ...uploadUrls };
    try {
      return await this.videoModel.create(data);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async update(id, requestData, files: any) {
    try {
      const thumbnailUrl = files?.thumbnail
        ? await this.spacesService.uploadFile(files.thumbnail[0])
        : undefined;
      const fileUrl = files?.file
        ? await this.spacesService.uploadFile(files.file[0])
        : undefined;

      const uploadUrls = {
        ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
        ...(fileUrl && { file: fileUrl }),
        ...requestData,
      };

      const movie = await this.videoModel.findByIdAndUpdate(id, uploadUrls, {
        new: true,
      });

      if (!movie) {
        throw new NotFoundException('Video not found');
      }

      return movie;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
