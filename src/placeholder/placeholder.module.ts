import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceholderEntity } from './placeholer.entity/placeholderEntity';
import { PlaceholderController } from './placeholder.controller';
import { PlaceholderService } from './placeholder.service';
import { SectionModule } from '../section/section.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceholderEntity]),
    SectionModule
  ],
  providers: [PlaceholderService],
  controllers: [PlaceholderController],
  exports: [PlaceholderService],
})
export class PlaceholderModule {}
