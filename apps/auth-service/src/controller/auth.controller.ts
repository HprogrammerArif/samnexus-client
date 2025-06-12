// Register a new user

import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, validateRegistrationData } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validateRegistrationData(req.body, "user");
  const { name, email, password, country } = req.body;

  const existingUser = await prisma.user.findUnique({ where: email });

  if (existingUser) {
    return next(new ValidationError("User already exists with this email!"));
  }

  await checkOtpRestrictions(email, next);
};
