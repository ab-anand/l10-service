const request = require('supertest');
const server = require('../../../server');
const container = require('../../../di');

describe('add post in follow feed', () => {
	let app;

	const mocks = {
		addFeed: jest.fn()
	};

	beforeAll(async () => {
		app = await server(container);
		container.resolve('addToFollowFeedLogic').addFeed = mocks.addFeed;
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
			.post('/follow-feed-service/v2.0.0/addOnFollow')
			.send({
				postIds: [ '1,2,3' ]
			});
		expect(res.status).toEqual(400);
		expect(res.body).toEqual({
			errMessage: 'Missing user id in header'
		});
		expect(mocks.addFeed.mock.calls.length).toBe(0);
		done();
	});

	test('Missing PostId', async (done) => {
		const res = await request(app)
			.post('/follow-feed-service/v2.0.0/addOnFollow')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '1');
		expect(res.status).toEqual(400);
		expect(res.body).toEqual({
			errMessage: 'Missing post ids in body'
		});
		expect(mocks.addFeed.mock.calls.length).toBe(0);
		done();
	});

	test('Internal Server error', async (done) => {
		mocks.addFeed.mockRejectedValueOnce('Internal Error');
		const res = await request(app)
			.post('/follow-feed-service/v2.0.0/addOnFollow')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '1')
			.send({
				postIds: [ '1' ]
			});
		expect(res.status).toEqual(200);
		expect(res.body).toEqual({ message: 'Follow feed addition triggered successfully' });
		expect(mocks.addFeed.mock.calls.length).toBe(1);
		expect(mocks.addFeed.mock.calls[0]).toEqual([ [ {
			postId: '1',
			remark: 'followFeed',
			score: Date.now(),
			userId: '1'
		} ], ]);
		done();
	});

	test('success', async (done) => {
		mocks.addFeed.mockResolvedValueOnce({
		});
		const res = await request(app)
			.post('/follow-feed-service/v2.0.0/addOnFollow')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '1')
			.send({
				postIds: [ '1' ]
			});
		expect(res.status).toEqual(200);
		expect(res.body).toEqual({ message: 'Follow feed addition triggered successfully' });
		expect(mocks.addFeed.mock.calls.length).toBe(1);
		expect(mocks.addFeed.mock.calls[0]).toEqual([ [ {
			postId: '1',
			remark: 'followFeed',
			score: Date.now(),
			userId: '1'
		} ], ]);
		done();
	});
});
