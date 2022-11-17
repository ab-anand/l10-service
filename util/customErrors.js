// This is different from the original AppError used in some of ShareChat code.
class AppError extends Error {

	/**
	 * Creates an AppError object
	 * @param {String} message message
	 * @param {Error} cause cause
	 * @param {Object} context context
	 */
	constructor(message, cause, context) {
		super(message);
		this.name = 'AppError';

		Error.captureStackTrace(this, AppError);

		this.cause = cause;
		this.context = context;
	}
}

module.exports = { AppError };
