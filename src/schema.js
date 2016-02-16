'use strict';

const Joi = require('joi');

const steps = Joi.alternatives().try([
  Joi.string(),
  Joi.array().items(Joi.string())
]).default([]);

const Task = Joi.object({
  action: Joi.string().required(),
  params: Joi.any().optional(),
  provides: steps,
  depends: steps,
  skip: steps,
  to: Joi.string().optional(),
  timeout: Joi.string().optional()
});

const Workflow = Joi.object({
  name: Joi.string().required(),
  tasks: Joi.object().pattern(/.*/, Task).required()
});

module.exports = {
  Workflow: Workflow,
  Task: Task
};
