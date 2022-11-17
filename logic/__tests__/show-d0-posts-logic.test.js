const container = require('../../di');
const utility = container.resolve('utility');
const server = require('../../server');
const constants = container.resolve('constants');
// const request = require('supertest');

describe('Calling showD0Posts() in show-d0-posts logic', () => {
	let app;
	let showD0PostsLogic;

	const mock = {
		batchGetUserMeta: jest.fn(),
		fetchUserAffinityPosts: jest.fn(),
		getPostCards: jest.fn(),
		getTrendingPosts: jest.fn(),
		updateSentList: jest.fn(),
		fetchSentList: jest.fn(),
		fetchFeed: jest.fn(),

	};

	const postResponse = [{
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
			f: '0',
			fb: '0',
			coverPic: 'https://d3kc5zpr3x9db9.cloudfront.net/दोपहरशायरी_3723db35_1548402983699_cmprsd_40.jpg',
			bk: '0',
			branchIOLink: 'https://sharechat.com/profile/tidom324?d=n'
		},
		taggedUsers: null,
		meta: 'followFeed'
	}];

	beforeAll(async () => {
		app = await server(container);
		showD0PostsLogic = container.resolve('showD0PostsLogic');
		container.resolve('userService').batchGetUserMeta = mock.batchGetUserMeta;
		container.resolve('followFeedRepoV2').fetchFeed = mock.fetchFeed;
		container.resolve('feedRelevanceService').fetchUserAffinityPosts = mock.fetchUserAffinityPosts;
		container.resolve('postRenderingService').getPostCards = mock.getPostCards;
		container.resolve('topPostService').getTrendingPosts = mock.getTrendingPosts;
		container.resolve('postSentRedis').updateSentList = mock.updateSentList;
		container.resolve('postSentRedis').fetchSentList = mock.fetchSentList;
	});

	afterAll(async () => {
		app.close();
	});

	beforeEach(() => {
		for (let mockFunctions of Object.values(mock)) {
			mockFunctions.mockReset();
		}
	});
	
	describe ('Check if eligible for D0 experience', () => {
		
		test('Returns empty response as ineligible due to older app version', async (done) => {
			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(0);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(0);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(0);
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.fetchSentList.mock.calls.length).toBe(0);
			};
			const expected = {
				err: null,
				res: []
			};
			const args = {
				userId: '1',
				appVersion: '3000',
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			const [ err, res ] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});
	
		test('Throws error due to batchGetUserMeta() throwing error ', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockRejectedValueOnce('Intentional error from user-service for testing');
			};
	
			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([ [ '5' ], 'following' ]);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(0);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(0);
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.fetchSentList.mock.calls.length).toBe(0);
			};
			const expected = {
				err: {
					err: 'Intentional error from user-service for testing',
					msg: 'Error while fetching user Data'
				},
				res: null
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [ err, res ] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});
	
		test('Throws error due to batchGetUserMeta() returning empty response', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map());
			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(0);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(0);
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.fetchSentList.mock.calls.length).toBe(0);
			};
			const expected = {
				err: {
					err: null,
					msg: 'Error while fetching user Data'
				},
				res: null
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});
		
		test('Returns empty response due to followee count > 10', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					[ '5', {
						following: 11,
						language: 'Hindi',
						userId: '5'
					} ]
				]));
				
			};
	
			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(0);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(0);
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.fetchSentList.mock.calls.length).toBe(0);
			};
			const expected = {
				err: null, res: []
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [ err, res ] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});

		test('Returns empty response due to post count in follow feed > 0', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					['5', {
						following: 10,
						language: 'Hindi',
						userId: '5'
					}]
				]));
				mocks.fetchFeed.mockResolvedValueOnce([1]);

			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(1);
				expect(mocks.fetchFeed.mock.calls[0]).toEqual(['5']);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(0);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(0);
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.fetchSentList.mock.calls.length).toBe(0);
			};
			const expected = {
				err: null, res: []
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});

		test('Throws error due to fetchFeed() throwing error', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					['5', {
						following: 10,
						language: 'Hindi',
						userId: '5'
					}]
				]));
				mocks.fetchFeed.mockRejectedValueOnce('Intentional error for testing');

			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(1);
				expect(mocks.fetchFeed.mock.calls[0]).toEqual(['5']);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(0);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(0);
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.fetchSentList.mock.calls.length).toBe(0);
			};
			const expected = {
				err: {
					err: 'Intentional error for testing',
					msg: 'Error while fetching count of posts to be shown in the feed'
				},
				res: null
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});
	});

	describe('Generating D0 experience from feed-relevance-service and top post service', () => {

		test('Returns feed from postIds returned by feed-relevance', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					['5', {
						following: 10,
						language: 'Hindi',
						userId: '5'
					}]
				]));
				mocks.fetchFeed.mockResolvedValueOnce([]);
				mocks.fetchUserAffinityPosts.mockResolvedValueOnce({
					[constants.POPULAR_CREATORS]: [ { postId: '69' } ]
				});
				mocks.fetchSentList.mockResolvedValueOnce([]);
				mocks.getPostCards.mockResolvedValueOnce(new Map([[ '69', postResponse[0] ]]));
			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(1);
				expect(mocks.fetchFeed.mock.calls[0]).toEqual(['5']);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(1);
				expect(mocks.fetchUserAffinityPosts.mock.calls[0]).toEqual([ '5', 'Hindi' ]);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(0);
				expect(mocks.updateSentList.mock.calls.length).toBe(1);
				expect(mocks.updateSentList.mock.calls[0]).toEqual([ '5', [ '69' ], [] ]);
				expect(mocks.getPostCards.mock.calls.length).toBe(1);
				expect(mocks.getPostCards.mock.calls[0]).toEqual([ '5', [ '69' ] ]);
				expect(mocks.fetchSentList.mock.calls.length).toBe(1);
				expect(mocks.fetchSentList.mock.calls[0]).toEqual([ '5', false, true ]);
			};
			const expected = {
				err: null, res: postResponse
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});

		test('Fallback to top-post as feed-relevance is already seen', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					['5', {
						following: 0,
						language: 'Hindi',
						userId: '5'
					}]
				]));
				mocks.fetchUserAffinityPosts.mockResolvedValueOnce({
					[constants.POPULAR_CREATORS]: [{ postId: '69' }]
				});
				mocks.fetchSentList.mockResolvedValueOnce([ '69' ]);
				mocks.getPostCards.mockResolvedValueOnce(new Map([['1', postResponse[0]]]));
				mocks.getTrendingPosts.mockResolvedValueOnce([ { postId: '1' } ]);
			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(1);
				expect(mocks.fetchUserAffinityPosts.mock.calls[0]).toEqual(['5', 'Hindi']);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(1);
				expect(mocks.getTrendingPosts.mock.calls[0]).toEqual([ 'Hindi', 5 ])
				expect(mocks.updateSentList.mock.calls.length).toBe(1);
				expect(mocks.updateSentList.mock.calls[0]).toEqual(['5', ['69'], []]);
				expect(mocks.getPostCards.mock.calls.length).toBe(1);
				expect(mocks.getPostCards.mock.calls[0]).toEqual(['5', ['1']]);
				expect(mocks.fetchSentList.mock.calls.length).toBe(1);
				expect(mocks.fetchSentList.mock.calls[0]).toEqual(['5', false, true]);
			};
			const expected = {
				err: null, res: postResponse
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});

		test('Returns empty feed as both feed-relevance and top-post posts are seen', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					['5', {
						following: 0,
						language: 'Hindi',
						userId: '5'
					}]
				]));
				mocks.fetchUserAffinityPosts.mockResolvedValueOnce({
					[constants.POPULAR_CREATORS]: [{ postId: '1' }, { postId: '2' }, {}]
				});
				mocks.fetchSentList.mockResolvedValueOnce(['1', '2', '3', '4']);
				mocks.getPostCards.mockResolvedValueOnce(new Map());
				mocks.getTrendingPosts.mockResolvedValueOnce([{ postId: '3' }, { postId: '4' }, {}]);
			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(1);
				expect(mocks.fetchUserAffinityPosts.mock.calls[0]).toEqual(['5', 'Hindi']);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(1);
				expect(mocks.getTrendingPosts.mock.calls[0]).toEqual(['Hindi', 5])
				expect(mocks.updateSentList.mock.calls.length).toBe(1);
				expect(mocks.updateSentList.mock.calls[0]).toEqual(['5', [], []]);
				expect(mocks.getPostCards.mock.calls.length).toBe(1);
				expect(mocks.getPostCards.mock.calls[0]).toEqual(['5', []]);
				expect(mocks.fetchSentList.mock.calls.length).toBe(1);
				expect(mocks.fetchSentList.mock.calls[0]).toEqual(['5', false, true]);
			};
			const expected = {
				err: null, res: []
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});

		test('Throws error due to feed-relevance-service throwing error', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					['5', {
						following: 0,
						language: 'Hindi',
						userId: '5'
					}]
				]));
				mocks.fetchUserAffinityPosts.mockRejectedValueOnce('Intentional error from feed-relevance-service');
			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(1);
				expect(mocks.fetchUserAffinityPosts.mock.calls[0]).toEqual(['5', 'Hindi']);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(0);
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(0);
				expect(mocks.fetchSentList.mock.calls.length).toBe(0);
			};
			const expected = {
				err: {
					err: 'Intentional error from feed-relevance-service',
					msg: 'Error when calling Feed-Relevance-Service'
				},
				res: null
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});

		test('Throws error due to top-post service throwing error', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					['5', {
						following: 0,
						language: 'Hindi',
						userId: '5'
					}]
				]));
				mocks.fetchUserAffinityPosts.mockResolvedValueOnce({
					[constants.POPULAR_CREATORS]: [{ postId: '69' }]
				});
				mocks.fetchSentList.mockResolvedValueOnce(['69']);
				mocks.getTrendingPosts.mockRejectedValueOnce('Intentional error from top-post-service');
			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(1);
				expect(mocks.fetchUserAffinityPosts.mock.calls[0]).toEqual(['5', 'Hindi']);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(1);
				expect(mocks.getTrendingPosts.mock.calls[0]).toEqual(['Hindi', 5])
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(0);
				expect(mocks.fetchSentList.mock.calls.length).toBe(1);
				expect(mocks.fetchSentList.mock.calls[0]).toEqual(['5', false, true]);
			};
			const expected = {
				err: {
					err: 'Intentional error from top-post-service',
					msg: 'Error when calling Top-Post-Service'
				},
				res: null
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});

		test('Throws error due to post-rendering-service throwing error', async (done) => {
			const mockSetup = (mocks) => {
				mocks.batchGetUserMeta.mockResolvedValueOnce(new Map([
					['5', {
						following: 0,
						language: 'Hindi',
						userId: '5'
					}]
				]));
				mocks.fetchUserAffinityPosts.mockResolvedValueOnce({
					[constants.POPULAR_CREATORS]: [{ postId: '69' }]
				});
				mocks.fetchSentList.mockResolvedValueOnce(['69']);
				mocks.getPostCards.mockRejectedValueOnce('Intentional error from PRS');
				mocks.getTrendingPosts.mockResolvedValueOnce([{ postId: '1' }]);
			};

			const assertTest = (mocks) => {
				expect(mocks.batchGetUserMeta.mock.calls.length).toBe(1);
				expect(mocks.batchGetUserMeta.mock.calls[0]).toEqual([['5'], 'following']);
				expect(mocks.fetchFeed.mock.calls.length).toBe(0);
				expect(mocks.fetchUserAffinityPosts.mock.calls.length).toBe(1);
				expect(mocks.fetchUserAffinityPosts.mock.calls[0]).toEqual(['5', 'Hindi']);
				expect(mocks.getTrendingPosts.mock.calls.length).toBe(1);
				expect(mocks.getTrendingPosts.mock.calls[0]).toEqual(['Hindi', 5])
				expect(mocks.updateSentList.mock.calls.length).toBe(0);
				expect(mocks.getPostCards.mock.calls.length).toBe(1);
				expect(mocks.getPostCards.mock.calls[0]).toEqual(['5', ['1']]);
				expect(mocks.fetchSentList.mock.calls.length).toBe(1);
				expect(mocks.fetchSentList.mock.calls[0]).toEqual(['5', false, true]);
			};
			const expected = {
				err: 'Intentional error from PRS',
				res: null
			};
			const args = {
				userId: '5',
				appVersion: 5150,
				userSkinLanguage: 'Hindi',
				language: 'Hindi'
			};
			mockSetup(mock);
			const [err, res] = await utility.invoker(showD0PostsLogic.showD0Posts(...Object.values(args)));
			await Promise.resolve(); // flush all promises
			expect(err).toStrictEqual(expected.err);
			expect(res).toStrictEqual(expected.res);
			assertTest(mock);
			done();
		});
	});
});
