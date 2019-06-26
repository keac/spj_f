<template>
	<view>

		<view class="cu-list menu-avatar comment solids-top">

			<view class="cu-item" v-for="(item,index) in teachList" :key="index">
				<image class="cu-avatar round" src="../../static/img/qq.png"></image>
				<view class="content">
					<view class="text-grey">{{item.info.teachName}}</view>
					<view class="text-gray text-content text-df">
						{{item.info.courseName}}
					</view>
					<view class="bg-grey padding-sm radius margin-top-sm  text-sm">
						<view class="flex">
							<view></view>
							<view class="flex-sub">{{item.info.say}}</view>
						</view>
					</view>
					<view class="margin-top-sm flex justify-between">
						<uni-rate value="0" max="4" @change="btn_start($event,index)"></uni-rate>
					</view>
					<radio-group class="block" @change="RadioChange($event,index)">
						<view class="cu-form-group" v-for="(sitem,indexs) in item.slist" :key="indexs">
							<view class="title">{{sitem}}</view>
							<radio class='radio green' :value="indexs"></radio>
						</view>
					</radio-group>
					<view class="cu-form-group solid-top" v-show="item.ps">
						<input placeholder="想说.." name="input" v-model="item.ssay"></input>
					</view>

				</view>
			</view>


				<view  v-if="teachList.length<=0" class="flex-sub text-center">
					<view class="solid-bottom text-xsl padding">
						<text class=" cuIcon-warn text-yellow"></text>
					</view>
					<view class="padding">未获取到数据，请下拉重试</view>
				</view>
		



		</view>
		<view v-if="teachList.length>0" class="login-btn flex flex-direction">
			<button class="cu-btn bg-green lg" @click="btn_sub">提交</button>
		</view>
	</view>
</template>

<script>
	import {
		uniCollapse,
		uniCollapseItem
	} from '@dcloudio/uni-ui'
	var graceChecker = require("../../common/graceChecker.js");
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				requestUrl: 'http://127.0.0.1:8080/api/',
				v_start: 2,
				teachList: [],
				plist: [
					[
						"很差",
						"一点上课效果都没有",
						"很差很差很差",
						"自定义",
					],
					[
						"还好",
						"有点效果",
						"不过还是不行",
						"自定义",
					],
					[
						"有点好",
						"有点效果",
						"不过还是不行",
						"自定义",
					],
					[
						"很好！",
						"有点效果",
						"不过还是不行",
						"自定义",
					]
				],
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
		onPullDownRefresh() {
			this.getData();
		},
		methods: {
			...mapMutations(['login']),
			...mapMutations(['setToken']),
			getData() {
				this.teachList = [];
				uni.request({
					url: this.requestUrl + 'getStInfo',
					dataType: 'json',
					method: 'POST',
					header: {
						'content-type': 'application/json', //自定义请求头信息
						'Authorization': this.token //自定义请求头信息
					},
					data: "",
					success: (res) => {
						//console.log('request success', res)
						let res_data = res.data;

						console.log();
						if (res_data.code == 1) {
							for (let i of res_data.data) {
								let tJson = {
									info: {},
									slist: [],
									ps: false,
									ssay:"",
									data: {
										start: -1,
										radio: -1,
										reason: "",
									}

								};
								tJson.info = i;
								tJson.data.courseId = i.courseId;
								tJson.data.teachId = i.teachId;
								tJson.data.stuId = i.stuId;
								console.log(tJson);
								this.teachList.push(tJson);
							}

						} else {
							uni.showModal({
								content: res_data.msg,
								showCancel: false
							});
						}

					},
					fail: (err) => {
						console.log('request fail', err);
						uni.showModal({
							content: "无法连接到服务器"+err.errMsg,
							showCancel: false
						});
					},
					complete: () => {
						this.loading = false;
					}
				});
				uni.stopPullDownRefresh();
			},
			RadioChange(e, index) {
				let teachS = this.teachList[index];
				teachS.data.radio = e.detail.value;
				teachS.ps = teachS.slist.length == (parseInt(teachS.data.radio) + 1) ? true : false;
			},
			textareaAInput(e) {
				this.textareaAValue = e.detail.value
			},
			btn_sub() {
				let checkRes = true;
				let startC = Array(5).fill(0);
				let msg = "";
				for (let i of this.teachList) {
					let data = i.data;
					
					if (data.start == -1 || data.radio == -1) {
						checkRes = false;
						msg = "请选择所有选项";
						break;
					}
					if (i.ps == true && i.ssay == "") {
						checkRes = false;
						msg = "请输入自定义内容";
						break;
					}
					data.reason=i.ps?i.ssay:this.plist[Number(data.start)-1][Number(data.radio)];
					startC[data.start]++;

				}
				let techLe = this.teachList.length / 2;
				for (let i of startC) {
					if (i > techLe && techLe > 1) {
						checkRes = false;
						msg = "星数量不能选择超过50%";
					}
				}
				if (checkRes) {
					let sendData = [];
					for (let t of this.teachList) {
						sendData.push(t.data);
					}

					console.log("开始提交")
					uni.request({
						url: this.requestUrl + 'sub',
						dataType: 'json',
						method: 'POST',
						header: {
							'content-type': 'application/json', //自定义请求头信息
							'Authorization': this.token //自定义请求头信息
						},
						data: sendData,
						success: (res) => {
							//console.log('request success', res)
							let res_data = res.data;
							console.log();
							if (res_data.code == 1) {
								uni.showToast({
									title: '提交成功',
									icon: 'success',
									mask: true,
								});
								uni.redirectTo({
									url: '../../pages/ok/ok'
								})
							} else {
								uni.showToast({
									title: '错误',
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
							this.loading = false;
						}
					});


				} else {
					uni.showToast({
						title: msg,
						icon: 'none',
						mask: true,
					});
				}

			},
			btn_start(e, index) {
				let teachS = this.teachList[index];
				teachS.slist = this.plist[e.value - 1];
				teachS.data.start = e.value;
				teachS.ps = teachS.slist.length == (parseInt(teachS.data.radio) + 1) ? true : false;
			}

		},
	}
</script>

<style>
	.login-btn {
		padding: 10upx 20upx;
	}

	.login-input input {
		background: #F2F5F6;
		font-size: 28upx;
		padding: 10upx 25upx;
		height: 62upx;
		line-height: 62upx;
		border-radius: 8upx;
	}

	uni-switch.red[checked] .wx-switch-input.wx-switch-input-checked,
	uni-checkbox.red[checked] .wx-checkbox-input,
	uni-radio.red[checked] .wx-radio-input,
	uni-switch.red.checked .uni-switch-input.uni-switch-input-checked,
	uni-checkbox.red.checked .uni-checkbox-input,
	uni-radio.red.checked .uni-radio-input {
		background-color: #e54d42 !important;
		border-color: #e54d42 !important;
		color: #ffffff !important;
	}

	uni-radio.red {
		color: #007A30 !important;
	}
</style>
