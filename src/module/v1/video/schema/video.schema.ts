import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  file: string;

  @Prop()
  thumbnail: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
