"use strict";
Object.defineProperty(exports, "__esModule", {
	value: true,
});
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const LANGUAGES = ["vue", "less", "scss", "sass", "stylus", "styl"];
const styleTagRE = /<style[\s\S]*?<\/style>/g;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cbg-rem-px2" is now active!');
	const configuration = vscode.workspace.getConfiguration("px2fun");
	console.log(configuration, "configuration");
	const { p2rFunName, p2rMinPx } = configuration;
	console.log(p2rFunName, p2rMinPx, "p2rFunName, p2rMinPx");

	// const px2FunInstance = new Px2Fun({ p2rMinPx, p2rFunName });
	// const providerInstance = new Px2FunProvider(px2FunInstance);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand(
		"cbg-rem-px2.p2r",
		function () {
			// The code you place here will be executed every time your command is executed

			// Display a message box to the user
			vscode.window.showInformationMessage(
				"Hello World from cbg-rem-px2!"
			);
		}
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
