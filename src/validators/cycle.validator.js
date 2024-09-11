const z = require('zod');

const registerCycleSchema = z.object({
  userId: z.string(),
  taskId: z.string(),
  minutesAmount: z.number().min(1).max(60),
});

module.exports = {
  registerCycleSchema,
};
