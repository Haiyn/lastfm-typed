import * as chai from "chai";
chai.use(require("chai-json-schema-ajv"));
const expect = chai.expect;
import LastFM from "../dist/index";

import {env} from "process";

let config = {
	key: env.LASTFMKEY,
	secret: env.LASTFMSECRET,
	testUsername: env.TESTUSERNAME,
}

if (!config.key) {
	config = require("./config.json");
}
import userSchema from "./schema/userSchema.json";

const lastfm = new LastFM(config.key as string, { apiSecret: config.secret as string });

function lfmError(code:number, message:string) {
	return {code, message} as any;
}

describe("User", async () => {

	describe(".getFriends", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getFriends(config.testUsername!)).to.be as any).jsonSchema(userSchema.getFriends);
		});

		it("Should return properly with recenttracks", async () => {
			(expect(await lastfm.user.getFriends(config.testUsername!, {recenttracks: true})).to.be as any).jsonSchema(userSchema.getFriends);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getFriends({user: config.testUsername!, recenttracks: true})).to.be as any).jsonSchema(userSchema.getFriends);
		});

		it("Should error for user with no friends", async () => {
			
			try {
				await lastfm.user.getFriends("lastfmtypedtest")
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "no such page"));
			}

		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getFriends("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl")
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});
	
	describe(".getInfo", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getInfo(config.testUsername!)).to.be as any).jsonSchema(userSchema.getInfo);
		});

		it("Should return properly", async () => {
			(expect(await lastfm.user.getInfo({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getInfo);
		});

		it("Should have artist, album, track counts", async () => {
			const info = await lastfm.user.getInfo(config.testUsername!);
			expect(info.artistCount).to.be.greaterThan(460);
			expect(info.albumCount).to.be.greaterThan(780);
			expect(info.trackCount).to.be.greaterThan(2600);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getInfo("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl")
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getLovedTracks", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getLovedTracks(config.testUsername!)).to.be as any).jsonSchema(userSchema.getLovedTracks);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getLovedTracks({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getLovedTracks);
		});

		it("Should return properly for account with no loved tracks", async () => {
			(expect(await lastfm.user.getLovedTracks("lastfmtypedtest")).to.be as any).jsonSchema(userSchema.getLovedTracks);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getLovedTracks("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl")
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getPersonalTags", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getPersonalTags(config.testUsername!, "singer-songwriter", "artist")).to.be as any).jsonSchema(userSchema.getPersonalTags);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getPersonalTags({user: config.testUsername!, tag: "singer-songwriter", taggingType: "artist"})).to.be as any).jsonSchema(userSchema.getPersonalTags);
		});

		it("Should return properly with no tag", async () => {
			(expect(await lastfm.user.getPersonalTags(config.testUsername!, "2000s", "artist")).to.be as any).jsonSchema(userSchema.getPersonalTags);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getLovedTracks("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl")
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getRecentTracks", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getRecentTracks(config.testUsername!, {limit: 20})).to.be as any).jsonSchema(userSchema.getRecentTracks);
		});

		it("Should return properly for extended", async () => {
			(expect(await lastfm.user.getRecentTracks(config.testUsername!, {extended: true, limit: 20})).to.be as any).jsonSchema(userSchema.getRecentTracks);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getRecentTracks({user: config.testUsername!, extended: true, limit: 20})).to.be as any).jsonSchema(userSchema.getRecentTracks);
		});

		it("Should return properly for user with no scrobbles", async () => {
			(expect(await lastfm.user.getRecentTracks("Shaun__", {limit: 20})).to.be as any).jsonSchema(userSchema.getRecentTracks);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getRecentTracks("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl");
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

		it("Should return loved property when extended true", async () => {
			const res = await lastfm.user.getRecentTracks(config.testUsername!, {extended: true, limit: 5});
			for (const track of res.tracks) {
				expect(track).to.have.property("loved");
			}
		});
	});

	describe(".getTopAlbums", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getTopAlbums(config.testUsername!)).to.be as any).jsonSchema(userSchema.getTopAlbums);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getTopAlbums({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getTopAlbums);
		});

		it("Should return properly for user with no scrobbles", async () => {
			(expect(await lastfm.user.getTopAlbums("Shaun__")).to.be as any).jsonSchema(userSchema.getTopAlbums);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getTopAlbums("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl");
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getTopArtists", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getTopArtists(config.testUsername!)).to.be as any).jsonSchema(userSchema.getTopArtists);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getTopArtists({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getTopArtists);
		});

		it("Should return properly for user with no scrobbles", async () => {
			(expect(await lastfm.user.getTopArtists("Shaun__")).to.be as any).jsonSchema(userSchema.getTopArtists);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getTopArtists("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl");
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getTopTags", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getTopTags(config.testUsername!)).to.be as any).jsonSchema(userSchema.getTopTags);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getTopTags({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getTopTags);
		});

		it("Should return properly for user with no tags/scrobbles", async () => {
			(expect(await lastfm.user.getTopTags("Shaun__")).to.be as any).jsonSchema(userSchema.getTopTags);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getTopTags("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl");
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getTopTracks", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getTopTracks(config.testUsername!)).to.be as any).jsonSchema(userSchema.getTopTracks);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getTopTracks({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getTopTracks);
		});

		it("Should return properly for user with no scrobbles", async () => {
			(expect(await lastfm.user.getTopTracks("Shaun__")).to.be as any).jsonSchema(userSchema.getTopTracks);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getTopTracks("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl");
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getWeeklyAlbumChart", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getWeeklyAlbumChart(config.testUsername!)).to.be as any).jsonSchema(userSchema.getWeeklyAlbumChart);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getWeeklyAlbumChart({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getWeeklyAlbumChart);
		});

		it("Should return properly for user with no scrobbles", async () => {
			(expect(await lastfm.user.getWeeklyAlbumChart("Shaun__")).to.be as any).jsonSchema(userSchema.getWeeklyAlbumChart);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getWeeklyAlbumChart("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl");
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getWeeklyArtistChart", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getWeeklyArtistChart(config.testUsername!)).to.be as any).jsonSchema(userSchema.getWeeklyArtistChart);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getWeeklyArtistChart({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getWeeklyArtistChart);
		});

		it("Should return properly for user with no scrobbles", async () => {
			(expect(await lastfm.user.getWeeklyArtistChart("Shaun__")).to.be as any).jsonSchema(userSchema.getWeeklyArtistChart);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getWeeklyArtistChart("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl");
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

	describe(".getWeeklyChartList", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getWeeklyChartList()).to.be as any).jsonSchema(userSchema.getWeeklyChartList);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getWeeklyChartList({})).to.be as any).jsonSchema(userSchema.getWeeklyChartList);
		});

	});

	describe(".getWeeklyTrackChart", async () => {

		it("Should return properly", async () => {
			(expect(await lastfm.user.getWeeklyTrackChart(config.testUsername!)).to.be as any).jsonSchema(userSchema.getWeeklyTrackChart);
		});

		it("Should return properly with object input", async () => {
			(expect(await lastfm.user.getWeeklyTrackChart({user: config.testUsername!})).to.be as any).jsonSchema(userSchema.getWeeklyTrackChart);
		});

		it("Should return properly for user with no scrobbles", async () => {
			(expect(await lastfm.user.getWeeklyTrackChart("Shaun__")).to.be as any).jsonSchema(userSchema.getWeeklyTrackChart);
		});

		it("Should error when user does not exist", async () => {

			try {
				await lastfm.user.getWeeklyTrackChart("sodkjfklasdasdasdasddasdasadasdasasdasaaasddsasadasdasdjfkl");
				throw "Did not error";
			} catch (err) {
				expect(err).to.deep.equal(lfmError(6, "User not found"));
			}

		});

	});

});