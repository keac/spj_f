<template>
		<view class="padding justify-center flex align-center ok-top">
			<view class="flex-sub text-center">
				<view class=" text-xsl padding">
					<text class=" cuIcon-roundcheckfill text-green"></text>
				</view>
				<view class=" text-xl padding">
					<text class="text-black text-bold">投票成功</text>
					<navigator target="miniProgram" open-type="exit">退出小程序</navigator> 
				</view>
			</view>
		</view>

</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style>
	.ok-top{
		padding: 50% 0;
	}
</style>
