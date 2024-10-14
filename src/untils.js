exports.isMvvmProject = function (file) {
	// 判断是否是 mvvm 下的文件
	file = file.replace(/\\/g, "/");

	return /\/mvvm\//.test(file);
};
