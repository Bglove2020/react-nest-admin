import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingService } from './logging.service';
import loggingConfig from '../../config/logging.config';
import { AlsModule } from '../als/als.module';

@Global()
@Module({
  imports: [ConfigModule.forFeature(loggingConfig), AlsModule],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
