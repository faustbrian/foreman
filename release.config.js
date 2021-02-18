module.exports = {
	branches: ["master"],
	plugins: [
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "angular",
				parserOpts: {
					noteKeywords: ["BREAKING", "BREAKING CHANGE", "BREAKING CHANGES"],
				},
			},
		],
		"@semantic-release/release-notes-generator",
	],
};
