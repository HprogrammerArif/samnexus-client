import { NextFunction } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import crypto from "crypto";
import { sendEmail } from "./sendMail";
import redis from "../../../../packages/libs/redis";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && !phone_number) ||
    !country
  ) {
    throw new ValidationError("All fields are required");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Account is locked due to multiple failed OTP attempts. Please try again after 30 minutes later."
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many otp requests. Please wait 1 hour before trying again."
      )
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError(
        "Please wait 1 minute before requesting a new OTP."
      )
    );
  }
};


export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "LOCKED", "EX", 3600); // Lock for 1 hour
    return next(
      new ValidationError(
        "Too many OTP requests. Please wait 1 hour before trying again."
      )
    );
  }
  await redis.set(otpRequestKey, (otpRequests + 1).toString(), "EX", 3600); //track OTP requests for 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  // Here you would typically send the OTP via email or SMS
  await sendEmail(email, "Verify Your Email", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};
