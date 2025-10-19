import { Module } from '@nestjs/common';
import { AppoimentsService } from './appoiments.service';
import { AppoimentsController } from './appoiments.controller';

@Module({
  controllers: [AppoimentsController],
  providers: [AppoimentsService],
})
export class AppoimentsModule {}
