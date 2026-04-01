const { fetchOrders, isCloudReady } = require("../../services/orderService");

function formatDate(value) {
  if (!value) return "刚刚";
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

Page({
  data: {
    cloudReady: false,
    isLoading: false,
    orders: []
  },

  onShow() {
    this.setData({
      cloudReady: isCloudReady()
    });
    if (isCloudReady()) {
      this.loadOrders();
    }
  },

  async loadOrders() {
    this.setData({ isLoading: true });
    try {
      const result = await fetchOrders();
      const orders = (result.data || []).map((item) => ({
        ...item,
        createdAtText: formatDate(item.createdAt)
      }));
      this.setData({
        orders,
        isLoading: false
      });
    } catch (error) {
      this.setData({ isLoading: false });
      wx.showToast({
        title: error.message || "订单加载失败",
        icon: "none"
      });
    }
  }
});
