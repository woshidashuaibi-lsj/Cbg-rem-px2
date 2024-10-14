module.exports = {
	entry: {
		extensions: "./src/extension.js",
	},
	target: "node",
	output: {
		libraryTarget: "commonjs",
	},
	externals: {
		vscode: "commonjs vscode",
	},
};
