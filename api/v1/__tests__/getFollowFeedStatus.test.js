const request = require('supertest');
const server = require('../../../server');
const container = require('../../../di');

describe('get follow feed status v1', () => {
	let app;

	const mocks = {
		fetchFeed: jest.fn(),
	};

	beforeAll(async () => {
		app = await server(container);
		container.resolve('followFeedRepoV2').fetchFeed = mocks.fetchFeed;
	});

	afterAll(async () => {
		app.close();
	});

	beforeEach(() => {
		for (let mockFunctions of Object.values(mocks)) {
			mockFunctions.mockReset();
		}
	});

	test('Missing userId', async (done) => {
		const res = await request(app)
			.get('/follow-feed-service/v1.0.0/follow-feed/status');
		expect(res.status).toEqual(400);
		expect(res.text).toEqual('{"errMessage":"Missing user id in header"}');
		expect(mocks.fetchFeed.mock.calls.length).toBe(0);
		done();
	});

	test('success response', async (done) => {
		mocks.fetchFeed.mockResolvedValueOnce([1,2,3,4]);
		const res = await request(app)
			.get('/follow-feed-service/v1.0.0/follow-feed/status')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '2225353767');
		expect(res.status).toEqual(200);
		expect(res.body).toEqual({
			postCount: 4
		});
		expect(mocks.fetchFeed.mock.calls[0]).toEqual(['2225353767']);
		expect(mocks.fetchFeed.mock.calls.length).toBe(1);
		done();
	});

	test('Internal server error', async (done) => {
		mocks.fetchFeed.mockRejectedValueOnce('Internal Error');
		const res = await request(app)
			.get('/follow-feed-service/v1.0.0/follow-feed/status')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '2225353767');
		expect(res.status).toEqual(500);
		expect(res.body).toEqual({
			errMessage: 'Internal Server Error'
		});
		expect(mocks.fetchFeed.mock.calls.length).toBe(1);
		expect(mocks.fetchFeed.mock.calls[0]).toEqual(['2225353767']);
		done();
	});
});
