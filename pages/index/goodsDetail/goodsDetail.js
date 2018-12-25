Page({
  data: {
    select: 1,//tab默认选中第一个
    detailSelect: 1,//商品详情tab默认选中第一个
  },
  goBack: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})