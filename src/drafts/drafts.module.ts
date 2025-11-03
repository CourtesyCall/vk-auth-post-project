import { Module } from '@nestjs/common';
import { DraftsService } from './drafts.service';
import { DraftsController } from './drafts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Draft } from './entities/draft.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Draft]) // <-- 3. ДОБАВЬТЕ ЭТУ СТРОКУ
  ],
  controllers: [DraftsController],
  providers: [DraftsService],
})
export class DraftsModule {}
