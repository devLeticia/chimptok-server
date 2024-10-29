// const { v4: uuidv4 } = require('uuid');
const express = require('express');
const { registerCycleSchema } = require('../../validators/cycle.validator');
const { AddCycle, getActiveCycle, getAllCycles, interruptCycle, getCycleById } = require('./cycles.service');

const router = express.Router();

router.post('/', async (req, res) => {
  const {
    userId,
    taskId,
    minutesAmount,
  } = registerCycleSchema.parse(req.body);
  try {
    const response = await AddCycle(
      userId,
      taskId,
      minutesAmount,
    );
    if (response) return res.status(200).json({ message: 'Ciclo Iniciado' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start a new Cycle' });
  }
  return null;
});

router.get('/activeCycle/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await getActiveCycle(userId);
    if (response) return res.status(200).json({ message: 'Ciclo ativo encontrado' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve active cycle' });
  }
  return null;
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await getAllCycles(userId);
    if (response) return res.status(200).json({ message: 'Historico de ciclos encontrado', data: response });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve cycles history' });
  }
  return null;
});

router.patch('/interrupt/:cycleId', async (req, res) => {
  const { cycleId } = req.params;
  const userId = req.body.userId

  try {
    const cycle = await getCycleById(cycleId)

    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' });
    }
    if (cycle.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this cycle' });
    }

    const response = await interruptCycle(cycleId);
    return res.status(200).json({ message: 'Ciclo interrompido', data: response });

  } catch (error) {
    console.error('Error interrupting cycle:', error);
    return res.status(500).json({ error: 'Failed to interrupt cycle' });
  }
});



module.exports = router;
