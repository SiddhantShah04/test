import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProtectService } from './protect.service';
import { ScorePreviewDto } from './dtos/score-preview.dto';

@Controller('devices/:deviceId')
export class ProtectController {
  constructor(private readonly protectService: ProtectService) {}

  @Get('score')
  async getScore(@Param('deviceId') deviceId: string) {
    return this.protectService.getScore(deviceId);
  }

  @Post('score/preview')
  async getScorePreview(
    @Param('deviceId') deviceId: string,
    @Body() body: ScorePreviewDto
  ) {
    return this.protectService.getScorePreview(deviceId, body.threatIds, body.ignoreOtherThreats);
  }

  @Get('protection-summary')
  async getProtectionSummary(
    @Param('deviceId') deviceId: string,
    @Query('scope') scope?: string
  ) {
    // scope is currently ignored, always returns both, but param is accepted for future use
    return this.protectService.getProtectionSummary(deviceId);
  }

  @Get('score/weekly-progress')
  async getWeeklyProgress(@Param('deviceId') deviceId: string) {
    return this.protectService.getWeeklyProgress(deviceId);
  }
}
