var App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // select: 0,             
    accounts: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    // accountIndex: 0,
    // num: 1,
    // minusStatus: 'disable',
    goodsList: [],
    apiUrl: App.globalData.apiURL
  },
  onShow:function(){
    this.getGoods()
  },
  bindAccountChange: function(e) {
    console.log('value:', e.detail.value);
    console.log('index:', e.currentTarget.dataset.index);
    let index = e.currentTarget.dataset.index
    let value = e.detail.value
    let goodsList = this.data.goodsList
    goodsList[index].checked = this.data.accounts[value]
    this.setData({
      goodsList: goodsList
    })
  },
  bindMinus: function(e) {
    let num = e.currentTarget.dataset.value
    if (num > 1) {
      num--;
    }
    let index = e.currentTarget.dataset.index
    let minusStatus = num > 1 ? 'normal' : 'disable'
    let goodsList = this.data.goodsList
    goodsList[index].num = num
    goodsList[index].minusStatus = minusStatus
    this.setData({
      goodsList: goodsList
    })
  },
  /*点击加号*/
  bindPlus: function(e) {
    let num = e.currentTarget.dataset.value
    num ++
    let index = e.currentTarget.dataset.index
    let minusStatus = num > 1 ? 'normal' : 'disable'
    let goodsList = this.data.goodsList
    goodsList[index].num = num
    goodsList[index].minusStatus = minusStatus
    this.setData({
      goodsList: goodsList
    })
  },
  /*输入框事件*/
  bindManual: function(e) {
    let num = e.detail.value
    let index = e.currentTarget.dataset.index
    let minusStatus = num > 1 ? 'normal' : 'disable'
    let goodsList = this.data.goodsList
    goodsList[index].num = num
    goodsList[index].minusStatus = minusStatus
    this.setData({
      goodsList: goodsList
    })
  },
  goConfirm:function(){
    let goodsList = this.data.goodsList
    let orderDetails = []
    goodsList.forEach((item,index) => {
      let detail = {}
      detail.goodsId = item.id
      detail.quantity = item.num
      detail.size = item.checked
      orderDetails.push(detail)
    })
    wx.request({
      url: this.data.apiUrl + '/order/save/' + wx.getStorageSync('openId'),
      data: {
        orderDetails: orderDetails,
      },
      method: 'POST',
      success: (res) => {
        if (res.data.status==200) {
          wx.navigateTo({
            url: '/pages/confirm/confirm?orderId=' + res.data.data,
          })
        } else if(res.data.status == 500){
            wx.showToast({
              title: '请选择商品',
              icon: 'none',
              duration: 2000
            })
            return false
        }
        console.log(res)
      },
      fail: function (res) {
        console.info('save Failed', res)
      }
    })
  },
  getGoods: function () {
    wx.request({
      url: this.data.apiUrl + '/common/goods',
      data: {},
      method: 'GET',
      success: (res)=>{
        if (res.data.status==200){
          let goodsList = res.data.data
          goodsList.forEach((item,index) => {
            let accounts = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
            let accountIndex = 0
            item.accounts = accounts
            item.accountIndex = accountIndex
            item.checked = "XS"
            item.num = 0
            item.minusStatus = 'disable'
          })
          this.setData({ goodsList:res.data.data})
        }
        console.log(res)
      },
      fail: function (res) {
        console.info('getGoods Failed', res)
      }
    })
  }
})