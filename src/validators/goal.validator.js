const z = require('zod');

const taskSchema = z.object({
  id: z.string(),
  taskName: z.string(),
});

const registerGoalSchema = z.object({
  goalName: z.string(),
  deadline: z.coerce.date(),
  weeklyHours: z.number(),
  tasks: z.array(taskSchema),
  userId: z.string(),
});

module.exports = {
  registerGoalSchema,
};
