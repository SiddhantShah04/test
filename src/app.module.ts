import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { ProtectModule } from './protect/protect.module';
import { EngagementEvent } from './protect/entities/engagement-event.entity';
import { SecurityDeductionRule } from './protect/entities/security-deduction-rule.entity';
import { EngagementRuleConfig } from './protect/entities/engagement-rule-config.entity';
import { DeviceDailyScore } from './protect/entities/device-daily-score.entity';
import { ThreatDetail } from './protect/entities/threat-detail.entity';
import { ProtectionMetricsDaily } from './protect/entities/protection-metrics-daily.entity';
import { DeviceCurrentScore } from './protect/entities/device-current-score.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'cybx_db',
        autoLoadModels: true,
        synchronize: true, // for dev only, disable in prod
        models: [
          EngagementEvent,
          SecurityDeductionRule,
          EngagementRuleConfig,
          DeviceDailyScore,
          ThreatDetail,
          ProtectionMetricsDaily,
          DeviceCurrentScore
        ]
      })
    }),
    ProtectModule
  ]
})
export class AppModule {}
