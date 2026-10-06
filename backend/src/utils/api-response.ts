export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  ...(message ? { message } : {}),
  data,
});

export const errorResponse = (
  code: string,
  message: string,
  details?: Array<{ field: string; message: string }>,
) => ({
  success: false,
  error: {
    code,
    message,
    ...(details ? { details } : {}),
  },
});
