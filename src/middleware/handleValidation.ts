import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { ResErrors } from "../types";

export const handleValidation: RequestHandler = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    const errorArray = errs.array();
    let errors: ResErrors = [];
    for (let i = 0; i < errorArray.length; i++) {
      let { msg, param } = errorArray[i];
      errors.push({ msg, field: param });
    }

    res.json({ errors });
    return;
  }
  next();
};
