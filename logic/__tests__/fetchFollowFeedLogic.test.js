const container = require('../../di');
const utility = container.resolve('utility');
const server = require('../../server');

describe('fetch follow feed logic', () => {
	let app;
	let fetchFollowFeedLogic;

	const feed = [
		[
			'7237058623',
			{
				us: 0,
				cd: '0',
				i: '7237058623',
				tt: [
					{
						i: '4572',
						n: 'సినిమా',
						th: 'kgnd'
					}
				],
				a: '769',
				authorId: '769',
				n: 'Ramesh',
				y: 'https://cdn.sharechat.com/ProfilePic/bf37b8dc-3c5c-44f8-97a8-aff15eff316a-3cd2fee5-0868-4221-a036-88df30698f6f.jpeg',
				t: 'image',
				g: 'https://dynamic-image-resizer.sharechat.com/imageResizer/3487266d_1588159719765.jpeg',
				b: 'https://cdn-cf.sharechat.com/3487266d_1588159719765_thumbnail.jpeg',
				c: '#సినిమా',
				o: '1639743273',
				m: 'Telugu',
				w: '720',
				h: '1186',
				z: '26704',
				q: 'image/jpeg',
				lc: '0',
				usc: '0',
				branchIOLink: 'https://sharechat.com/post/7DV4BWA?d=n',
				favouriteCount: '0',
				rvd: 0,
				ad: '0',
				adult: '0',
				sd: '0',
				bottomVisibilityFlag: 0,
				hideHeader: false,
				hidePadding: false,
				permalink: 'https://sharechat.com/post/7DV4BWA?d=n',
				ph: '7DV4BWA',
				encodedText: null,
				isImageResizeApplicable: true,
				authorIdStatus: '769_2',
				langStatus: 'Telugu_2',
				approved: 1,
				encodedTextV2: '{[{4572}]}',
				postCreationLocation: 'vishakhapatnam, AP',
				postCreationLatLong: '17.6677478,82.9659278',
				captionTagsList: [
					{
						bucketId: '45',
						bucketName: 'టాలీవుడ్ అడ్డా!',
						groupTag: false,
						isAdult: false,
						tagId: '4572',
						tagName: 'సినిమా',
						tagHash: 'kgnd'
					}
				],
				postCategory: 'normal',
				ath: {
					i: '769',
					n: 'test',
					pu: 'https://d3doh47p6cvh2n.cloudfront.net/sharechat_random_profile_141.jpg',
					s: 'Cecile Fritsch1',
					tu: 'https://d3doh47p6cvh2n.cloudfront.net/thumb_sharechat_random_profile_141.jpg',
					pc: '42662',
					a: '98',
					b: '25',
					h: 'siva',
					vp: '0',
					config_bits: 0,
					f: '1',
					fb: '0',
					coverPic: 'https://cdn.sharechat.com/दोपहरशायरी_2195599e_1548402376728_cmprsd_40.jpg',
					bk: '0',
					lc: 'Melba Altenwerth',
					branchIOLink: 'https://sharechat.com/profile/siva?d=n'
				},
				taggedUsers: null
			}
		]
	];

	const videoPost = [
		'7237058623',
		{
			us: 0,
			cd: '0',
			i: '7237058623',
			tt: [
				{
					i: '4572',
					n: 'సినిమా',
					th: 'kgnd'
				}
			],
			a: '769',
			authorId: '769',
			n: 'Ramesh',
			y: 'https://cdn.sharechat.com/ProfilePic/bf37b8dc-3c5c-44f8-97a8-aff15eff316a-3cd2fee5-0868-4221-a036-88df30698f6f.jpeg',
			t: 'video',
			g: 'https://dynamic-image-resizer.sharechat.com/imageResizer/3487266d_1588159719765.jpeg',
			b: 'https://cdn-cf.sharechat.com/3487266d_1588159719765_thumbnail.jpeg',
			c: '#సినిమా',
			o: '1639743273',
			m: 'Telugu',
			w: '720',
			h: '1186',
			z: '26704',
			q: 'image/jpeg',
			lc: '0',
			usc: '0',
			branchIOLink: 'https://sharechat.com/post/7DV4BWA?d=n',
			favouriteCount: '0',
			rvd: 0,
			ad: '0',
			adult: '0',
			sd: '0',
			bottomVisibilityFlag: 0,
			hideHeader: false,
			hidePadding: false,
			permalink: 'https://sharechat.com/post/7DV4BWA?d=n',
			ph: '7DV4BWA',
			encodedText: null,
			isImageResizeApplicable: true,
			authorIdStatus: '769_2',
			langStatus: 'Telugu_2',
			approved: 1,
			encodedTextV2: '{[{4572}]}',
			postCreationLocation: 'vishakhapatnam, AP',
			postCreationLatLong: '17.6677478,82.9659278',
			captionTagsList: [
				{
					bucketId: '45',
					bucketName: 'టాలీవుడ్ అడ్డా!',
					groupTag: false,
					isAdult: false,
					tagId: '4572',
					tagName: 'సినిమా',
					tagHash: 'kgnd'
				}
			],
			postCategory: 'normal',
			ath: {
				i: '769',
				n: 'test',
				pu: 'https://d3doh47p6cvh2n.cloudfront.net/sharechat_random_profile_141.jpg',
				s: 'Cecile Fritsch1',
				tu: 'https://d3doh47p6cvh2n.cloudfront.net/thumb_sharechat_random_profile_141.jpg',
				pc: '42662',
				a: '98',
				b: '25',
				h: 'siva',
				vp: '0',
				config_bits: 0,
				f: '1',
				fb: '0',
				coverPic: 'https://cdn.sharechat.com/दोपहरशायरी_2195599e_1548402376728_cmprsd_40.jpg',
				bk: '0',
				lc: 'Melba Altenwerth',
				branchIOLink: 'https://sharechat.com/profile/siva?d=n'
			},
			taggedUsers: null
		}
	];

	const mock = {
		getPostCards: jest.fn(),
		takeSnapshotOfSentList: jest.fn(),
		fetchSentList: jest.fn(),
		updateSentList: jest.fn(),
		fetchFeed: jest.fn(),
		deleteInvalidPosts: jest.fn()
	};

	beforeAll(async () => {
		app = await server(container);
		fetchFollowFeedLogic = container.resolve('fetchFollowFeedLogic');
		container.resolve('followFeedRepoV2').fetchFeed = mock.fetchFeed;
		container.resolve('followFeedRepoV2').deleteInvalidPosts = mock.deleteInvalidPosts;
		container.resolve('postRenderingService').getPostCards = mock.getPostCards;
		container.resolve('postSentRedis').takeSnapshotOfSentList = mock.takeSnapshotOfSentList;
		container.resolve('postSentRedis').fetchSentList = mock.fetchSentList;
		container.resolve('postSentRedis').updateSentList = mock.updateSentList;
	});

	afterAll(async () => {
		app.close();
	});

	beforeEach(() => {
		for (let mockFunctions of Object.values(mock)) {
			mockFunctions.mockReset();
		}
	});

	test('return follow feed response, without limit and offset', async (done) => {
		const mockSetup = (mocks) => {
			mocks.fetchFeed.mockResolvedValueOnce([ { post_id: '7237058623_followFeed', added_on: 1639650884000 } ]);
			mocks.getPostCards.mockResolvedValueOnce(new Map(feed));
		};
		const expected = {
			err: null, res:{
				feed:[
					{
						us: 0,
						cd: '0',
						i: '7237058623',
						tt: [
							{
								i: '4572',
								n: 'సినిమా',
								th: 'kgnd'
							}
						],
						a: '769',
						authorId: '769',
						n: 'Ramesh',
						y: 'https://cdn.sharechat.com/ProfilePic/bf37b8dc-3c5c-44f8-97a8-aff15eff316a-3cd2fee5-0868-4221-a036-88df30698f6f.jpeg',
						t: 'image',
						g: 'https://dynamic-image-resizer.sharechat.com/imageResizer/3487266d_1588159719765.jpeg',
						b: 'https://cdn-cf.sharechat.com/3487266d_1588159719765_thumbnail.jpeg',
						c: '#సినిమా',
						o: '1639743273',
						m: 'Telugu',
						w: '720',
						h: '1186',
						z: '26704',
						q: 'image/jpeg',
						lc: '0',
						usc: '0',
						branchIOLink: 'https://sharechat.com/post/7DV4BWA?d=n',
						favouriteCount: '0',
						rvd: 0,
						ad: '0',
						adult: '0',
						sd: '0',
						bottomVisibilityFlag: 0,
						hideHeader: false,
						hidePadding: false,
						permalink: 'https://sharechat.com/post/7DV4BWA?d=n',
						ph: '7DV4BWA',
						encodedText: null,
						isImageResizeApplicable: true,
						authorIdStatus: '769_2',
						langStatus: 'Telugu_2',
						approved: 1,
						encodedTextV2: '{[{4572}]}',
						postCreationLocation: 'vishakhapatnam, AP',
						postCreationLatLong: '17.6677478,82.9659278',
						captionTagsList: [
							{
								bucketId: '45',
								bucketName: 'టాలీవుడ్ అడ్డా!',
								groupTag: false,
								isAdult: false,
								tagId: '4572',
								tagName: 'సినిమా',
								tagHash: 'kgnd'
							}
						],
						postCategory: 'normal',
						ath: {
							i: '769',
							n: 'test',
							pu: 'https://d3doh47p6cvh2n.cloudfront.net/sharechat_random_profile_141.jpg',
							s: 'Cecile Fritsch1',
							tu: 'https://d3doh47p6cvh2n.cloudfront.net/thumb_sharechat_random_profile_141.jpg',
							pc: '42662',
							a: '98',
							b: '25',
							h: 'siva',
							vp: '0',
							config_bits: 0,
							f: '1',
							fb: '0',
							coverPic: 'https://cdn.sharechat.com/दोपहरशायरी_2195599e_1548402376728_cmprsd_40.jpg',
							bk: '0',
							lc: 'Melba Altenwerth',
							branchIOLink: 'https://sharechat.com/profile/siva?d=n'
						},
						taggedUsers: null,
						meta: 'followFeed'
					}
				],
				nextOffset: null,
				   ord: [ -1639650884000 ],
				//    ord:undefined,
			}
		};
		const assertTest = (mocks) => {
			expect(mocks.fetchFeed.mock.calls.length).toBe(1);
			expect(mocks.getPostCards.mock.calls.length).toBe(1);
			expect(mocks.deleteInvalidPosts.mock.calls.length).toBe(0);
			expect(mocks.updateSentList.mock.calls.length).toBe(0);
			expect(mocks.takeSnapshotOfSentList.mock.calls.length).toBe(0);
			expect(mocks.fetchSentList.mock.calls.length).toBe(0);
		};

		mockSetup(mock);
		const args = {
			userId: 1,
			limit: 10,
			offset: null
		};
		const [ err, res ] = await utility.invoker(fetchFollowFeedLogic.fetchFollowFeed(...Object.values(args)));
		await Promise.resolve(); // flush all promises
		expect(err).toStrictEqual(expected.err);
		expect(res).toStrictEqual(expected.res);
		assertTest(mock);
		done();
	});


	test('return follow feed response, video post', async (done) => {
		const mockSetup = (mocks) => {
			mocks.fetchFeed.mockResolvedValueOnce([ { post_id: '7237058623_followFeed', added_on: 1639650884000 } ]);
			mocks.getPostCards.mockResolvedValueOnce(new Map([ videoPost ]));
		};
		const expected = {
			err: null, res:{
				feed:[
					{
						us: 0,
						cd: '0',
						i: '7237058623',
						tt: [
							{
								i: '4572',
								n: 'సినిమా',
								th: 'kgnd'
							}
						],
						a: '769',
						authorId: '769',
						shouldAutoplay: undefined,
						n: 'Ramesh',
						y: 'https://cdn.sharechat.com/ProfilePic/bf37b8dc-3c5c-44f8-97a8-aff15eff316a-3cd2fee5-0868-4221-a036-88df30698f6f.jpeg',
						t: 'video',
						g: 'https://dynamic-image-resizer.sharechat.com/imageResizer/3487266d_1588159719765.jpeg',
						b: 'https://cdn-cf.sharechat.com/3487266d_1588159719765_thumbnail.jpeg',
						c: '#సినిమా',
						o: '1639743273',
						m: 'Telugu',
						w: '720',
						h: '1186',
						z: '26704',
						q: 'image/jpeg',
						lc: '0',
						usc: '0',
						branchIOLink: 'https://sharechat.com/post/7DV4BWA?d=n',
						favouriteCount: '0',
						rvd: 0,
						ad: '0',
						adult: '0',
						sd: '0',
						bottomVisibilityFlag: 0,
						hideHeader: false,
						hidePadding: false,
						permalink: 'https://sharechat.com/post/7DV4BWA?d=n',
						ph: '7DV4BWA',
						encodedText: null,
						isImageResizeApplicable: true,
						authorIdStatus: '769_2',
						langStatus: 'Telugu_2',
						approved: 1,
						encodedTextV2: '{[{4572}]}',
						postCreationLocation: 'vishakhapatnam, AP',
						postCreationLatLong: '17.6677478,82.9659278',
						captionTagsList: [
							{
								bucketId: '45',
								bucketName: 'టాలీవుడ్ అడ్డా!',
								groupTag: false,
								isAdult: false,
								tagId: '4572',
								tagName: 'సినిమా',
								tagHash: 'kgnd'
							}
						],
						postCategory: 'normal',
						ath: {
							i: '769',
							n: 'test',
							pu: 'https://d3doh47p6cvh2n.cloudfront.net/sharechat_random_profile_141.jpg',
							s: 'Cecile Fritsch1',
							tu: 'https://d3doh47p6cvh2n.cloudfront.net/thumb_sharechat_random_profile_141.jpg',
							pc: '42662',
							a: '98',
							b: '25',
							h: 'siva',
							vp: '0',
							config_bits: 0,
							f: '1',
							fb: '0',
							coverPic: 'https://cdn.sharechat.com/दोपहरशायरी_2195599e_1548402376728_cmprsd_40.jpg',
							bk: '0',
							lc: 'Melba Altenwerth',
							branchIOLink: 'https://sharechat.com/profile/siva?d=n'
						},
						taggedUsers: null,
						meta: 'followFeed'
					}
				],
				nextOffset: null,
				   ord: [ -1639650884000 ],
				//    ord:undefined,
			}
		};
		const assertTest = (mocks) => {
			expect(mocks.fetchFeed.mock.calls.length).toBe(1);
			expect(mocks.getPostCards.mock.calls.length).toBe(1);
			expect(mocks.updateSentList.mock.calls.length).toBe(0);
			expect(mocks.takeSnapshotOfSentList.mock.calls.length).toBe(0);
			expect(mocks.fetchSentList.mock.calls.length).toBe(0);
		};

		mockSetup(mock);
		const args = {
			userId: 1,
			limit: 10,
			offset: null
		};
		const [ err, res ] = await utility.invoker(fetchFollowFeedLogic.fetchFollowFeed(...Object.values(args)));
		await Promise.resolve(); // flush all promises
		expect(err).toStrictEqual(expected.err);
		expect(res).toStrictEqual(expected.res);
		assertTest(mock);
		done();
	});

	test('error in fetching post from scylla v3', async (done) => {
		const mockSetup = (mocks) => {
			mocks.takeSnapshotOfSentList.mockResolvedValueOnce([]);
			mocks.fetchSentList.mockResolvedValueOnce([]);
			mocks.fetchFeed.mockRejectedValueOnce('Internal server error');
		};
		const expected = {
			err: 'Internal server error', res:null
		};
		const assertTest = (mocks) => {
			expect(mocks.takeSnapshotOfSentList.mock.calls.length).toBe(1);
			expect(mocks.fetchSentList.mock.calls.length).toBe(2);
			expect(mocks.fetchFeed.mock.calls.length).toBe(1);
			expect(mocks.getPostCards.mock.calls.length).toBe(0);
			expect(mocks.updateSentList.mock.calls.length).toBe(0);
		};

		mockSetup(mock);
		const args = {
			userId: 1,
			variant: 'control',
			limit: 1,
			offset: null
		};
		const [ err, res ] = await utility.invoker(fetchFollowFeedLogic.fetchFollowFeedV3(...Object.values(args)));
		await Promise.resolve(); // flush all promises
		expect(err).toStrictEqual(expected.err);
		expect(res).toStrictEqual(expected.res);
		assertTest(mock);
		done();
	});

	test('error in fetching post cards, fetch follow feedv2', async (done) => {
		const mockSetup = (mocks) => {
			mocks.takeSnapshotOfSentList.mockResolvedValueOnce([]);
			mocks.fetchSentList.mockResolvedValueOnce([]);
			mocks.fetchFeed.mockResolvedValueOnce([{ post_id: '7237058623_followFeed', added_on: 1639650884000 }]);
			mocks.getPostCards.mockRejectedValueOnce('Internal server error');
		};
		const expected = {
			err: 'Internal server error', res:null
		};
		const assertTest = (mocks) => {
			expect(mocks.takeSnapshotOfSentList.mock.calls.length).toBe(1);
			expect(mocks.fetchSentList.mock.calls.length).toBe(2);
			expect(mocks.fetchFeed.mock.calls.length).toBe(1);
			expect(mocks.getPostCards.mock.calls.length).toBe(1);
			expect(mocks.updateSentList.mock.calls.length).toBe(0);
		};

		mockSetup(mock);
		const args = {
			userId: 1,
			variant: 'control',
			limit: 1,
			offset: null
		};
		const [ err, res ] = await utility.invoker(fetchFollowFeedLogic.fetchFollowFeedV3(...Object.values(args)));
		await Promise.resolve(); // flush all promises
		expect(err).toStrictEqual(expected.err);
		expect(res).toStrictEqual(expected.res);
		assertTest(mock);
		done();
	});

	test('success response unseen post, fetch follow feedv3', async (done) => {
		const mockSetup = (mocks) => {
			mocks.takeSnapshotOfSentList.mockResolvedValueOnce([]);
			mocks.fetchFeed.mockResolvedValueOnce([{ post_id: '7237058623_followFeed', added_on: 1639650884000 }]);
			mocks.getPostCards.mockResolvedValueOnce(new Map(feed));
			mocks.updateSentList.mockResolvedValueOnce();
		};
		const expected = {
			err: null, res:
			{ feed :
			[ { a: '769',
				ad: '0',
				adult: '0',
				approved: 1,
				ath: {
					a: '98',
					b: '25', bk: '0',
					branchIOLink: 'https://sharechat.com/profile/siva?d=n',
					config_bits: 0, coverPic: 'https://cdn.sharechat.com/दोपहरशायरी_2195599e_1548402376728_cmprsd_40.jpg',
					f: '1',
					fb: '0',
					h: 'siva',
					i: '769',
					lc: 'Melba Altenwerth', n: 'test',
					pc: '42662',
					pu: 'https://d3doh47p6cvh2n.cloudfront.net/sharechat_random_profile_141.jpg',
					s: 'Cecile Fritsch1',
					tu: 'https://d3doh47p6cvh2n.cloudfront.net/thumb_sharechat_random_profile_141.jpg',
					vp: '0'
				},
				authorId: '769',
				authorIdStatus: '769_2',
				b: 'https://cdn-cf.sharechat.com/3487266d_1588159719765_thumbnail.jpeg',
				bottomVisibilityFlag: 0, branchIOLink: 'https://sharechat.com/post/7DV4BWA?d=n',
				c: '#సినిమా',
				captionTagsList: [ { bucketId: '45', bucketName: 'టాలీవుడ్ అడ్డా!', groupTag: false, isAdult: false, tagHash: 'kgnd', tagId: '4572', tagName: 'సినిమా' } ],
				cd: '0',
				encodedText: null,
				encodedTextV2: '{[{4572}]}',
				favouriteCount: '0',
				g: 'https://dynamic-image-resizer.sharechat.com/imageResizer/3487266d_1588159719765.jpeg',
				h: '1186',
				hideHeader: false,
				hidePadding: false,
				i: '7237058623',
				isImageResizeApplicable: true,
				langStatus: 'Telugu_2',
				lc: '0',
				m: 'Telugu',
				meta: 'followFeed',
				n: 'Ramesh',
				o: '1639743273',
				permalink: 'https://sharechat.com/post/7DV4BWA?d=n',
				ph: '7DV4BWA',
				postCategory: 'normal',
				postCreationLatLong: '17.6677478,82.9659278',
				postCreationLocation: 'vishakhapatnam, AP',
				q: 'image/jpeg',
				rvd: 0,
				sd: '0',
				t: 'image',
				taggedUsers: null,
				tt: [ { i: '4572', n: 'సినిమా', th: 'kgnd' } ],
				us: 0,
				usc: '0',
				w: '720',
				y: 'https://cdn.sharechat.com/ProfilePic/bf37b8dc-3c5c-44f8-97a8-aff15eff316a-3cd2fee5-0868-4221-a036-88df30698f6f.jpeg',
				z: '26704' } ],
			nextOffset: null, ord: [ -1639650884000 ] }
		};
		const assertTest = (mocks) => {
			expect(mocks.takeSnapshotOfSentList.mock.calls.length).toBe(1);
			expect(mocks.fetchSentList.mock.calls.length).toBe(2);
			expect(mocks.fetchFeed.mock.calls.length).toBe(1);
			expect(mocks.getPostCards.mock.calls.length).toBe(1);
			expect(mocks.updateSentList.mock.calls.length).toBe(1);
		};

		mockSetup(mock);
		const args = {
			userId: 1,
			variant: 'control',
			limit: 1,
			offset: null
		};
		const [ err, res ] = await utility.invoker(fetchFollowFeedLogic.fetchFollowFeedV3(...Object.values(args)));
		await Promise.resolve(); // flush all promises
		expect(err).toStrictEqual(expected.err);
		expect(res).toStrictEqual(expected.res);
		assertTest(mock);
		done();
	});
});