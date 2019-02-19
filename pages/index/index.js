//index.js
var App = getApp()
var CryptoJS = require('../../utils/md5.js')
Page({
  data: {
    apiUrl: App.globalData.apiURL,
    orderList: []
  },
  onLoad:function(){
  },
  onShow: function () {
    if (wx.getStorageSync('openId')){
      this.getOrderList()
    }
  },
  
  goDetail: function (e) {
    let index = e.currentTarget.dataset.index
    let status = e.currentTarget.dataset.status
    let orderId = this.data.orderList[index].orderId
    if(status==3){
      wx.navigateTo({
        url: '/pages/index/goodsDetail/goodsDetail?orderId=' + orderId
      })
    } else {
      wx.navigateTo({
        url: '/pages/confirm/confirm?orderId=' + orderId
      })
    }
    
  },
  goBuy:function () {
    wx.switchTab({
      url: '/pages/category/category',
    })
  },
  getOrderList:function(){
    wx.request({
      url: this.data.apiUrl + '/order/list/' + wx.getStorageSync('openId') +'?schoolCode='+App.globalData.schoolCode,
      data: {},
      method: 'GET',
      success: (res) => {
        if (res.data.data) {
          let orderList = res.data.data
          this.setData({ orderList: res.data.data })
        }
      },
      fail: function (res) {
        console.info('getOrderList Failed', res)
      }
    })
  }
})