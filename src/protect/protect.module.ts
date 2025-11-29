import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProtectController } from './protect.controller';
import { ProtectService } from './protect.service';
import { ScoreEngineService } from './score-engine/score-engine.service';
import { EngagementEvent } from './entities/engagement-event.entity';
import { SecurityDeductionRule } from './entities/security-deduction-rule.entity';
import { EngagementRuleConfig } from './entities/engagement-rule-config.entity';
import { DeviceDailyScore } from './entities/device-daily-score.entity';
import { ThreatDetail } from './entities/threat-detail.entity';
import { ProtectionMetricsDaily } from './entities/protection-metrics-daily.entity';
import { DeviceCurrentScore } from './entities/device-current-score.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      EngagementEvent,
      SecurityDeductionRule,
      EngagementRuleConfig,
      DeviceDailyScore,
      ThreatDetail,
      ProtectionMetricsDaily,
      DeviceCurrentScore
    ])
  ],
  controllers: [ProtectController],
  providers: [ProtectService, ScoreEngineService]
})
export class ProtectModule {}
