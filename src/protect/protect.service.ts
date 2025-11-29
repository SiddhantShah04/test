import { Injectable } from '@nestjs/common';
import { ScoreEngineService } from './score-engine/score-engine.service';

@Injectable()
export class ProtectService {
  constructor(private readonly scoreEngine: ScoreEngineService) {}

  getScore(deviceId: string) {
    return this.scoreEngine.calculateAndPersistScore(deviceId);
  }

  getScorePreview(deviceId: string, threatIds: string[], ignoreOtherThreats = true) {
    return this.scoreEngine.calculatePreviewScore(deviceId, threatIds, ignoreOtherThreats);
  }

  getWeeklyProgress(deviceId: string) {
    return this.scoreEngine.getWeeklyProgress(deviceId);
  }

  getProtectionSummary(deviceId: string) {
    return this.scoreEngine.getProtectionSummary(deviceId);
  }
}
