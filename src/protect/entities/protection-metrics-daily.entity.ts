import { Table, Column, DataType, Model, PrimaryKey, Default, Unique } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'protection_metrics_daily', timestamps: false })
export class ProtectionMetricsDaily extends Model<ProtectionMetricsDaily> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id!: string;

  @Unique('device_date_unique')
  @Column({ type: DataType.UUID, allowNull: false })
  deviceId!: string;

  @Unique('device_date_unique')
  @Column({ type: DataType.DATEONLY, allowNull: false })
  date!: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  linksScanned!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  spamBlocked!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  appIssuesDetected!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  networkIssuesDetected!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  deviceIssuesDetected!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  otherIssuesDetected!: number;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt!: Date;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt!: Date;
}
