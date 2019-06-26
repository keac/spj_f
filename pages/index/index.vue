<template>
	<view class="content">
		<form @submit="btn_bind" @reset="formReset">
			<view class="login-bg">
				<view class="login-card">
					<view class="flex solid-bottom padding justify-center">
						<image class="logo radius " src="../../static/img/yyico.png"></image>
					</view>
					<view class="login-head">生评教</view>
					<view class="cu-form-group login-input">
						<input type="text" name="num" placeholder="学号/教师工号" />
					</view>
					<view class="cu-form-group login-input">
						<input type="" placeholder="手机号码" v-model="phone" name="phone" maxlength="11"></input>
						<view class="cu-capsule radius">
							<view class='cu-tag bg-green '>
								+86
							</view>
							<view class="cu-tag line-green">
								中国大陆
							</view>
						</view>
					</view>
					<view class="cu-form-group login-input">
						<input placeholder="验证码" name="check"></input>
						<button class='cu-btn bg-green shadow' @click="btn_check" :disabled="is_check_btn">{{check_btn_val}}</button>
					</view>
					<view class="login-function">
						<view class="login-register" @click="go_qa">遇到问题</view>
					</view>

				</view>
			</view>
			<view class="login-btn flex flex-direction">
				<button class="cu-btn bg-green lg" formType="submit">绑定</button>
			</view>
		</form>
	</view>
</template>

