const request = require('supertest');
const server = require('../../../server');
const container = require('../../../di');

describe('add to follow feed', () => {
	let app;

	const mocks = {
		addToNewerFeed: jest.fn()
	};

	beforeAll(async () => {
		app = await server(container);
		container.resolve('addToFollowFeedLogic').addToNewerFeed = mocks.addToNewerFeed;
	});

	afterAll(async () => {
		app.close();
	});

	beforeEach(() => {
		for (let mockFunctions of Object.values(mocks)) {
			mockFunctions.mockReset();
		}
	});

	test('success', async (done) => {
		mocks.addToNewerFeed.mockResolvedValueOnce({
		});
		const res = await request(app)
			.post('/follow-feed-service/v2.0.0/3/feed')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '1')
			.send({
				feed:[ { postId: '1234', score: 132123, remark: 'blahblah' } ]
			});
		expect(res.status).toEqual(200);
		expect(res.body).toEqual({});
		expect(mocks.addToNewerFeed.mock.calls.length).toBe(1);
		expect(mocks.addToNewerFeed.mock.calls[0]).toEqual([[{
			postId: '1234',
			score: 132123,
			userId: '3',
			remark: 'blahblah'
		}]]);
		done();
	});

	test('Internal Server error', async (done) => {
		mocks.addToNewerFeed.mockRejectedValueOnce('Internal Error');
		const res = await request(app)
			.post('/follow-feed-service/v2.0.0/3/feed')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '1')
			.send({
				feed:[ { postId: '1234', score: 132123, remark: 'blahblah' } ]
			});
		expect(res.status).toEqual(200);
		expect(res.body).toEqual({});
		expect(mocks.addToNewerFeed.mock.calls.length).toBe(1);
		expect(mocks.addToNewerFeed.mock.calls[0]).toEqual([[{
			postId: '1234',
			score: 132123,
			userId: '3',
			remark: 'blahblah'
		}]]);
		done();
	});
});
