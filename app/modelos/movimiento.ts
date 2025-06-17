import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import DataBaseConnection from '../lib/sequelize';

export class Movimiento extends Model<
  InferAttributes<Movimiento>,
  InferCreationAttributes<Movimiento>
> {
  declare id: CreationOptional<number>;
  declare fecha: string;
  declare codigoConcepto: number;
  declare descripcionConcepto: string;
  declare identificadorMovimiento: string;
  declare montoDebito: number;
  declare montoCredito: number;
  declare saldo: number;
  declare transferenciaCUIT: string;
  declare codigoConceptoEvo: number;
}

export const initMovimiento = async () => {
  const sequelize = await DataBaseConnection.getSequelizeInstance();

  Movimiento.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fecha: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      codigoConcepto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      descripcionConcepto: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      identificadorMovimiento: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      montoDebito: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      montoCredito: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      saldo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      transferenciaCUIT: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      codigoConceptoEvo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'movimiento',
      timestamps: false,
    }
  );
};
