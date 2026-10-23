import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './controllers/app.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { PhoneValidatorService } from './services/phone-validator.service';
import { FileParserService } from './services/file-parser.service';
import { FileProcessorService } from './services/file-processor.service';
import { FileCleanupService } from './services/file-cleanup.service';
import { DashboardSessions } from './services/dashboard-sessions.service';
import { dashboardDir, publicDir } from './common/functions/paths';

// Express 5 wildcard syntax: let the API routes handle everything under /api
const exclude = ['/api/{*path}'];
const dashboard = dashboardDir();

/**
 * Root application module
 * Serves the dashboard on "/", the static API/health pages' assets, and the REST API
 */
@Module({
  imports: [
    ServeStaticModule.forRoot(
      // The built dashboard wins for "/"; public/ supplies assets for the API pages and a fallback page
      ...(dashboard ? [{ rootPath: dashboard, exclude }] : []),
      { rootPath: publicDir(), exclude },
    ),
  ],
  controllers: [DashboardController, AppController],
  providers: [
    PhoneValidatorService,
    FileParserService,
    FileProcessorService,
    FileCleanupService,
    DashboardSessions,
  ],
})
export class AppModule {}
