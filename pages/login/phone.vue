<template>
	<view :style="background?'background-image: url(' + background + ');':''"
		style="background: no-repeat;background-size: 100% auto;">
		<view class="jiangqie-login">
			<view class="jiangqie-app-info">
				<!--替换为小程序logo-->
				<image :src="head" mode="aspectFill"></image>
				<view class="jiangqie-app-name">{{title}}</view>
				<view class="jiangqie-app-slogan">
					绑定手机号后才能评论
				</view>
			</view>
			<view class="jiangqie-login-btn">
				<button @tap.stop="handlerCancelClick" class="jiangqie-login-btnl">取消</button>

					
				<button type="default" class="jiangqie-login-btnl" open-type="getPhoneNumber"
					@getphonenumber="getPhoneNumber">绑定手机号</button>
			</view>
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
			
		
		},
       
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
			 * 点击 取消
			 */
			handlerCancelClick(e) {
				Util.navigateBack();
			},
            getPhoneNumber(e) {
				console.log(e)
				if(e.detail.errMsg=='getPhoneNumber:fail user deny'){
					uni.showToast({
						title:'已取消',
						icon:'none'
					})
					return;
				}
				Rest.post(Api.JIANGQIE_USER_SET_MOBILE, {
					code: e.detail.code,
				}).then(res => {
					uni.setStorageSync('jiangqie_phone', res.data.phone);
					uni.showToast({
						title:'手机号设置成功',
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
				});     
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