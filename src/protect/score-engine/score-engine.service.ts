import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ThreatDetail } from '../entities/threat-detail.entity';
import { SecurityDeductionRule } from '../entities/security-deduction-rule.entity';
import { EngagementEvent } from '../entities/engagement-event.entity';
import { DeviceDailyScore } from '../entities/device-daily-score.entity';
import { DeviceCurrentScore } from '../entities/device-current-score.entity';
import { ProtectionMetricsDaily } from '../entities/protection-metrics-daily.entity';
import { Op } from 'sequelize';

export interface ScoreBreakdown {
  securityScore: number;
  securityDeductions: number;
  engagementPoints: number;
  insurancePoints: number;
}

export interface ScoreResult {
  deviceId: string;
  totalScore: number;
  status: string;
  colorCode: string;
  message: string;
  breakdown: ScoreBreakdown;
  lastCalculatedAt: Date;
}

@Injectable()
export class ScoreEngineService {
  private readonly MAX_SECURITY = 60;
  private readonly MAX_TOTAL = 90;
  private readonly MAX_ENGAGEMENT = 10;
  private readonly ENGAGEMENT_WINDOW_DAYS = 7;

  constructor(
    @InjectModel(ThreatDetail) private readonly threatModel: typeof ThreatDetail,
    @InjectModel(SecurityDeductionRule) private readonly ruleModel: typeof SecurityDeductionRule,
    @InjectModel(EngagementEvent) private readonly engagementModel: typeof EngagementEvent,
    @InjectModel(DeviceDailyScore) private readonly dailyScoreModel: typeof DeviceDailyScore,
    @InjectModel(DeviceCurrentScore) private readonly currentScoreModel: typeof DeviceCurrentScore,
    @InjectModel(ProtectionMetricsDaily) private readonly metricsModel: typeof ProtectionMetricsDaily
  ) {}

  async calculateAndPersistScore(deviceId: string): Promise<ScoreResult> {
    const now = new Date();
    const { securityScore, securityDeductions } = await this.calculateSecurity(deviceId);
    const engagementPoints = await this.calculateEngagement(deviceId);
    const insurancePoints = 0;

    let totalScore = securityScore + engagementPoints + insurancePoints;
    if (totalScore > this.MAX_TOTAL) totalScore = this.MAX_TOTAL;

    const { status, colorCode, message } = this.getStatusMeta(totalScore);

    // upsert current score
    const current = await this.currentScoreModel.findByPk(deviceId);
    if (current) {
      current.totalScore = totalScore;
      current.securityScore = securityScore;
      current.securityDeductions = securityDeductions;
      current.engagementPoints = engagementPoints;
      current.insurancePoints = insurancePoints;
      current.status = status;
      current.colorCode = colorCode;
      current.lastCalculatedAt = now;
      // streak & phishing will be updated elsewhere if needed
      await current.save();
    } else {
      await this.currentScoreModel.create({
        deviceId,
        totalScore,
        securityScore,
        securityDeductions,
        engagementPoints,
        insurancePoints,
        status,
        colorCode,
        lastCalculatedAt: now,
        currentStreakDays: 0,
        phishingWeekCount: 0
      });
    }

    // upsert daily score for today
    const today = now.toISOString().slice(0, 10); // yyyy-mm-dd
    const [daily, created] = await this.dailyScoreModel.findOrCreate({
      where: { deviceId, date: today },
      defaults: {
        totalScore,
        components: { security: securityScore, engagement: engagementPoints, insurance: insurancePoints },
        status,
        createdAt: now,
        updatedAt: now
      }
    });
    if (!created) {
      daily.totalScore = totalScore;
      daily.components = { security: securityScore, engagement: engagementPoints, insurance: insurancePoints };
      daily.status = status;
      daily.updatedAt = now;
      await daily.save();
    }

    return {
      deviceId,
      totalScore,
      status,
      colorCode,
      message,
      breakdown: {
        securityScore,
        securityDeductions,
        engagementPoints,
        insurancePoints
      },
      lastCalculatedAt: now
    };
  }

  async calculatePreviewScore(deviceId: string, threatIds: string[], ignoreOtherThreats = true): Promise<ScoreResult> {
    
    const now = new Date();

    const { securityScore, securityDeductions } = await this.calculateSecurity(deviceId, threatIds, ignoreOtherThreats);
    
    const engagementPoints = await this.calculateEngagement(deviceId);
    const insurancePoints = 0;

    let totalScore = securityScore + engagementPoints + insurancePoints;
    if (totalScore > this.MAX_TOTAL) totalScore = this.MAX_TOTAL;

    const { status, colorCode, message } = this.getStatusMeta(totalScore);

    return {
      deviceId,
      totalScore,
      status,
      colorCode,
      message,
      breakdown: {
        securityScore,
        securityDeductions,
        engagementPoints,
        insurancePoints
      },
      lastCalculatedAt: now
    };
  }

  private async calculateSecurity(deviceId: string, threatIds?: string[], ignoreOtherThreats = true) {
    let where: any = { deviceId, status: 'active' };
    if (threatIds && threatIds.length > 0) {
      if (ignoreOtherThreats) {
        where = { id: { [Op.in]: threatIds }, deviceId, status: 'active' };
      } else {
        where = {
          deviceId,
          status: 'active',
          id: { [Op.or]: [{ [Op.in]: threatIds }, { [Op.notIn]: threatIds }] }
        };
      }
    }

    const threats = await this.threatModel.findAll({ where });
    if (!threats.length) {
      return { securityScore: this.MAX_SECURITY, securityDeductions: 0 };
    }

    const rules = await this.ruleModel.findAll();
    const ruleMap = new Map<string, number>();
    for (const r of rules) {
      ruleMap.set(`${r.threatType}_${r.severity}`, r.deduction);
    }

    let totalDeduction = 0;
    for (const t of threats) {
      const key = `${t.threatType}_${t.severity}`;
      const d = ruleMap.get(key) ?? 0;
      totalDeduction += d;
    }

    if (totalDeduction > this.MAX_SECURITY) totalDeduction = this.MAX_SECURITY;
    const securityScore = Math.max(0, this.MAX_SECURITY - totalDeduction);
    return { securityScore, securityDeductions: totalDeduction };
  }

