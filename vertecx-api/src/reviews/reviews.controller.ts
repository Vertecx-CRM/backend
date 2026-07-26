import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findPublic(@Query('limit') limit?: string) {
    return this.reviewsService.findPublic(Number(limit) || 8);
  }

  @Get('summary')
  getSummary() {
    return this.reviewsService.getSummary();
  }

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }
}
