"use strict";
// 表明当前模块是一个ES6模块。
Object.defineProperty(exports, "__esModule", { value: true });

const vscode = require("vscode");
// 判断当前文件是否属于MVVM项目
const { isMvvmProject } = require("./untils.js");

class Px2FunProvider {
	// 定义一个名为Px2FunProvider的类，它有一个构造函数，接收一个px2FunInstance参数，并将其存储在实例属性this.px2FunInstance中。
	constructor(px2FunInstance) {
		this.px2FunInstance = px2FunInstance;
	}

	// VSCode代码补全提供者必须实现的方法，接收两个参数：
	// document（当前编辑的文档）和position（光标位置）
	provideCompletionItems(document, position) {
		if (!isMvvmProject(document.fileName)) return;
		// 获取光标所在行的内容，并截取光标位置之前的文本，然后去除前后空格。
		const line = document.lineAt(position);
		const lineText = line.text.substring(0, position.character).trim();

		// 调用px2FunInstance的三个方法：convertPx、convertColor和convertBgc，并将它们的结果放入一个数组中。然后使用reduce方法来处理这些结果
		return [
			this.px2FunInstance.convertPx(lineText),
			this.px2FunInstance.convertColor(lineText),
			this.px2FunInstance.convertBgc(lineText),
		].reduce((items, result) => {
			if (!result) {
				return items;
			}

			result = Array.isArray(result) ? result : [result];

			result.forEach((item) => {
				items.push({
					label: item.label || item.insertText, // 如果item有label属性，则使用它，否则使用insertText
					insertText: item.insertText, // 当用户选择补全项时，插入到文档中的文本
					kind: vscode.CompletionItemKind.Unit, // 表示补全项是一个单位
					filterText: item.filterText, // 用于过滤补全列表的文本
					preselect: true, // 预选中这个补全项
					sortText: "-1", // 将这个补全项排在补全列表的最前面
				});
			});

			return items;
		}, []);
	}
}

module.exports = Px2FunProvider;
