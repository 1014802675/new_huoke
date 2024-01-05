<template>
	<view :style="background?'background-image: url(' + background + ');':''"
		style="background: no-repeat;background-size: 100% auto;">
		<view class="jiangqie-login">
			<view class="jiangqie-app-info">
				<!--替换为小程序logo-->
				<image :src="head" mode="aspectFill"></image>
				<view class="jiangqie-app-name">{{title}}</view>
				<view class="jiangqie-app-slogan">
				     授权登录可查看更多内容
				</view>
			</view>
			<view class="jiangqie-login-btn">
				<button @tap.stop="handlerCancelClick" class="jiangqie-login-btnl">取消</button>

				<template>
					<!-- #ifdef MP-WEIXIN -->
					<button v-if="code" @tap.stop="clickLogin" class="jiangqie-login-btnr">确定</button>
					<template v-else>
						<button class="jiangqie-login-btnl">确定</button>
					</template>
					<!-- #endif -->

				
				</template>
				
			</view>
		</view>

		<view  class="jiangqie-login-tip">
			<label @click="clickAgreeLicense">
				<radio :checked="argeeLicense" color="#ff4400" style="transform:scale(0.7)" />
				我已阅读并同意
			</label>
			<text class="link" @click="clickYSTK">《隐私条款》</text>
			<text>及</text>
			<text class="link" @click="clickYHXY">《用户协议》</text>
		</view>
	</view>
</template>

<script>
	/*
	 * 酱茄小程序开源版
	 * 作者: 追格
	 * 文档：https://www.zhuige.com/docs/zxfree.html
	 * github: https://github.com/zhuige-com/jiangqie_kafei
	 * gitee: https://gitee.com/zhuige_com/jiangqie_kafei
	 * Copyright © 2020-2023 www.zhuige.com All rights reserved.
	 */

	const Util = require("@/utils/util.js");
	const Auth = require("@/utils/auth.js");
	const Api = require("@/utils/api.js");
	const Rest = require("@/utils/rest.js");

	export default {
		components: {
			
		},
		
		data() {
			return {
				type: 'login',

				background: '',
				title: '',
				head: '/static/images/default_avatar.jpg',
				ystk: undefined,
				yhxy: undefined,

				code: '',

				// 是否已登录百度App
				is_login_baidu: false,

				argeeLicense: false,
				sessionKey:'',
			};
		},

		onLoad(options) {
				uni.hideShareMenu()
			uni.showLoading();
			setTimeout(() => {
				uni.hideLoading();
						
			}, 400)
			if (options.type) {
				this.type = options.type;
			}
			//头像和昵称
			Rest.get(Api.JIANGQIE_GET_CONFIG).then(res => {
				this.background = res.data.background
				this.title = res.data.title
				this.head = res.data.head
				
			});
			let nav_title = (this.type == 'login' ? '登录' : '绑定手机号');
			uni.setNavigationBarTitle({
				title: nav_title
			})
			
			this.getlogin();
		},
       
		onShareAppMessage() {
			return {
				title: getApp().globalData.appName,
				path: 'pages/index/index'
			};
		},

		// #ifdef MP-WEIXIN
		onShareTimeline() {
			return {
				title: getApp().globalData.appName
			};
		},
		// #endif

		methods: {
			/**
			 * 点击 打开链接
			 */
			clickLink(link) {
				Util.openLink(link)
			},
			getlogin(){
				uni.login({
					provider: 'weixin',
					success: (res) => {
						if (res.errMsg == 'login:ok') {
							//获取到code
							this.code = res.code;
							console.log('获取code', res.code);
												
						}
					
					},
				})
			},
			/**
			 * 点击同意协议
			 */
			clickAgreeLicense() {
				this.argeeLicense = !this.argeeLicense;
			},
			
			/**
			 * 点击 隐私条款
			 */
			clickYSTK() {
				if (!this.ystk) {
					Util.toast('请在后台设置隐私条款');
					return;
				}
				Util.openLink('/pages/viewhtml/viewhtml?page_id=' + this.ystk)
			},
			
			/**
			 * 点击 用户协议
			 */
			clickYHXY() {
				if (!this.yhxy) {
					Util.toast('请在后台设置用户协议');
					return;
				}
				Util.openLink('/pages/viewhtml/viewhtml?page_id=' + this.yhxy)
			},

			/**
			 * 点击 取消
			 */
			handlerCancelClick(e) {
				Util.navigateBack();
			},

			/**
			 * 测试 登录功能
			 */
			clickLoginTest(e) {
				if (!this.argeeLicense) {
					Util.toast('请阅读并同意《用户协议》及《隐私条款》');
					return;
				}

				Rest.get(Api.JIANGQIE_USER_LOGIN_TEST, {}).then(res => {
					Auth.setUser(res.data);
					Util.navigateBack();
				}, err => {
					console.log(err)
				});
			},

			/**
			 * 点击 登录
			 */
			clickLogin(e) {
				var that = this;
				if (!that.argeeLicense) {
					Util.toast('请阅读并同意《用户协议》及《隐私条款》');
					return;
				}
				uni.showLoading({ // 展示加载框
					title: '正在授权',
				});
				var params = {'code':that.code}
				Rest.post(Api.JIANGQIE_POST_WX_CODE, {
					code: that.code
				}).then(res => {
					that.sessionKey  = res.data.session_key;
					that.myProfile(res.data.openid);
				}, err => {
					if (err.msg) {
						Util.toast(err.msg);
					}
					this.getlogin();
				});
				
			
			},
			myProfile(openid){
				console.log('用户的id',openid) //用户的信息
				var p_id =  uni.getStorageSync('jiangqie_p_id');
				uni.getUserProfile({
					desc:'Wexin',     // 这个参数是必须的
					success:res=>{
						let rawData = JSON.parse (res.rawData)//将数据处理为前端使用的json格式
						console.log(rawData)
						console.log('用户的信息',res) //用户的信息
						Rest.post(Api.JIANGQIE_POST_WX_LOGIN, {
							encryptedData: res.encryptedData,
							iv: res.iv,
							sessionKey: this.sessionKey,
							openid: openid,
							pid: p_id
						}).then(res => {
							uni.setStorageSync('jiangqie_user_id', res.data.id);
							uni.setStorageSync('jiangqie_user', res.data.token);
							uni.setStorageSync('jiangqie_phone', res.data.phone);
							uni.setStorageSync('jiangqie_head', res.data.headimgurl);
							
							uni.hideLoading()
							uni.showToast({
								title:'授权登录成功',
								icon:'success',
								success: function () {
									 setTimeout(function () {
									   //要延时执行的代码
									  	Util.navigateBack();
									 },1500) //延迟时间
								}
							})
						}, err => {
							if (err.msg) {
								Util.toast(err.msg);
							}
							uni.login({
								provider: 'weixin',
								success: (res) => {
									if (res.errMsg == 'login:ok') {
										//获取到code
										this.code = res.code;
										console.log('获取code', res.code);
															
									}
								
								},
							})
						});
					
					},
					
				})
			},
		}
	};
