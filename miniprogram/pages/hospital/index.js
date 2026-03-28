const { hospitals } = require("../../data/hospitals");
const { processLibrary } = require("../../data/processes");

function formatHospitalDetail(hospital, activeHospitalId) {
  return {
    ...hospital,
    coreDepartmentText: hospital.coreDepartments.join("、"),
    active: hospital.id === activeHospitalId
  };
}

function buildTaskTabs(activeTask) {
  return Object.keys(processLibrary).map((key) => ({
    key,
    label: processLibrary[key].label,
    active: key === activeTask
  }));
}

function buildSteps(activeTask) {
  return processLibrary[activeTask].steps.map((step, index) => ({
    ...step,
    orderText: `第${index + 1}步`
  }));
}

Page({
  data: {
    searchKeyword: "",
    isLoading: false,
    activeHospitalId: hospitals[0].id,
    hospitals: hospitals.map((hospital) => formatHospitalDetail(hospital, hospitals[0].id)),
    filteredHospitals: hospitals.map((hospital) => formatHospitalDetail(hospital, hospitals[0].id)),
    activeTask: "registration",
    taskTabs: buildTaskTabs("registration"),
    activeTaskLabel: processLibrary.registration.label,
    activeTaskDescription: processLibrary.registration.description,
    steps: buildSteps("registration"),
    activeHospital: formatHospitalDetail(hospitals[0], hospitals[0].id),
    activeHospitalSourceText: `${hospitals[0].name} 已配置详细流程模板。`
  },

  onLoad() {
    const stored = wx.getStorageSync("hospitalActiveTask");
    if (stored) {
      if (processLibrary[stored]) {
        this.setData({ activeTask: stored });
      } else if (hospitals.find((hospital) => hospital.id === stored)) {
        this.setData({ activeHospitalId: stored });
      }
      wx.removeStorageSync("hospitalActiveTask");
    }
    this.refreshPageState();
  },

  onShow() {
    const stored = wx.getStorageSync("hospitalActiveTask");
    if (stored) {
      if (processLibrary[stored]) {
        this.setData({ activeTask: stored });
      } else if (hospitals.find((hospital) => hospital.id === stored)) {
        this.setData({ activeHospitalId: stored });
      }
      wx.removeStorageSync("hospitalActiveTask");
      this.refreshPageState();
    }
  },

  onSearchInput(event) {
    this.setData({
      searchKeyword: event.detail.value.trim().toLowerCase()
    });
    this.applySearch();
  },

  clearSearch() {
    this.setData({
      searchKeyword: ""
    });
    this.applySearch();
  },

  applySearch() {
    const { searchKeyword, activeHospitalId } = this.data;
    const formattedHospitals = hospitals.map((hospital) => formatHospitalDetail(hospital, activeHospitalId));
    const filteredHospitals = searchKeyword
      ? formattedHospitals.filter((hospital) =>
          [hospital.name, hospital.district, hospital.address, hospital.coreDepartmentText]
            .join(" ")
            .toLowerCase()
            .includes(searchKeyword),
        )
      : formattedHospitals;

    const nextList = filteredHospitals.length ? filteredHospitals : formattedHospitals;
    const hasCurrent = nextList.some((hospital) => hospital.id === activeHospitalId);
    const nextActiveHospitalId = hasCurrent ? activeHospitalId : nextList[0].id;

    this.setData({
      hospitals: formattedHospitals.map((hospital) => ({
        ...hospital,
        active: hospital.id === nextActiveHospitalId
      })),
      filteredHospitals: nextList.map((hospital) => ({
        ...hospital,
        active: hospital.id === nextActiveHospitalId
      })),
      activeHospitalId: nextActiveHospitalId
    });

    this.refreshPageState();
  },

  selectHospital(event) {
    this.setData({
      activeHospitalId: event.currentTarget.dataset.id
    });
    this.applySearch();
  },

  selectTask(event) {
    this.setData({
      activeTask: event.currentTarget.dataset.task
    });
    this.refreshPageState();
  },

  refreshPageState() {
    const activeHospital =
      this.data.hospitals.find((hospital) => hospital.id === this.data.activeHospitalId) ||
      formatHospitalDetail(hospitals[0], this.data.activeHospitalId);
    const activeTaskConfig = processLibrary[this.data.activeTask];

    this.setData({
      taskTabs: buildTaskTabs(this.data.activeTask),
      activeTaskLabel: activeTaskConfig.label,
      activeTaskDescription: activeTaskConfig.description,
      steps: buildSteps(this.data.activeTask),
      activeHospital,
      activeHospitalSourceText: activeHospital.detailed
        ? `${activeHospital.name} 已配置详细流程模板。`
        : `${activeHospital.name} 当前展示通用流程模板。`
    });
  },

  goOrderPage() {
    wx.switchTab({
      url: "/pages/order/index"
    });
  }
});
