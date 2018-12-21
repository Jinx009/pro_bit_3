// pages/member/member.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  goMain:function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})