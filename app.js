//app.js
App({
  globalData: {
    userInfo: null,
    code: '',
    apiURL: 'https://www.abuqool.store',
    resultCode: 'WAITING',
    msg: '等待支付',
    payjsOrderId: '',
    schoolCode: ''
  },
  onLaunch: function () {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    if (!wx.getStorageSync('openId')){
      this.getOpenId()
    }
  },
  onShow:function(options){
    console.log('scene='+options.scene)
    if (options.query.school_code){
      this.globalData.schoolCode = options.query.school_code
    }
    if (options.scene === 1038) { // 来源于小程序跳转
      // 还应判断来源小程序 appid、请求路径
      let referrerInfo = options.referrerInfo
      let extraData = referrerInfo.extraData
      this.globalData.resultCode = extraData.resultCode
      this.globalData.msg = extraData.msg
      this.globalData.payjsOrderId = extraData.payjsOrderId
    }
  },
  getOpenId:function(){
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.code = res.code
        console.log('code=' + this.globalData.code)
        // 获取openid
        wx.request({
          url: this.globalData.apiURL + '/common/openId/' + this.globalData.code,
          data: {},
          method: 'GET',
          success: (res) => {
            if (res.data.status == 200) {
              wx.setStorageSync('openId', res.data.data)
            }
            console.log(res)
          },
          fail: function (res) {
            console.info('getOpenId Failed', res);
          }
        })
      }
    })
  }
})