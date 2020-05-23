import Joi from 'joi';

const passwordSchema = Joi.string()
  .max(20)
  .required();

const emailSchema = Joi.string()
  .max(80)
  .email();

const loginSchema = {
  email: emailSchema,
  username: Joi.string()
    .max(20)
    .alphanum(),
  password: passwordSchema,
};

const registerSchema = {
  ...loginSchema,
  email: emailSchema.required(),
  username: loginSchema.username.required(),
  name: Joi.string()
    .max(60)
    .regex(/^[a-zA-Z\u00C0-\u00FF ]+$/)
    .required(),
};

export default {
  login: Joi.object(loginSchema).or('email', 'username'),
  register: registerSchema,
  reset: { email: emailSchema.required() },
  change: {
    password: passwordSchema,
    newPassword: passwordSchema,
  },
};
