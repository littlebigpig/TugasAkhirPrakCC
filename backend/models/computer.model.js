import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const Computer = db.define('computers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance'),
    defaultValue: 'available',
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

export default Computer;
