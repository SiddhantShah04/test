import { Table, Column, DataType, Model, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'device_current_score', timestamps: false })
export class DeviceCurrentScore extends Model<DeviceCurrentScore> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  deviceId!: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  totalScore!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  securityScore!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  securityDeductions!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  engagementPoints!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  insurancePoints!: number;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'critical' })
  status!: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: '#FF3B30' })
  colorCode!: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  lastCalculatedAt!: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  currentStreakDays!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  phishingWeekCount!: number;
}
