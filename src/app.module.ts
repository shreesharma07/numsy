import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './controllers/app.controller';
import { PhoneValidatorService } from './services/phone-validator.service';
import { FileParserService } from './services/file-parser.service';
import { FileProcessorService } from './services/file-processor.service';

/**
 * Root application module
 * Configures services, controllers, and static file serving
 */
@Module({
  imports: [
    // Serve static files from the public directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [AppController],
  providers: [PhoneValidatorService, FileParserService, FileProcessorService],
})
export class AppModule {}