</script>

<style lang="scss" scoped>
	.jiangqie-app-info {
		padding: 50rpx 40rpx;
		text-align: center;
	}

	.jiangqie-app-info image {
		height: 200rpx;
		width: 200rpx;
		border-radius: 200rpx;
	}

	.jiangqie-app-name {
		font-size: 32rpx;
		color: #FFF;
		font-weight: 500;
		line-height: 80rpx;
	}

	.jiangqie-app-slogan {
		font-size: 28rpx;
		color: #F8B8B8;
		font-weight: 400;
		line-height: 40rpx;
	}

	.jiangqie-login-btn {
		margin-top: 160rpx;
		padding: 0rpx 160rpx;
	}


	.jiangqie-login-btnl,
	.jiangqie-login-btnr {
		height: 80rpx;
		font-size: 30rpx;
		color: #555;
		font-weight: 400;
		border-radius: 16rpx;
		border: 2rpx solid #DDD;
		margin-top: 30rpx;
	}

	.jiangqie-login-btnl {
		color: #999;
		background: #FFF;
	}

	.jiangqie-no-login-tip {
		margin-top: 30rpx;
		text-align: center;
		font-size: 24rpx;
		color: #999999;
	}

	.jiangqie-login-tip {
		width: 100%;
		position: fixed;
		bottom: 100rpx;
		line-height: 2rem;
		text-align: center;
		font-size: 22rpx;
		color: #333333;
	}

	.jiangqie-login-tip text.link {
		color: #111111;
		text-decoration: underline;
	}
</style>