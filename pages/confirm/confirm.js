var App = getApp();
const utils = require('../../utils/util.js')
var CryptoJS = require('../../utils/md5.js')
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
      attach: '',//用户自定义数据，在notify的时候会原样返回
      body: '',//订单标题
      mchid: '1525243181',//商户号
      msg: '',
      nonce: '',//随机字符串
      notify_url: '',//异步通知地址
      out_trade_no: '',//用户端自主生成的订单号
      payjsOrderId: '',
      resultCode: '',
      sign: null,//数据签名 详见签名算法
      total_fee: 0//金额
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
          let sign = ''
          if(this.data.payParams.attach){
            sign = `attach=${this.data.payParams.attach}&`
          }
          if (this.data.payParams.body){
            sign += `body=${this.data.payParams.body}&`
          }
          if (this.data.payParams.mchid) {
            sign += `mchid=${this.data.payParams.mchid}&`
          }
          if (this.data.payParams.msg) {
            sign += `msg=${this.data.payParams.msg}&`
          }
          if (this.data.payParams.nonce) {
            sign = `nonce=${this.data.payParams.nonce}&`
          }
          if (this.data.payParams.notify_url) {
            sign += `notify_url=${this.data.payParams.notify_url}&`
          }
          if (this.data.payParams.out_trade_no) {
            sign += `out_trade_no=${this.data.payParams.out_trade_no}&`
          }
          if (this.data.payParams.payjsOrderId) {
            sign += `payjsOrderId=${this.data.payParams.payjsOrderId}&`
          }
          if (this.data.payParams.resultCode) {
            sign += `resultCode=${this.data.payParams.resultCode}&`
          }
          if (this.data.payParams.total_fee) {
            sign += `total_fee=${this.data.payParams.total_fee}&`
          }
          sign += '&key=q2lfaue0Jno6lNsv'
          let extraData = this.data.payParams
          extraData.sign = this.encryption(extraData)
          this.setData({ payParams: extraData})
          // payjs
          wx.navigateToMiniProgram({
            appId: 'wx959c8c1fb2d877b5',
            // path: '/pages/confirm/confirm',
            path: 'pages/pay',
            extraData: extraData,
            // envVersion: 'trial', //体验版
            success: r => {
              console.log('支付成功=>')
              console.log(r)
              console.log('支付success。。')
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
            },
            fail: function (e) {
              console.log('支付失败=>')
              console.error(e)
              wx.showModal({
                title: '支付失败',
                content: e.errMsg
              })
            },
            complete: (e) => {
              console.log("complete=>")
              console.log(e)
            }
          })
        }
      },
      fail: function (res) {
        console.info('paid Failed', res)
      }
    })
  },
  encryption: function (data) {
    // let strs = [];
    // for (let i in data) {
    //   strs.push(i + '=' + data[i]);
    // }
    // strs.sort();  // 数组排序
    // strs = strs.join('&'); // 数组变字符串
    var md5Str = CryptoJS.MD5(data).toString(CryptoJS.enc.Hex).toUpperCase();
    console.log("md5后得到的字符串：%s", md5Str)
    return md5Str;
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