import rateLimit from "express-rate-limit";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
// 1. Rate limiter
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// 2. Data Sanitization: Prevents NoSQL Injection (e.g., {"$gt": ""})
// export const sanitizeData = mongoSanitize({
//   replaceWith: "_",
// });
// 3. Helmet: Sets various HTTP headers for security
export const securityHeaders = helmet();

