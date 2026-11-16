import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateRatingDto } from '../dto/create-rating.dto.js';
import { UpdateRatingDto } from '../dto/update-rating.dto.js';
import { AuthGuard } from '../guard/auth.guard.js';

type AuthenticatedRequest = Request & { memberId: number };
import { RatingService } from '../service/rating.service.js';

@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get('members/:memberId/ratings')
  getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.ratingService.getRatingsByMember(memberId);
  }

  @Post('ratings')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: Request,
    @Body() dto: CreateRatingDto,
  ) {
    const result = await this.ratingService.create(
      (request as AuthenticatedRequest).memberId,
      dto,
    );
    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '평점 등록에 성공했습니다.',
      result,
    };
  }

  @Patch('ratings/:ratingId')
  @UseGuards(AuthGuard)
  async update(
    @Req() request: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    const result = await this.ratingService.update(
      (request as AuthenticatedRequest).memberId,
      ratingId,
      dto,
    );
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점 수정에 성공했습니다.',
      result,
    };
  }

  @Delete('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    await this.ratingService.delete(
      (request as AuthenticatedRequest).memberId,
      ratingId,
    );
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점 삭제에 성공했습니다.',
      result: null,
    };
  }
}
