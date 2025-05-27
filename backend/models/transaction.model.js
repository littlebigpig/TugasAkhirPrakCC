import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import Session from './session.model.js';

const Transaction = db.define('transactions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_payment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('offline', 'online'),
    defaultValue: 'online',
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pcnumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  paid_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

// Simple association - the includes will be handled in the controller
Transaction.belongsTo(Session, { foreignKey: 'session_id' });

export default Transaction;