<script>
	var graceChecker = require("../../common/graceChecker.js");
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				title: 'Hello',
				phone: "",
				is_check_btn: false,
				check_btn_val: "获取验证码",
				totalTime: 60,
				requestUrl: 'http://127.0.0.1:8080/',
				UserTokenId: "",
				userInfo: ""
			}
		},
		computed: {
			...mapState(['hasLogin']),
			...mapState(['token']),
			
		},
		onLoad() {
			console.log("get user info");
			this.getData();
		},
		methods: {
			...mapMutations(['login']),
			...mapMutations(['setToken']),
			isLogin(){
				if(this.hasLogin){
					uni.redirectTo({
						url: '../../pages/start/start'
					})
					}
			},
			getData() {
				uni.showLoading({
					title: 'loading'
				});
			
				uni.login({
					provider: 'weixin',
					success: (res) => {
						console.log('login success:', res);
						// 更新保存在 store 中的登录状态
						this.login('weixin');
						uni.request({
							url: this.requestUrl + 'login/is_login',
							dataType: 'json',
							method: 'POST',
							header: {
								'content-type': 'application/x-www-form-urlencoded',
							},
							data: {
								code: res.code,
							},
							success: (res) => {
								//console.log('request success', res)
								
								let res_data = res.data;
								console.log();
								if (res_data.code == 1) {
									uni.showToast({
										title: '登陆成功，跳转中',
										icon: 'success',
										mask: true,
									});
									this.login(res_data.token);
									uni.redirectTo({
										url: '../../pages/start/start'
									})

								}else if (res_data.code == 2){
									uni.showToast({
										title: '已投过票',
										icon: 'success',
										mask: true,
									});
									uni.redirectTo({
										url: '../../pages/ok/ok'
									})
								}else if (res_data.code == 4){
									uni.showToast({
										title: '账号已被封禁，请联系管理员处理',
										mask: true,
									});
									
								}
								 else {
									uni.showToast({
										title: res_data.msg,
										icon: 'none',
										mask: true,
									});
								}

							},
							fail: (err) => {
								console.log('request fail', err);
								uni.showModal({
									content: "无法连接至服务器 "+err.errMsg,
									showCancel: false
								});
							},
							complete: () => {
								uni.hideLoading();
							}
						})
					},
					fail: (err) => {
						console.log('login fail:', err);
					}
				});



			},
			go_qa() {
				uni.navigateTo({
					url: '../../pages/qa/qa'
				})
			},
			btn_check: function(e) {

				var rule = [{
					name: "phone",
					checkType: "phoneno",
					checkRule: "",
					errorMsg: "电话号码不正确"
				}];
				var formData = {
					phone: this.phone
				}
				var checkRes = graceChecker.check(formData, rule);
				console.log(formData);
				if (checkRes) {
					uni.showLoading({
						title: '发送中'
					});

					uni.request({
						url: this.requestUrl + 'msg/send',
						dataType: 'json',
						method: 'POST',
						data: {
							userPhone: this.phone
						},
						header: {
							'content-type': 'application/x-www-form-urlencoded',
						},
						success: (res) => {
							//console.log('request success', res)
							let res_data = res.data;
							console.log();
							if (res_data.code == 1) {
								uni.showToast({
									title: '验证码已发送',
									icon: 'success',
									mask: true,
								});
								
								this.is_check_btn = true;
								this.check_btn_val = this.totalTime + 's后重新发送' //这里解决60秒不见了的问题
								let clock = setInterval(() => {
									this.totalTime--
									this.check_btn_val = this.totalTime + 's后重新发送'
									if (this.totalTime < 0) { //当倒计时小于0时清除定时器
										clearInterval(clock)
										this.is_check_btn = false;
										this.check_btn_val = '重新发送验证码'
										this.totalTime = 60
									}
								}, 1000)
							} else {
								uni.showToast({
									title: res.data.msg,
									icon: 'none',
									mask: true,
								});
							}


							
						},
						fail: (err) => {
							console.log('request fail', err);
							uni.showModal({
								content: err.errMsg,
								showCancel: false
							});
						},
						complete: () => {
							uni.hideLoading();
						}
					});





				} else {
					uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
			},
			btn_bind: function(e) {
				//将下列代码加入到对应的检查位置
				//定义表单规则
				var rule = [{
						name: "num",
						checkType: "notnull",
						checkRule: "",
						errorMsg: "学号/工号不能为空"
					},
					{
						name: "phone",
						checkType: "phoneno",
						checkRule: "",
						errorMsg: "电话号码不正确"
					},
					{
						name: "check",
						checkType: "notnull",
						checkRule: "",
						errorMsg: "请输入验证码"
					}
				];
				//进行表单检查
				var formData = e.detail.value;
				var checkRes = graceChecker.check(formData, rule);
				console.log(formData);
				if (checkRes) {
					uni.showLoading({
						title: '登陆中'
					});
					uni.request({
						url: this.requestUrl + 'login/to_login',
						dataType: 'json',
						method: 'POST',
						header: {
							'content-type': 'application/x-www-form-urlencoded' //自定义请求头信息
						},
						//data: formData,
						data: {
							UserTokenId: this.UserTokenId,
							userId: formData.num,
							userPhone: formData.phone,
							checkNum: formData.check
						},
						success: (res) => {
							//console.log('request success', res)
							let res_data = res.data;
							console.log();
							if (res_data.code == 1) {
								uni.showToast({
									title: '登陆成功',
									icon: 'success',
									mask: true,
								});
								this.login(res_data.token);
								uni.redirectTo({
									url: '../../pages/start/start'
								})
							} else {
								uni.showToast({
									title: res_data.msg,
									icon: 'none',
									mask: true,
								});
							}

						},
						fail: (err) => {
							console.log('request fail', err);
							uni.showModal({
								content: err.errMsg,
								showCancel: false
							});
						},
						complete: () => {
							uni.hideLoading();
						}
					});


				} else {
					uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
			},
			formReset: function(e) {
				console.log("清空数据")
				this.chosen = ''
			},

		}
	}
</script>

<style>
	.logo {
		width: 100rpx;
		height: 100rpx;
	}

	.landing {
		height: 84upx;
		line-height: 84upx;
		border-radius: 44upx;
		font-size: 32upx;
	}

	.login-btn {
		padding: 10upx 20upx;
		margin-top: 650upx;
	}

	.login-function {
		margin-top: 10px;
		overflow: auto;
		padding: 20upx 20upx 30upx 20upx;
	}

	.login-forget {
		float: left;
		font-size: 26upx;
		color: #999;
	}

	.login-register {
		color: #666;
		float: right;
		font-size: 26upx;

	}

	.login-input input {
		background: #F2F5F6;
		font-size: 28upx;
		padding: 10upx 25upx;
		height: 62upx;
		line-height: 62upx;
		border-radius: 8upx;
	}

	.login-margin-b {
		margin-bottom: 25upx;
	}

	.login-input {
		padding: 10upx 20upx;
	}

	.login-head {
		font-size: 34upx;
		text-align: center;
		padding: 25upx 10upx 55upx 10upx;
	}

	.login-card {
		background: #fff;
		border-radius: 12upx;
		padding: 10upx 25upx;
		box-shadow: 0 6upx 18upx rgba(0, 0, 0, 0.12);
		position: relative;
		margin-top: 120upx;
	}

	.login-bg {
		height: 260upx;
		padding: 25upx;
		background: linear-gradient(#007a30, #39b54a);
	}
</style>
