import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { TemplateModule } from '../template/template.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    TemplateModule
  ],
  controllers: [SectionController],
  providers: [SectionService],
  exports: [
    SectionService,
    TypeOrmModule],
})
export class SectionModule {}
