import { Table, Column, DataType, Model, PrimaryKey, Default } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'threat_details', timestamps: false })
export class ThreatDetail extends Model<ThreatDetail> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id!: string; // threatId from SDK

  @Column({ type: DataType.UUID, allowNull: false })
  deviceId!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  threatType!: string; // APP_ISSUE, NETWORK_ISSUE, DEVICE_ISSUE, UNSAFE_SITE, OTHER

  @Column({ type: DataType.ENUM('low', 'medium', 'high'), allowNull: false })
  severity!: 'low' | 'medium' | 'high';

  @Column({ type: DataType.ENUM('active', 'resolved'), allowNull: false })
  status!: 'active' | 'resolved';

  @Column({ type: DataType.DATE, allowNull: false })
  detectedAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  resolvedAt?: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  source?: string; // zempremium_sdk

  @Column({ type: DataType.JSONB, allowNull: true })
  rawPayload?: Record<string, any>;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt!: Date;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt!: Date;
}
