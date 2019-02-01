var App = getApp();
const utils = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    receiver: '',
    mobile: '',
    address: '',
    orderDetails: [],
    // orderId: '',
    payParams:{
      mchid: '1525243181',//商户号
      total_fee: 0,//金额
      out_trade_no: '',//用户端自主生成的订单号
      body: '',//订单标题
      attach: '',//用户自定义数据，在notify的时候会原样返回
      notify_url: '',//异步通知地址
      nonce: '',//随机字符串
      // sign: '',//数据签名 详见签名算法
      resultCode: '',
      msg: '',
      payjsOrderId: ''
    },
    apiUrl: App.globalData.apiURL,
    jump: false,
    paying: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.orderId){
      let payParams = this.data.payParams
      payParams.out_trade_no = options.orderId
      this.setData({ payParams: payParams})
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    console.log(options)
    // 从跳转后状态取值
    var timeStamp = new Date().valueOf()
    let payParams = this.data.payParams
    payParams.resultCode = App.globalData.resultCode,
    payParams.msg = App.globalData.msg,
    payParams.payjsOrderId = App.globalData.payjsOrderId,
    payParams.nonce = utils.generateRandom(100000, 999999)
    this.setData({
      payParams: payParams
    })
    this.getOrderDetail()
  },
  // 获取订单信息
  getOrderDetail: function () {
    wx.request({
      url: this.data.apiUrl + '/order/detail/' + wx.getStorageSync('openId') + '/' + this.data.payParams.out_trade_no,
      data: {
      },
      method: 'GET',
      success: (res) => {
        if (res.data.status == 200) {
          this.setData({ orderDetails: res.data.data.detailVos })
          let orderDetails = this.data.orderDetails
          let total = 0
          let payParams = this.data.payParams
          orderDetails.forEach((item, index) => {
            total += item.price * item.quantity
          })
          payParams.total_fee = total.toFixed(2)
          this.setData({ payParams: payParams })
        }
      },
      fail: function (res) {
        console.info('getOrderDetail Failed', res)
      }
    })
  },
  goSuccess:function(e){
    console.log('success=>')
    console.log(e)
  },
  goFail:function(e){
    console.log('fail=>')
    console.log(e)
  },
  goComplete: function (e) {
    console.log('complete=>')
    console.log(e)
    wx.request({
      url: this.data.apiUrl + '/order/paid/' + wx.getStorageSync('openId'),
      data: {
        orderId:this.data.payParams.out_trade_no,
        payOrderId: this.data.payjsOrderId
      },
      method: 'POST',
      success: (res) => {
        if (res.data.status == 200) {
          wx.navigateTo({
            url: '/pages/success/success?orderId=' + this.data.payParams.out_trade_no,
          })
        }
      },
      fail: function (res) {
        console.info('getOrderDetail Failed', res)
      }
    })
  },
  // 去支付
  gotoPay:function(){
    let receiver = this.data.receiver
    let mobile = this.data.mobile
    let address = this.data.address
    if(!receiver){
      wx.showToast({
        title: '请输入联系人',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    if(!mobile){
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    if (!address) {
      wx.showToast({
        title: '请输入收货地址',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    // 保存订单信息
    wx.request({
      url: this.data.apiUrl + '/order/address/' + wx.getStorageSync('openId') + '/' + this.data.payParams.out_trade_no,
      data: {
        receiver: this.data.receiver,
        mobile: this.data.mobile,
        address: this.data.address
      },
      method: 'POST',
      success: (res) => {
        if (res.data.status == 200) {
          let extraData = this.data.payParams
          // payjs
          wx.navigateToMiniProgram({
            appId: 'wx959c8c1fb2d877b5',
            path: '/pages/confirm/confirm',
            extraData: extraData,
            envVersion: 'trial', //体验版
            success: r => {
              console.log(r)
              console.log('等待返回')
            },
            fail: function (e) {
              console.error(e)
              wx.showModal({
                title: '支付失败',
                content: e.errMsg
              })
            },
            complete: (e) => {
              console.log("complete=>")
              console.log(e)
              // 确认订单--将payorderId传给后端
              wx.request({
                url: this.data.apiUrl + '/order/paid/' + wx.getStorageSync('openId'),
                data: {
                  orderId: this.data.payParams.out_trade_no,
                  payOrderId: this.data.payjsOrderId
                },
                method: 'POST',
                success: (res) => {
                  if (res.data.status == 200) {
                    wx.navigateTo({
                      url: '/pages/success/success',
                    })
                  }
                },
                fail: function (res) {
                  console.info('paid Failed', res)
                }
              })
            }
          })
        }
      },
      fail: function (res) {
        console.info('paid Failed', res)
      }
    })
  },
  
  // 获取联系人
  bindReceiver:function(e){
    this.setData({
      receiver: e.detail.value
    })
  },
  // 获取联系电话
  bindMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  // 获取收货地址
  bindAddress: function (e) {
    this.setData({
      address: e.detail.value
    })
  }
})