import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import User from './user.model.js';
import Computer from './computer.model.js';

const Session = db.define('sessions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  computer_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('ongoing', 'finished'),
    defaultValue: 'ongoing',
  },
  computer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

// Relasi
Session.belongsTo(User, { foreignKey: 'user_id' });
Session.belongsTo(Computer, { foreignKey: 'computer_id' });

export default Session;
