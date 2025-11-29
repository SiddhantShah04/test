import { Table, Column, DataType, Model, PrimaryKey, Default, ForeignKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'engagement_events', timestamps: false })
export class EngagementEvent extends Model<EngagementEvent> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id!: string;

  @Column({ type: DataType.UUID, allowNull: false })
  deviceId!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  eventType!: string; // DAILY_ACTIVE, DEVICE_SCAN, ALERT_RESPONDED, FEATURE_USED, ISSUE_RESOLVED

  @Column({ type: DataType.DATE, allowNull: false })
  occurredAt!: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 2 })
  points!: number;

  @Column({ type: DataType.JSONB, allowNull: true })
  meta?: Record<string, any>;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt!: Date;
}
