import Computer from '../models/computer.model.js';

const ComputerController = {
  // Create Computer
  createComputer: async (req, res) => {
    try {
      const { id, status } = req.body;
      const computer = await Computer.create({ id, status });
      res.status(201).json({ message: 'Computer created successfully', computer });
    } catch (error) {
      console.error('Error creating computer:', error);
      res.status(500).json({ message: 'Failed to create computer', error: error.message });
    }
  },

  // Read Computer by ID
  getComputerById: async (req, res) => {
    try {
      const computer = await Computer.findByPk(req.params.id);
      if (!computer) return res.status(404).json({ message: 'Computer not found' });
      res.status(200).json(computer);
    } catch (error) {
      console.error('Error fetching computer:', error);
      res.status(500).json({ message: 'Failed to fetch computer', error: error.message });
    }
  },

  // Update Computer
  updateComputer: async (req, res) => {
    try {
      const { status } = req.body;
      const computer = await Computer.findByPk(req.params.id);
      if (!computer) return res.status(404).json({ message: 'Computer not found' });

      await computer.update({ status });
      res.status(200).json({ message: 'Computer updated successfully', computer });
    } catch (error) {
      console.error('Error updating computer:', error);
      res.status(500).json({ message: 'Failed to update computer', error: error.message });
    }
  },

  // Delete Computer
  deleteComputer: async (req, res) => {
    try {
      const computer = await Computer.findByPk(req.params.id);
      if (!computer) return res.status(404).json({ message: 'Computer not found' });

      await computer.destroy();
      res.status(200).json({ message: 'Computer deleted successfully' });
    } catch (error) {
      console.error('Error deleting computer:', error);
      res.status(500).json({ message: 'Failed to delete computer', error: error.message });
    }
  }
};

export default ComputerController;
