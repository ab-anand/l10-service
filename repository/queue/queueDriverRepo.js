class QueueDriverRepo {

	constructor(queueDriver, queueName) {
		this.queueDriver = queueDriver;
		this.queueName = queueName;
	}

	/**
	 * @description Fetch Messages from the queue
	 * @returns {Promise<Array<object>>}
	 */
	fetchMessages() {
		return this.queueDriver.consumer.receiveMessage({ ResourceName: this.queueName })
			.then(value => {
				return value.Messages || [];
			});
	}

	/**
	 * @param {string} receiptHandle receiptHandle
	 * @returns {Promise}
	 */
	deleteMessage(receiptHandle) {
		return this.queueDriver.consumer.deleteMessage({ ResourceName: this.queueName, ReceiptHandle: receiptHandle });
	}

	/**
	 * @description Delete message from queue
	 * @param {Array<{id:string,receiptHandle:string}>} receiptHandles Ids of messages to delete
	 * @returns {Promise}
	 */
	deleteMessagesBatch(receiptHandles) {
		const failedDeletes = [];
		return Promise.all(
			receiptHandles.map(value => this.deleteMessage(value.receiptHandle)
				.catch(reason => {
					failedDeletes.push(Object.assign({}, value, { err: reason }));
				}))
		).then(() => {
			if (failedDeletes.length !== 0) {
				throw failedDeletes;
			}
		});
	}

}

module.exports = QueueDriverRepo;
