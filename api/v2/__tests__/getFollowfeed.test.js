const request = require('supertest');
const server = require('../../../server');
const container = require('../../../di');

describe('Calling get follow feed v2 API', () => {
	let app;
	const feed = [
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
	];
	const mocks = {
		fetchFollowFeed: jest.fn(),
		showD0Posts: jest.fn(),
		fetchFollowFeedV2: jest.fn(),
		fetchFollowFeedV3: jest.fn()
	};

	beforeAll(async () => {
		app = await server(container);
		container.resolve('fetchFollowFeedLogic').fetchFollowFeed = mocks.fetchFollowFeed;
		container.resolve('fetchFollowFeedLogic').fetchFollowFeedV2 = mocks.fetchFollowFeedV2;
		container.resolve('showD0PostsLogic').showD0Posts = mocks.showD0Posts;
		container.resolve('fetchFollowFeedLogic').fetchFollowFeedV3 = mocks.fetchFollowFeedV3;
	});

	afterAll(async () => {
		app.close();
	});

	beforeEach(() => {
		for (let mockFunctions of Object.values(mocks)) {
			mockFunctions.mockReset();
		}
	});

	describe('With `showFollowSuggestion = true` (D0 experience)', () => {

		test('Should return 5XX when showD0Posts logic throws error', async (done) => {
			mocks.showD0Posts.mockRejectedValueOnce('Internal Error');
			const res = await request(app)
				.get('/follow-feed-service/v2.0.0/public/followFeed?limit=3&showFollowSuggestion=true&suggestedPostExpVariant=variant-1&followfeedexperimentsV1=variant-2')
				.set({
					'X-SHARECHAT-AUTHORIZED-USERID': '1',
					'locale-language': 'Hindi',
					'locale-skin-language': 'English',
					'app-version': 5128
				});
			expect(res.status).toEqual(500);
			expect(res.body).toEqual({
				errMessage: 'Internal Server Error'
			});
			expect(mocks.showD0Posts.mock.calls.length).toBe(1);
			expect(mocks.showD0Posts.mock.calls[0]).toEqual([ '1', '5128', 'English', 'Hindi' ]);
			expect(mocks.fetchFollowFeed.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV2.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV3.mock.calls.length).toBe(0);
			done();
		});
	
		test('Should return 2XX response when showD0Posts returns feed posts', async (done) => {
			mocks.showD0Posts.mockResolvedValueOnce([feed]);
			const res = await request(app)
				.get('/follow-feed-service/v2.0.0/public/followFeed?limit=3&showFollowSuggestion=true&suggestedPostExpVariant=variant-1&followfeedexperimentsV1=variant-2')
				.set({
					'X-SHARECHAT-AUTHORIZED-USERID': '1',
					'locale-skin-language': 'English',
					'locale-language': 'Hindi',
					'app-version': 5128
				});
			expect(res.status).toEqual(200);
			expect(res.body).toEqual({
				feed: [ feed ],
				offset: null
			});
			expect(mocks.showD0Posts.mock.calls.length).toBe(1);
			expect(mocks.showD0Posts.mock.calls[0]).toEqual(['1', '5128', 'English', 'Hindi']);
			expect(mocks.fetchFollowFeed.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV2.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV3.mock.calls.length).toBe(0);
			done();
		});
	});

	describe('with `followfeedexperimentsV1=variant-1` (Old follow feed logic)', () => {

		test('Should return 2XX, when offset=null', async (done) => {
			mocks.fetchFollowFeed.mockResolvedValueOnce({
				feed: feed,
				nextOffset: {score:1234}
			});
			const res = await request(app)
				.get('/follow-feed-service/v2.0.0/public/followFeed?followfeedexperimentsV1=variant-1')
				.set({
					'X-SHARECHAT-AUTHORIZED-USERID': '1',
					'locale-skin-language': 'English',
					'locale-language': 'Hindi',
					'app-version': 5128
				});
			expect(res.status).toEqual(200);
			expect(res.body).toEqual({
				feed: feed,
				offset: '9RRjqaXDkQS9849AG0WpCdzx'
			});
			expect(mocks.fetchFollowFeed.mock.calls.length).toBe(1);
			expect(mocks.fetchFollowFeed.mock.calls[0]).toEqual([ '1', 10, null ]);
			expect(mocks.showD0Posts.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV2.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV3.mock.calls.length).toBe(0);
			done();
		});
	
		test('Should return 5XX, when fetchFollowFeed throws error', async (done) => {
			mocks.fetchFollowFeed.mockRejectedValueOnce('Internal error');
			const res = await request(app)
				.get('/follow-feed-service/v2.0.0/public/followFeed?followfeedexperimentsV1=variant-2')
				.set({
					'X-SHARECHAT-AUTHORIZED-USERID': '1',
					'locale-skin-language': 'English',
					'locale-language': 'Hindi',
					'app-version': 5128
				});
			expect(res.status).toEqual(500);
			expect(res.body).toEqual({
				errMessage: 'Internal Server Error'
			});
			expect(mocks.fetchFollowFeed.mock.calls.length).toBe(1);
			expect(mocks.fetchFollowFeed.mock.calls[0]).toEqual([ '1', 10, null ]);
			expect(mocks.showD0Posts.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV2.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV3.mock.calls.length).toBe(0);
			done();
		});
	});

	describe('with `followfeedexperimentsV1=variant-3`(fetchFollowFeedV2 logic)', () => {
	
		test('Should return 2XX response when fetchFollowFeedV2 return feed', async (done) => {
			mocks.fetchFollowFeedV3.mockResolvedValueOnce({
				feed: feed,
				nextOffset: {type: 'seen'}
			});
			const res = await request(app)
				.get('/follow-feed-service/v2.0.0/public/followFeed?limit=10&showFollowSuggestion=false&followfeedexperimentsV1=variant-3')
				.set({
					'X-SHARECHAT-AUTHORIZED-USERID': '1',
					'locale-skin-language': 'English',
					'locale-language': 'Hindi',
					'app-version': 5128
				});
			expect(res.status).toEqual(200);
			expect(res.body).toEqual({
				feed: feed,
				offset: 'BAA8qy1VlxFdjO4rKQZKcZq4PG'
			});
			expect(mocks.showD0Posts.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeed.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV2.mock.calls.length).toEqual(0);
			expect(mocks.fetchFollowFeedV3.mock.calls[0]).toEqual(['1', 'variant-3', 10, null]);
			done();
		});
	
		test('Should return 5XX when fetchFollowFeedV2 throws error', async (done) => {
			mocks.fetchFollowFeedV3.mockRejectedValueOnce('Internal error');
			const res = await request(app)
				.get('/follow-feed-service/v2.0.0/public/followFeed?limit=10&showFollowSuggestion=false&followfeedexperimentsV1=variant-3')
				.set({
					'locale-skin-language': 'English',
					'X-SHARECHAT-AUTHORIZED-USERID': '1',
					'locale-language': 'Hindi',
					'app-version': 5128
				});
			expect(res.status).toEqual(500);
			expect(res.body).toEqual({
				errMessage: 'Internal Server Error'
			});
			expect(mocks.showD0Posts.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeed.mock.calls.length).toBe(0);
			expect(mocks.fetchFollowFeedV2.mock.calls.length).toEqual(0);
			expect(mocks.fetchFollowFeedV3.mock.calls[0]).toEqual(['1', 'variant-3', 10, null]);
			done();
		});
	});

});
