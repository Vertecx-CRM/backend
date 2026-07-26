import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService implements OnModuleInit {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        reviewid SERIAL PRIMARY KEY,
        name VARCHAR(90) NOT NULL,
        role VARCHAR(120),
        company VARCHAR(120),
        city VARCHAR(90),
        email VARCHAR(160),
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment VARCHAR(700) NOT NULL,
        approved BOOLEAN NOT NULL DEFAULT true,
        source VARCHAR(40) NOT NULL DEFAULT 'website',
        createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  create(dto: CreateReviewDto) {
    const review = this.reviewsRepository.create({
      ...dto,
      approved: true,
      source: 'website',
    });

    return this.reviewsRepository.save(review);
  }

  findPublic(limit = 8) {
    const safeLimit = Math.min(Math.max(limit, 1), 24);

    return this.reviewsRepository.find({
      where: { approved: true },
      order: { createdat: 'DESC' },
      take: safeLimit,
    });
  }

  async getSummary() {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('COUNT(review.reviewid)', 'count')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'average')
      .where('review.approved = :approved', { approved: true })
      .getRawOne<{ count: string; average: string }>();

    return {
      count: Number(result?.count ?? 0),
      average: Number(Number(result?.average ?? 0).toFixed(1)),
    };
  }
}
