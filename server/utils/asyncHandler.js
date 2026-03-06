/**
 * asyncHandler
 *
 * Wraps an async Express route handler so that any rejected promise or
 * thrown error is automatically forwarded to `next()` — eliminating the
 * need for repetitive try/catch blocks in every controller.
 *
 * Usage:
 *   export const myController = asyncHandler(async (req, res) => {
 *       const data = await SomeModel.find();
 *       res.json({ success: true, data });
 *   });
 *
 * @param {Function} fn - Async (req, res, next) => Promise route handler
 * @returns {Function} Standard Express middleware (req, res, next)
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
