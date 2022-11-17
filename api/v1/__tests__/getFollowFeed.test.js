const request = require('supertest');
const server = require('../../../server');
const container = require('../../../di');

describe('get follow feed test v1', () => {
	let app;

	const mocks = {
		fetchFollowFeed: jest.fn()
	};

	beforeAll(async () => {
		app = await server(container);
		container.resolve('fetchFollowFeedLogic').fetchFollowFeed = mocks.fetchFollowFeed;
	});

	afterAll(async () => {
		app.close();
	});

	beforeEach(() => {
		for (let mockFunctions of Object.values(mocks)) {
			mockFunctions.mockReset();
		}
	});

	test('success response', async (done) => {
		mocks.fetchFollowFeed.mockResolvedValueOnce({
			feed: [
				{
					us: 0,
					cd: '0',
					i: '69',
					tt: [
						{
							i: '1',
							n: 'mera ghar',
							th: 'JZ'
						}
					],
					a: '22',
					authorId: '22',
					n: 'amit chintu',
					y: 'https://cdn.sharechat.com/sharechat_random_profile_4444.jpg',
					t: 'video',
					v: 'https://cdn-cf.sharechat.com/0d3a5781-8fa7-4ee5-9d3f-9539c2aaf2be-0dec51d6-673a-460f-933c-b5c35a500f35.mp4',
					b: 'https://cdn-cf.sharechat.com/0d3a5781-8fa7-4ee5-9d3f-9539c2aaf2be-0dec51d6-673a-460f-933c-b5c35a500f35_thumb.jpg',
					c: '#mera ghar',
					l: '159',
					o: '1560751690',
					m: 'Hindi',
					w: '720',
					h: '1280',
					d: '3',
					z: '1160334',
					q: 'video/mp4',
					lc: '0',
					usc: '0',
					favouriteCount: '0',
					rvd: 0,
					ad: '0',
					adult: '0',
					sd: '0',
					st: 'camera',
					bottomVisibilityFlag: 0,
					hideHeader: false,
					hidePadding: false,
					permalink: 'https://sharechat.com/post/RPB?d=n',
					branchIOLink: 'https://sharechat.com/post/RPB?d=n',
					ph: 'RPB',
					encodedText: null,
					secondaryThumbs: [
						'https://cdn.sharechat.com/1b7c594f_1560751691556.jpeg',
						'https://cdn.sharechat.com/14241d09_1560751691558.jpeg',
						'https://cdn.sharechat.com/1e91a608_1560751691558.jpeg',
						'https://cdn.sharechat.com/39cbbefa_1560751691556.jpeg',
						'https://cdn.sharechat.com/314ca5ca_1560751691556.jpeg'
					],
					authorIdStatus: '22_2',
					langStatus: 'Hindi_2',
					approved: 1,
					encodedTextV2: '{[{1}]} ',
					postCreationLocation: 'bangalore urban, KA',
					postCreationLatLong: '12.9346487,77.6092092',
					captionTagsList: [
						{
							bucketId: '14',
							bucketName: 'मेरी दुनिया',
							isAdult: false,
							tagId: '1',
							tagName: 'mera ghar',
							tagHash: 'JZ'
						}
					],
					postCategory: 'normal',
					thumbNailId: '0d3a5781-8fa7-4ee5-9d3f-9539c2aaf2be-0dec51d6-673a-460f-933c-b5c35a500f35_thumb',
					ath: {
						i: '22',
						n: '...',
						pu: 'https://d3doh47p6cvh2n.cloudfront.net/sharechat_random_profile_5.jpg',
						s: 'I Love ShareChat',
						tu: 'https://d3doh47p6cvh2n.cloudfront.net/thumb_sharechat_random_profile_5.jpg',
						pc: '72',
						a: '9',
						b: '6',
						h: 'tidom324',
						vp: '0',
						config_bits: 0,
						f: '1',
						fb: '0',
						coverPic: 'https://d3kc5zpr3x9db9.cloudfront.net/दोपहरशायरी_3723db35_1548402983699_cmprsd_40.jpg',
						bk: '0',
						branchIOLink: 'https://sharechat.com/profile/tidom324?d=n'
					},
					taggedUsers: null,
					meta: 'followFeed'
				}
			],
			nextOffset: null
		  });
		const res = await request(app)
			.get('/follow-feed-service/v1.0.0/followFeed')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '1');
		expect(res.status).toEqual(200);
		expect(res.body).toStrictEqual({
			d: [
				{
					us: 0,
					cd: '0',
					i: '69',
					tt: [
						{
							i: '1',
							n: 'mera ghar',
							th: 'JZ'
						}
					],
					a: '22',
					authorId: '22',
					n: 'amit chintu',
					y: 'https://cdn.sharechat.com/sharechat_random_profile_4444.jpg',
					t: 'video',
					v: 'https://cdn-cf.sharechat.com/0d3a5781-8fa7-4ee5-9d3f-9539c2aaf2be-0dec51d6-673a-460f-933c-b5c35a500f35.mp4',
					b: 'https://cdn-cf.sharechat.com/0d3a5781-8fa7-4ee5-9d3f-9539c2aaf2be-0dec51d6-673a-460f-933c-b5c35a500f35_thumb.jpg',
					c: '#mera ghar',
					l: '159',
					o: '1560751690',
					m: 'Hindi',
					w: '720',
					h: '1280',
					d: '3',
					z: '1160334',
					q: 'video/mp4',
					lc: '0',
					usc: '0',
					favouriteCount: '0',
					rvd: 0,
					ad: '0',
					adult: '0',
					sd: '0',
					st: 'camera',
					bottomVisibilityFlag: 0,
					hideHeader: false,
					hidePadding: false,
					permalink: 'https://sharechat.com/post/RPB?d=n',
					branchIOLink: 'https://sharechat.com/post/RPB?d=n',
					ph: 'RPB',
					encodedText: null,
					secondaryThumbs: [
						'https://cdn.sharechat.com/1b7c594f_1560751691556.jpeg',
						'https://cdn.sharechat.com/14241d09_1560751691558.jpeg',
						'https://cdn.sharechat.com/1e91a608_1560751691558.jpeg',
						'https://cdn.sharechat.com/39cbbefa_1560751691556.jpeg',
						'https://cdn.sharechat.com/314ca5ca_1560751691556.jpeg'
					],
					authorIdStatus: '22_2',
					langStatus: 'Hindi_2',
					approved: 1,
					encodedTextV2: '{[{1}]} ',
					postCreationLocation: 'bangalore urban, KA',
					postCreationLatLong: '12.9346487,77.6092092',
					captionTagsList: [
						{
							bucketId: '14',
							bucketName: 'मेरी दुनिया',
							isAdult: false,
							tagId: '1',
							tagName: 'mera ghar',
							tagHash: 'JZ'
						}
					],
					postCategory: 'normal',
					thumbNailId: '0d3a5781-8fa7-4ee5-9d3f-9539c2aaf2be-0dec51d6-673a-460f-933c-b5c35a500f35_thumb',
					ath: {
						i: '22',
						n: '...',
						pu: 'https://d3doh47p6cvh2n.cloudfront.net/sharechat_random_profile_5.jpg',
						s: 'I Love ShareChat',
						tu: 'https://d3doh47p6cvh2n.cloudfront.net/thumb_sharechat_random_profile_5.jpg',
						pc: '72',
						a: '9',
						b: '6',
						h: 'tidom324',
						vp: '0',
						config_bits: 0,
						f: '1',
						fb: '0',
						coverPic: 'https://d3kc5zpr3x9db9.cloudfront.net/दोपहरशायरी_3723db35_1548402983699_cmprsd_40.jpg',
						bk: '0',
						branchIOLink: 'https://sharechat.com/profile/tidom324?d=n'
					},
					taggedUsers: null,
					meta: 'followFeed'
				}
			]
		});
		expect(mocks.fetchFollowFeed.mock.calls.length).toBe(1);
		expect(mocks.fetchFollowFeed.mock.calls).toEqual([['1', 10, null]]);
		done();
	});

	test('Internal server error', async (done) => {
		mocks.fetchFollowFeed.mockRejectedValueOnce('Internal error');
		const res = await request(app)
			.get('/follow-feed-service/v1.0.0/followFeed')
			.set('X-SHARECHAT-AUTHORIZED-USERID', '1');
		expect(res.status).toEqual(500);
		expect(res.text).toStrictEqual('{"errMessage":"Internal Server Error"}');
		expect(mocks.fetchFollowFeed.mock.calls.length).toBe(1);
		expect(mocks.fetchFollowFeed.mock.calls).toEqual([['1', 10, null]]);
		done();
	});
});
