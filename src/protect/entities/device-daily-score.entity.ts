import { Table, Column, DataType, Model, PrimaryKey, Default, Unique } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'device_daily_scores', timestamps: false })
export class DeviceDailyScore extends Model<DeviceDailyScore> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id!: string;

  @Unique('device_date_unique')
  @Column({ type: DataType.UUID, allowNull: false })
  deviceId!: string;

  @Unique('device_date_unique')
  @Column({ type: DataType.DATEONLY, allowNull: false })
  date!: string; // yyyy-mm-dd

  @Column({ type: DataType.INTEGER, allowNull: false })
  totalScore!: number; // 0-90

  @Column({ type: DataType.JSONB, allowNull: true })
  components?: Record<string, any>;

  @Column({ type: DataType.STRING, allowNull: false })
  status!: string; // secure, at_risk, vulnerable, critical

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt!: Date;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt!: Date;
}
