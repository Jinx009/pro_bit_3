// pages/member/member.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  goMain: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  phoneCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.replyPhone,
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
})