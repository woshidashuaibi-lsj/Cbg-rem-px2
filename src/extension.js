"use strict";
Object.defineProperty(exports, "__esModule", {
	value: true,
});
const vscode = require("vscode");

// 命中规则和生成补全项的内容
const Px2Fun = require("./px2Fun");

// 生成补全项的规则
const Px2FunProvider = require("./provider");

// 判断目录
const { isMvvmProject } = require("./untils");

const LANGUAGES = ["vue", "less", "scss", "sass", "stylus", "styl"];
const styleTagRE = /<style[\s\S]*?<\/style>/g;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// 获取配置参数
	const configuration = vscode.workspace.getConfiguration("px2fun");
	console.log(configuration, "configuration");
	const { p2rFunName, p2rMinPx } = configuration;

	// 命中规则和生成补全项的内容
	const px2FunInstance = new Px2Fun({ p2rMinPx, p2rFunName });
	// 生成补全项的规则
	const providerInstance = new Px2FunProvider(px2FunInstance);

	// 输入时的行处理
	LANGUAGES.forEach((language) => {
		// 存储VSCode扩展中注册的事件监听器和其他资源
		context.subscriptions.push(
			// 为对应语言 注册一个代码补全提供者。providerInstance就是补全项的规则
			vscode.languages.registerCompletionItemProvider(
				language,
				providerInstance
			)
		);
	});

	// 使用命令的批量处理
	context.subscriptions.push(
		// VSCode API注册文本编辑器命令"cbg-rem-px2.p2r"
		vscode.commands.registerTextEditorCommand(
			"cbg-rem-px2.p2r",
			(textEditor) => {
				// document（当前编辑的文档）,selection（当前选中的文本区域）
				let { document, selection } = textEditor;
				// 不是mvvm下的忽略
				if (!isMvvmProject(document.fileName)) return;

				// 获取当前文档的文件扩展名
				let ext = document.fileName.split(".").reverse()[0];
				// 如果LANGUAGES数组中不包含当前文档的扩展名，则不执行任何操作并返回。
				if (!LANGUAGES.includes(ext)) return;

				if (selection.isEmpty) {
					// 如果当前没有文本被选中，则创建一个包含整个文档的新范围。全选
					const start = new vscode.Position(0, 0);
					const end = new vscode.Position(
						document.lineCount - 1,
						document.lineAt(document.lineCount - 1).text.length
					);
					selection = new vscode.Range(start, end);
				}
				// 获取当前选中的文本或整个文档的文本。
				let text = document.getText(selection);
				let res = "";

				if (document.fileName.endsWith(".vue")) {
					// 替换 style 标签内的数据
					res = text.replace(styleTagRE, (match) => {
						return px2FunInstance.convertFile(match);
					});
				} else {
					// 如果不是.vue文件，则对整个文档文本调用px2FunInstance.convertFile方法进行转换。
					res = px2FunInstance.convertFile(text);
				}

				textEditor.edit((builder) => {
					// 使用VSCode的编辑器API来替换选中的文本区域selection为处理后的文本res。
					builder.replace(selection, res);
					// 光标移动到行尾
					vscode.commands.executeCommand("cursorMove", {
						to: "wrappedLineEnd",
					});
				});
			}
		)
	);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
