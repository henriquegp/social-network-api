import Joi from 'joi';

const commentSchema = {
  text: Joi.string()
    .max(500)
    .required(),
};

export default {
  index: {},
  create: commentSchema,
  update: commentSchema,
  delete: {},
};
