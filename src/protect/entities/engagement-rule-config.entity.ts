import { Table, Column, DataType, Model, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';

@Table({ tableName: 'engagement_rules_config', timestamps: false })
export class EngagementRuleConfig extends Model<EngagementRuleConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  eventType!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  windowDays!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  minCount!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 2 })
  points!: number;
}
