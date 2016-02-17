'use strict';

const Joi = require('joi');

const steps = Joi.alternatives().try([
  Joi.string(),
  Joi.array().items(Joi.string())
]).default([]);

const Task = Joi.object({
  name: Joi.string(),
  action: Joi.string().required(),
  params: Joi.any().optional(),
  provides: steps,
  depends: steps,
  skip: steps,
  to: Joi.string().optional(),
  timeout: Joi.string().optional()
});

const Workflow = Joi.object({
  name: Joi.string().optional(),
  tasks: Joi.object().pattern(/.*/, Task).required(),
  timeout: Joi.number().integer().optional()
});

module.exports = {
  Workflow: Workflow,
  Task: Task
};
