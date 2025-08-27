import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceholerEntity } from './placeholer.entity/placeholer.entity';
import { PlaceholderController } from './placeholder.controller';
import { PlaceholderService } from './placeholder.service';


@Module({
  imports: [TypeOrmModule.forFeature([PlaceholerEntity])],
  providers: [PlaceholderService],
  controllers: [PlaceholderController],
  exports: [PlaceholderService],
})
export class PlaceholderModule {}
