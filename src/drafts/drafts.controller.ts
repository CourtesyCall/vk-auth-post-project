import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  HttpCode,
  HttpStatus, Req, ParseIntPipe,
} from '@nestjs/common';
import { DraftsService } from './drafts.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaveDraftDto } from './dto/save-draft.dto';

@UseGuards(JwtAuthGuard)
@Controller('drafts')
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Put(':templateId')
  @HttpCode(HttpStatus.OK) // 200 OK вместо 201 Created, т.к. это upsert
  saveDraft(
    @Req() req, // req.user.id должен содержать ID пользователя
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() saveDraftDto: SaveDraftDto,
  ) {
    const userId = req.user.id;
    return this.draftsService.saveDraft(userId, templateId, saveDraftDto);
  }

  @Get(':templateId')
  getDraft(
    @Req() req,
    @Param('templateId', ParseIntPipe) templateId: number,
  ) {
    const userId = req.user.id;
    return this.draftsService.getDraft(userId, templateId);
  }

  @Delete(':templateId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content - стандарт для DELETE
  deleteDraft(
    @Req() req,
    @Param('templateId', ParseIntPipe) templateId: number,
  ) {
    const userId = req.user.id;
    return this.draftsService.deleteDraft(userId, templateId);
  }
}
