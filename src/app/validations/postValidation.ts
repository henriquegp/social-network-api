import Joi from 'joi';
/*
const textSchema = {
  text: Joi.string().max(5000),
}; */

export default {
  index: {
    page: Joi.number()
      .integer()
      .required(),
    userId: Joi.number().integer(),
  },
  create: Joi.object({
    text: Joi.string().max(5000).default(null),
  }),
};
