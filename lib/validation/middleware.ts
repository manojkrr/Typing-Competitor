import type { NextRequest } from "next/server";
import { z } from "zod";

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError("Validation failed", error);
      }
      throw error;
    }
  };
}

export function validateSocketData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Socket data validation failed", error);
    }
    throw error;
  }
}

export function createErrorResponse(error: ValidationError) {
  return {
    error: "Validation failed",
    details: error.errors.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    })),
  };
}
