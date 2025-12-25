import Joi from "joi";

export const envValidation = Joi.object({
    NODE_ENV: Joi.string()
        .valid("development", "production", "staging")
        .required(),
    
    PORT: Joi.number()
        .port()
        .required(),
    
    DATABASE_URL: Joi.string()
        .uri()
        .required(),
    
    JWT_SECRET: Joi.string()
        .min(10)
        .required(),
    
    LOG_LEVEL: Joi.string()
        .valid("error", "warn", "info", "debug", "trace")
        .default("info"),
});