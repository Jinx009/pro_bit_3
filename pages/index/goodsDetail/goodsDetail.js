var App = getApp();
Page({  
  data: {
    select: 1,//tab默认选中第一个
    detailSelect: 1,//商品详情tab默认选中第一个
    orderId: '',
    orderDetail:[],
    apiUrl: App.globalData.apiURL,
    baseInfo:{}
  },
  onLoad:function(option){
    if(option.orderId){
      this.setData({ orderId: option.orderId})
    }
  },
  onShow:function(){
    this.getOrderDetail()
  },
  goBack: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  getOrderDetail:function(){
    let url = `${this.data.apiUrl}/order/detail/${wx.getStorageSync('openId')}/${this.data.orderId}`
    wx.request({
      url: url,
      data: {},
      method: 'GET',
      success: (res) => {
        if (res.data.data) {
          let data = res.data.data
          let baseInfo = this.data.baseInfo
          baseInfo.orderId = data.orderId
          baseInfo.totalFee = data.totalFee
          baseInfo.receiver = data.receiver
          baseInfo.mobile = data.mobile
          baseInfo.address = data.address 
          this.setData({ orderDetail: data.detailVos, baseInfo: baseInfo })
        }
        console.log(res)
      },
      fail: function (res) {
        console.info('getOrderDetail Failed', res)
      }
    })
  }
})