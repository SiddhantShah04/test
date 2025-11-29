import { Table, Column, DataType, Model, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';

@Table({ tableName: 'security_deduction_rules', timestamps: false })
export class SecurityDeductionRule extends Model<SecurityDeductionRule> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @Unique('threat_severity_unique')
  @Column({ type: DataType.STRING, allowNull: false })
  threatType!: string; // matches threat_details.threat_type

  @Unique('threat_severity_unique')
  @Column({ type: DataType.ENUM('low', 'medium', 'high'), allowNull: false })
  severity!: 'low' | 'medium' | 'high';

  @Column({ type: DataType.INTEGER, allowNull: false })
  deduction!: number; // e.g. 3, 7, 15
}