  private async calculateEngagement(deviceId: string): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - this.ENGAGEMENT_WINDOW_DAYS);

    const events = await this.engagementModel.findAll({
      where: {
        deviceId,
        occurredAt: { [Op.gte]: since }
      }
    });

    const totalPoints = events.reduce((sum, e) => sum + (e.points ?? 0), 0);
    return Math.min(this.MAX_ENGAGEMENT, totalPoints);
  }

  private getStatusMeta(score: number): { status: string; colorCode: string; message: string } {
    if (score >= 85) {
      return {
        status: 'secure',
        colorCode: '#34C759',
        message: 'Your digital world is secure!'
      };
    }
    if (score >= 60) {
      return {
        status: 'at_risk',
        colorCode: '#FFCC00',
        message: 'You’re somewhat protected. Review suggestions below.'
      };
    }
    if (score >= 40) {
      return {
        status: 'vulnerable',
        colorCode: '#FF9500',
        message: 'You have multiple risks. Take action soon.'
      };
    }
    return {
      status: 'critical',
      colorCode: '#FF3B30',
      message: 'Critical vulnerabilities detected. Fix immediately!'
    };
  }

  async getWeeklyProgress(deviceId: string) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const last7 = new Date();
    last7.setDate(last7.getDate() - 6);

    const scores = await this.dailyScoreModel.findAll({
      where: {
        deviceId,
        date: { [Op.between]: [last7.toISOString().slice(0, 10), todayStr] }
      },
      order: [['date', 'ASC']]
    });

    const points = scores.map(s => ({ date: s.date, totalScore: s.totalScore }));

    const prevStart = new Date();
    prevStart.setDate(prevStart.getDate() - 13);
    const prevEnd = new Date();
    prevEnd.setDate(prevEnd.getDate() - 7);

    const prevScores = await this.dailyScoreModel.findAll({
      where: {
        deviceId,
        date: {
          [Op.between]: [
            prevStart.toISOString().slice(0, 10),
            prevEnd.toISOString().slice(0, 10)
          ]
        }
      }
    });

    const avg = (list: DeviceDailyScore[]) =>
      list.length ? list.reduce((s, d) => s + d.totalScore, 0) / list.length : 0;

    const thisAvg = avg(scores);
    const prevAvg = avg(prevScores);
    const changeAbsolute = thisAvg - prevAvg;
    const changePercent = prevAvg ? (changeAbsolute / prevAvg) * 100 : 0;

    // streak & phishing from DeviceCurrentScore (kept simple)
    const current = await this.currentScoreModel.findByPk(deviceId);
    const currentStreakDays = current?.currentStreakDays ?? 0;
    const phishingBlockedThisWeek = current?.phishingWeekCount ?? 0;

    return {
      period: '7d',
      trend: {
        points,
        changeAbsolute: Math.round(changeAbsolute),
        changePercent: Math.round(changePercent * 10) / 10
      },
      protectionProgress: {
        currentStreakDays,
        phishingBlockedThisWeek,
        suggestion: 'Keep opening CYBX daily to maintain your streak.'
      }
    };
  }

  async getProtectionSummary(deviceId: string) {
    const today = new Date();
    const windowDays = 30;
    const from = new Date();
    from.setDate(from.getDate() - windowDays);
    const fromStr = from.toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    const activeIssues = await this.threatModel.findAll({
      where: { deviceId, status: 'active' }
    });

    const countByType = (type: string) =>
      activeIssues.filter(i => i.threatType === type).length;

    const active = {
      linksScanned: await this.metricsModel.sum('linksScanned', {
        where: {
          deviceId,
          date: { [Op.between]: [fromStr, todayStr] }
        }
      }) as number ?? 0,
      spamBlocked: await this.metricsModel.sum('spamBlocked', {
        where: {
          deviceId,
          date: { [Op.between]: [fromStr, todayStr] }
        }
      }) as number ?? 0,
      appIssues: countByType('APP_ISSUE'),
      networkIssues: countByType('NETWORK_ISSUE'),
      deviceIssues: countByType('DEVICE_ISSUE'),
      otherIssues: countByType('OTHER')
    };

    const lifetimeRows = await this.metricsModel.findAll({ where: { deviceId } });
    const lifetime = lifetimeRows.reduce(
      (acc, row) => {
        acc.linksScanned += row.linksScanned;
        acc.spamBlocked += row.spamBlocked;
        acc.appIssues += row.appIssuesDetected;
        acc.networkIssues += row.networkIssuesDetected;
        acc.deviceIssues += row.deviceIssuesDetected;
        acc.otherIssues += row.otherIssuesDetected;
        return acc;
      },
      {
        linksScanned: 0,
        spamBlocked: 0,
        appIssues: 0,
        networkIssues: 0,
        deviceIssues: 0,
        otherIssues: 0
      }
    );

    return {
      scope: 'both',
      activeWindowDays: windowDays,
      active,
      lifetime
    };
  }
}
