import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schema/video.schema';
import { SpacesModule } from '../spaces/spaces.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    SpacesModule,
  ],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {}
