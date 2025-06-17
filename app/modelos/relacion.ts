import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import DataBaseConnection from '../lib/sequelize';

export class Relacion extends Model<
  InferAttributes<Relacion>,
  InferCreationAttributes<Relacion>
> {
  declare id: CreationOptional<number>;
  declare codigoConcepto: number;
  declare codigoConceptoEvo: number;
  declare descripcionConceptoEvo: string;
}

export const initRelacion = async () => {
  const sequelize = await DataBaseConnection.getSequelizeInstance();

  Relacion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigoConcepto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      codigoConceptoEvo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      descripcionConceptoEvo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'relacion',
      timestamps: false,
    }
  );
};
