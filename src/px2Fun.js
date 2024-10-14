"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color = require("color");
const {
	spaceVariable,
	fzVariable,
	colorVariable,
	bgcVariable,
} = require("./config");

const linePxRE = /([-]?\d+(\.\d+)?)p[x]?/;
const filePxRE = /(-?\d+(\.\d+)?)px/g;
const spaceRE = /(padding|margin)(.*?):(.*?);/g;
const fzRE = /(font-size:[\s]*)(.*?);/g;
const lineColorRE = /^(color:[\s]*)(.*?)$/;
const fileColorRE = /([^-]color:[\s]*)(.*?);/g;
const lineBgcRE = /(background-color:[\s]*|background:[\s]*)(.*?)$/;
const fileBgcRE = /(background-color:[\s]*|background:[\s]*)(.*?);/g;

class Px2Fun {
	constructor({ p2rFunName = "rem", p2rMinPx = 0 }) {
		this.p2rFunName = p2rFunName;
		this.p2rMinPx = p2rMinPx;

		this.colorVariable = this.formatColorVariable(colorVariable);
		this.bgcVariable = this.formatColorVariable(bgcVariable);
	}

	// 这里会将色值在转换一层, 边缘匹配，转换成rgb类似那种形式
	formatColorVariable(colorVariable) {
		return Object.entries(colorVariable).reduce((obj, [key, value]) => {
			obj[Color(key).hsl().toString()] = value;

			return obj;
		}, {});
	}

	// px 转换成rem(px * 2)
	getPxFun(px) {
		return `${this.p2rFunName}(${px * 2})`;
	}

	convertPx(lineText) {
		//  解析选中的要匹配像素值
		const match = lineText.match(linePxRE);
		if (!match) return;
		//获取具体的数值
		const px = match[1];
		const filterText = `${px}px`;

		if (this.isInMinPx(px)) return;
		// 这里是补全项的显示配置
		const completions = [
			{
				label: `${px}px -> ${this.getPxFun(px)}`,
				filterText,
				insertText: this.getPxFun(px),
			},
		];

		let pxVariable;
		// 有padding 和 margin 就看看是否命中公共样式，然后也给补全提示
		if (lineText.includes("padding") || lineText.includes("margin")) {
			pxVariable = this.getPxVariable(spaceVariable, px);
		}
		// 是font-size 就看看是否命中公共样式，然后也给补全提示
		if (lineText.includes("font-size")) {
			pxVariable = this.getPxVariable(fzVariable, px);
		}

		if (pxVariable) {
			// @ts-ignore
			completions.push({
				filterText,
				insertText: pxVariable,
			});
		}

		return completions;
	}
	// 补全规则匹配颜色相关
	convertColor(lineText) {
		const match = lineText.match(lineColorRE);
		if (!match) return;

		const color = match[2];
		const variable = this.getColorVariable(this.colorVariable, match[2]);

		if (variable) {
			return {
				filterText: color,
				insertText: variable,
			};
		}
	}
	// 补全规则匹配背景颜色相关
	convertBgc(lineText) {
		const match = lineText.match(lineBgcRE);
		if (!match) return;

		const bgc = match[2];
		const variable = this.getColorVariable(this.bgcVariable, match[2]);

		if (variable) {
			return {
				filterText: bgc,
				insertText: variable,
			};
		}
	}

	convertFile(code) {
		if (!code) {
			return code;
		}
		// 链式替换
		// 正则匹配到 例如：color: #555; 然后替换成 color: @color-secondary;
		// （match ="color: #555;"  $1 = "color: "  $2= "@color-secondary" ）
		return code
			.replace(fileColorRE, (match, $1, $2) => {
				return `${$1}${
					this.getColorVariable(this.colorVariable, $2) || $2
				};`;
			})
			.replace(fileBgcRE, (match, $1, $2) => {
				return `${$1}${
					this.getColorVariable(this.bgcVariable, $2) || $2
				};`;
			})
			.replace(spaceRE, (match, $1, $2, $3) => {
				$3 = $3.replace(
					filePxRE,
					(m, n) => this.getPxVariable(spaceVariable, n) || m
				);

				return `${$1}${$2}:${$3};`;
			})
			.replace(fzRE, (match, $1, $2) => {
				$2 = $2.replace(
					filePxRE,
					(m, n) => this.getPxVariable(fzVariable, n) || m
				);

				return `${$1}${$2};`;
			})
			.replace(filePxRE, (match, px) => {
				if (this.isInMinPx(px)) {
					return match;
				}

				return this.getPxFun(px);
			});
	}
	// 命中fz padding margin
	getPxVariable(variable, n) {
		const prefix = n.includes("-") ? "-" : "";

		n = Math.abs(Number(n));

		if (variable[n * 2]) {
			return `${prefix}${variable[n * 2]}`;
		}

		return;
	}
	// 匹配对应的颜色，判断是否命中
	getColorVariable(variable, c) {
		try {
			const hslStr = Color(c).hsl().toString();

			if (variable[hslStr]) {
				return variable[hslStr];
			}

			return;
		} catch (e) {
			return;
		}
	}

	isInMinPx(px) {
		return Math.abs(px) <= this.p2rMinPx;
	}
}

module.exports = Px2Fun;
