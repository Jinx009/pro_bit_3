// pages/confirm/confirm.js
var App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    apiUrl: App.globalData.apiURL,
    orderDetails: [],
    total: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.orderId){
      this.setData({orderId:options.orderId})
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderDetail()
  },

  // 获取订单信息
  getOrderDetail: function () {
    wx.request({
      url: this.data.apiUrl + '/order/detail/' + wx.getStorageSync('openId') + '/' + this.data.orderId,
      data: {
      },
      method: 'GET',
      success: (res) => {
        if (res.data.status == 200) {
          this.setData({ orderDetails: res.data.data.detailVos })
          let orderDetails = this.data.orderDetails
          let total = this.data.total
          orderDetails.forEach((item, index) => {
            total += item.price * item.quantity
          })
          total = total.toFixed(2)
          this.setData({ total: total })
        }
      },
      fail: function (res) {
        console.info('getOrderDetail Failed', res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  goBack:function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})