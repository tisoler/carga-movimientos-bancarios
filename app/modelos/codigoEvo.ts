import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import DataBaseConnection from '../lib/sequelize';

export class CodigoEvo extends Model<
  InferAttributes<CodigoEvo>,
  InferCreationAttributes<CodigoEvo>
> {
  declare codigoConceptoEvo: number;
  declare descripcionConceptoEvo: string;
}

export const initCodigoEvo = async () => {
  const sequelize = await DataBaseConnection.getSequelizeInstance();

  CodigoEvo.init(
    {
      codigoConceptoEvo: {
        primaryKey: true,
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
      tableName: 'codigoEvo',
      timestamps: false,
    }
  );
};
