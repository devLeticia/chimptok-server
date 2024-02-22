const z = require('zod');

const registerSchema = z.object({
  email: z.string().email().min(5),
  password: z.string().min(6),
  // confirmPassword: z.string().min(6),
  username: z.string().min(6),
});

module.exports = {
  registerSchema,
};
