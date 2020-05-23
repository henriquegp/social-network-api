import Joi from 'joi';

export default {
  update: Joi.object({
    name: Joi.string().max(60).required(),
    about: Joi
      .string()
      .max(1000)
      .allow(null, ''),
    privated: Joi.boolean().required(),
  }),
};
