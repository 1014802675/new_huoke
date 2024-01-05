/*
 * 酱茄小程序开源版
 * 作者: 追格
 * 文档：https://www.zhuige.com/docs/zxfree.html
 * github: https://github.com/zhuige-com/jiangqie_kafei
 * gitee: https://gitee.com/zhuige_com/jiangqie_kafei
 * Copyright © 2020-2023 www.zhuige.com All rights reserved.
 */
const Auth = require("./auth.js");
var is_show_login = false;

/**
 * request封装
 */
function request(url, data = {}, method = "GET") {

	return new Promise(function(resolve, reject) {
		// uni.showLoading();
	
		// data.token = Auth.getToken();
         var token = uni.getStorageSync('jiangqie_user')
		if (method == "GET") {
			data.t = new Date().getTime();
			data.r = Math.floor(Math.random() * 10000);
		}

		// #ifdef MP-WEIXIN
		data.os = 'wx';
		// #endif

		// #ifdef MP-BAIDU
		data.os = 'bd';
		// #endif

		// #ifdef MP-QQ
		data.os = 'qq';
		// #endif

		uni.request({
			url: url,
			data: data,
			method: method,
			header: {
				token:token
			} ,
			success: (res) => {
				if (res.statusCode != 200) {
					reject(res.errMsg);
					return;
				}
				if (res.data.code == -22) {
					console.log(is_show_login);
					if(!is_show_login){
						is_show_login = true;
						
						uni.showToast({
							title:'请登录！',
							icon:'none',
							success: function () {
								uni.navigateTo({
									url: '/pages/login/login?type=mobile'
								})
							}
						})
						 // 设置定时器，确保下次异常时弹框正常弹出
						setTimeout(() => {
							is_show_login = false;
						}, 1000);
					}
							
							
					return;
				}
				if (res.data.code == -11) {
					console.log(is_show_login);
					if(!is_show_login){
						is_show_login = true;
						
						uni.showToast({
							title:'请登录！',
							icon:'none',
							success: function () {
								uni.navigateTo({
									url: '/pages/login/login'
								})
							}
						})
						 // 设置定时器，确保下次异常时弹框正常弹出
						setTimeout(() => {
							is_show_login = false;
						}, 1000);
					}
							
			
					return;
				}

				if (res.data.code == 0) {
					resolve(res.data);
					return;
				}

				reject(res.data);
			},
			fail: (err) => {
				reject(err);
			},
			complete: () => {
				// uni.hideLoading();
			}
		});
	});
}

/**
 * 上传图片
 */
function upload(url, path, data = {}) {
	return new Promise(function(resolve, reject) {
		uni.showLoading({
			title: '上传中……',
		})

	    var token = uni.getStorageSync('jiangqie_user')

		// #ifdef MP-WEIXIN
		data.os = 'wx';
		// #endif

		// #ifdef MP-BAIDU
		data.os = 'bd';
		// #endif

		// #ifdef MP-QQ
		data.os = 'qq';
		// #endif

		uni.uploadFile({
			url: url,
			filePath: path,
			name: 'image',
			formData: data,
			header: {
				token:token
			} ,
			success(res) {
				if (res.statusCode != 200) {
					reject(res.errMsg);
					return;
				}

				let data = undefined;
				if (res.data instanceof String || (typeof res.data).toLowerCase() == 'string') {
					data = JSON.parse(res.data);
				} else {
					data = res.data;
				}

				if (data.code == -1) { //尚未登录
					uni.navigateTo({
						url: '/pages/login/login',
					});
					return;
				}

				resolve(data);
			},
			fail(err) {
				console.log(err)
			},
			complete() {
				uni.hideLoading();
			}
		})
	});
}

/**
 * get请求
 */
function get(url, data = {}) {
	return request(url, data, 'GET');
}

/**
 * post请求
 */
function post(url, data = {}) {
	return request(url, data, 'POST');
}

module.exports = {
	get,
	post,
	upload,
};