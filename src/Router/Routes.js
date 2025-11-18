import { lazy } from "react";
import { Paths } from "./Paths";
import { kycAdminRoutes } from "./KYCAdminRoutes";

export const ADMIN = "ADMIN";
export const ROLES = { ADMIN };

export const privateRoutes = {
  ADMIN: [
    // Dashboard for Crm
    {
      path: Paths.Crm,
      ComponentIn: lazy(() => import("Components/Crm/CrmDashboard/CrmIndex"))
    },

    // Crm orders

    {
      path: Paths.crmOrders + "/:type?",
      ComponentIn: lazy(() => import("Components/Crm/Orders/OrderSearch"))
    },
    {
      path: Paths.crmOrderReturn + "/:type?",
      ComponentIn: lazy(() => import("Components/Crm/Orders/OrderSearch"))
    },

    // Crm orders view
    {
      path: Paths.crmOrderView + "/:id",
      ComponentIn: lazy(() => import("Components/Crm/Orders/CrmOrders"))
    },

    // Crm orders view
    {
      path: Paths.crmOrderReturnView + "/:id",
      ComponentIn: lazy(() => import("Components/Crm/Orders/CrmOrderReturns"))
    },

    {
      path: Paths.users,
      ComponentIn: lazy(() => import("Components/Admin/Dashboard/index"))
    },
    {
      path: Paths.manageRole,
      ComponentIn: lazy(() => import("Components/Admin/ManageRole/manageRole"))
    },
    {
      path: Paths.manageUser,
      ComponentIn: lazy(() => import("Components/Admin/ManageUser/manageUser"))
    },
    {
      path: Paths.bulkUploadPv,
      ComponentIn: lazy(() => import("Components/Admin/BulkUploadPv/BulkUploadPv"))
    },
    {
      path: Paths.updatePrice,
      ComponentIn: lazy(() => import("Components/Admin/UpdatePrice/UpdatePrice"))
    },
    {
      path: Paths.manageBatch,
      ComponentIn: lazy(() => import("Components/Admin/UdaanManager/manageBatch"))
    },
    {
      path: Paths.udaanReport,
      ComponentIn: lazy(
        () => import("Components/Admin/UdaanManager/RegistrationReport/ManageReport")
      )
    },
    {
      path: Paths.batchAdd,
      ComponentIn: lazy(() => import("Components/Admin/UdaanManager/AddEditBatch"))
    },
    {
      path: Paths.batchEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/UdaanManager/AddEditBatch"))
    },
    {
      path: Paths.categoryList,
      ComponentIn: lazy(() => import("Components/Admin/Category/CategoryList"))
    },
    {
      path: Paths.categoryAdd,
      ComponentIn: lazy(() => import("Components/Admin/Category/CategoryAdd"))
    },
    {
      path: Paths.categoryEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Category/CategoryEdit"))
    },
    {
      path: Paths.categoryEdit,
      ComponentIn: lazy(() => import("Components/Admin/Category/CategoryEdit"))
    },
    {
      path: Paths.addRole,
      ComponentIn: lazy(() => import("Components/Admin/ManageRole/AddEditManageRole"))
    },
    {
      path: Paths.editRole + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/ManageRole/AddEditManageRole"))
    },
    {
      path: Paths.tagsList,
      ComponentIn: lazy(() => import("Components/Admin/Tags/TagList"))
    },
    {
      path: Paths.addTag,
      ComponentIn: lazy(() => import("Components/Admin/Tags/AddTag"))
    },
    {
      path: Paths.editTag + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Tags/EditTag"))
    },
    {
      path: Paths.addUser,
      ComponentIn: lazy(() => import("Components/Admin/ManageUser/AddUser"))
    },
    {
      path: Paths.editUser + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/ManageUser/EditUser"))
    },
    {
      path: Paths.brandList,
      ComponentIn: lazy(() => import("Components/Admin/Brands/BrandsList"))
    },

    {
      path: Paths.brandTemplateList,
      ComponentIn: lazy(() => import("Components/Admin/Brand_Template/List"))
    },

    {
      path: Paths.brandTemplateAdd,
      ComponentIn: lazy(() => import("Components/Admin/Brand_Template/KeySoulTemplate"))
    },
    {
      path: Paths.brandTemplateEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Brand_Template/KeySoulTemplateEdit"))
    },

    {
      path: Paths.brandAdd,
      ComponentIn: lazy(() => import("Components/Admin/Brands/BrandsAdd"))
    },
    {
      path: Paths.brandEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Brands/BrandsEdit"))
    },
    {
      path: Paths.attributesList,
      ComponentIn: lazy(() => import("Components/Admin/Attributes/AttributesList"))
    },
    {
      path: Paths.attributesAdd,
      ComponentIn: lazy(() => import("Components/Admin/Attributes/AttributesAdd"))
    },
    {
      path: Paths.attributesEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Attributes/AttributesEdit"))
    },
    {
      path: Paths.variantsList,
      ComponentIn: lazy(() => import("Components/Admin/Variants/VariantsList"))
    },
    {
      path: Paths.variantsAdd,
      ComponentIn: lazy(() => import("Components/Admin/Variants/VariantsAdd"))
    },
    {
      path: Paths.variantsEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Variants/VariantsEdit"))
    },
    {
      path: Paths.productList,
      ComponentIn: lazy(() => import("Components/Admin/Products/ProductList"))
    },
    {
      path: Paths.productAdd,
      ComponentIn: lazy(() => import("Components/Admin/Products/ProductAdd"))
    },
    {
      path: Paths.productEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Products/ProductEdit"))
    },
    {
      path: Paths.walletList,
      ComponentIn: lazy(() => import("Components/Admin/Wallets/AllWallet/WalletsList"))
    },
    {
      path: Paths.walletAdd,
      ComponentIn: lazy(() => import("Components/Admin/Wallets/AllWallet/WalletsAddEdit"))
    },
    {
      path: Paths.walletEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Wallets/AllWallet/WalletsAddEdit"))
    },
    {
      path: Paths.mappedList,
      ComponentIn: lazy(() => import("Components/Admin/Wallets/MappedWallet/MappedList"))
    },
    {
      path: Paths.mappedAdd,
      ComponentIn: lazy(() => import("Components/Admin/Wallets/MappedWallet/MappedAdd"))
    },
    {
      path: Paths.mappedEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Wallets/MappedWallet/MappedEdit"))
    },
    {
      path: Paths.generateBusiness,
      ComponentIn: lazy(() => import("Components/Admin/Finance/GenerateBusiness"))
    },
    {
      path: Paths.couponList,
      ComponentIn: lazy(() => import("Components/Admin/Coupon/CouponList"))
    },
    {
      path: Paths.couponAdd,
      ComponentIn: lazy(() => import("Components/Admin/Coupon/CouponAdd"))
    },
    {
      path: Paths.couponEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Coupon/CouponEdit"))
    },

    {
      path: Paths.offersList,
      ComponentIn: lazy(() => import("Components/Admin/Offers/OffersList"))
    },
    {
      path: Paths.offersAdd,
      ComponentIn: lazy(() => import("Components/Admin/Offers/OffersAdd"))
    },
    {
      path: Paths.offersEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Offers/OffersAdd"))
    },
    {
      path: Paths.shippingSequencesList,
      ComponentIn: lazy(() => import("Components/Admin/CustomShippingOrder/CSO/CSOList"))
    },
    {
      path: Paths.shippingSequencesAdd,
      ComponentIn: lazy(() => import("Components/Admin/CustomShippingOrder/CSO/AddCSO"))
    },
    {
      path: Paths.shippingSequencesEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/CustomShippingOrder/CSO/EditCSO"))
    },

    {
      path: Paths.pincodeMappingList,
      ComponentIn: lazy(() => import("Components/Admin/PincodeMapping/PincodeMappingList"))
    },
    {
      path: Paths.pincodeMappingAdd,
      ComponentIn: lazy(() => import("Components/Admin/PincodeMapping/PincodeMappingAdd"))
    },
    {
      path: Paths.pincodeMappingEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/PincodeMapping/PincodeMappingEdit"))
    },

    {
      path: Paths.sequenceMapppingList,
      ComponentIn: lazy(() => import("Components/Admin/CustomShippingOrder/CSOMap/CSOMapList"))
    },
    {
      path: Paths.sequenceMapppingAdd,
      ComponentIn: lazy(() => import("Components/Admin/CustomShippingOrder/CSOMap/AddCSOMap"))
    },
    {
      path: Paths.sequenceMapppingEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/CustomShippingOrder/CSOMap/EditCSOMap"))
    },
    {
      path: Paths.shippingChargesList,
      ComponentIn: lazy(() => import("Components/Admin/ManageShippingCharges/ShippingChargesList"))
    },
    {
      path: Paths.shippingChargesAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageShippingCharges/AddEditShippingCharges")
      )
    },
    {
      path: Paths.downloadList,
      ComponentIn: lazy(() => import("Components/Admin/Download/DownloadContent/DownloadList"))
    },
    {
      path: Paths.downloadAdd,
      ComponentIn: lazy(() => import("Components/Admin/Download/DownloadContent/DownloadAddEdit"))
    },
    {
      path: Paths.downloadEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Download/DownloadContent/DownloadAddEdit"))
    },
    {
      path: Paths.shippingChargesEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/ManageShippingCharges/AddEditShippingCharges")
      )
    },
    {
      path: Paths.bannerList,
      ComponentIn: lazy(() => import("Components/Admin/Configurations/BannerManagement/BannerList"))
    },
    {
      path: Paths.bannerAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/Configurations/BannerManagement/AddEditBanner")
      )
    },
    {
      path: Paths.bannerEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/Configurations/BannerManagement/AddEditBanner")
      )
    },
    {
      path: Paths.settingsList,
      ComponentIn: lazy(() => import("Components/Admin/Configurations/Settings/SettingsList"))
    },

    {
      path: Paths.notificationCategoryAdd,
      ComponentIn: lazy(
        () =>
          import("Components/Admin/ManageNotification/NotificationCategory/AddNotificationCategory")
      )
    },
    {
      path: Paths.notificationCategoryEdit + "/:id",
      ComponentIn: lazy(
        () =>
          import(
            "Components/Admin/ManageNotification/NotificationCategory/EditNotificationCategory"
          )
      )
    },
    {
      path: Paths.notificationCategoryList,
      ComponentIn: lazy(
        () =>
          import(
            "Components/Admin/ManageNotification/NotificationCategory/NotificationCategoryList"
          )
      )
    },

    {
      path: Paths.notificationAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageNotification/Notification/AddNotification")
      )
    },
    {
      path: Paths.notificationEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/ManageNotification/Notification/EditNotification")
      )
    },
    {
      path: Paths.notificationList,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageNotification/Notification/NotificationList")
      )
    },
    {
      path: Paths.sendNotificationAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageNotification/SendNotification/AddSendNotification")
      )
    },
    {
      path: Paths.sendNotificationView + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/ManageNotification/SendNotification/ViewSendNotification")
      )
    },
    {
      path: Paths.abScheduledMessagesList,
      ComponentIn: lazy(
        () => import("Components/Admin/AbScheduledMessages/AbScheduledMessagesList")
      )
    },
    {
      path: Paths.abScheduledMessagesAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/AbScheduledMessages/AbScheduledMessagesAddEdit")
      )
    },
    {
      path: Paths.abScheduledMessagesEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/AbScheduledMessages/AbScheduledMessagesAddEdit")
      )
    },
    {
      path: Paths.sendNotificationList,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageNotification/SendNotification/SendNotificationList")
      )
    },
    {
      path: Paths.productSectionsList,
      ComponentIn: lazy(() => import("Components/Admin/ProductSections/ProdcutSectionsList"))
    },
    {
      path: Paths.productsSectionsAdd,
      ComponentIn: lazy(() => import("Components/Admin/ProductSections/AddEditProductsSection"))
    },
    {
      path: Paths.productsSectionsEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/ProductSections/AddEditProductsSection"))
    },
    {
      path: Paths.manageMenuList,
      ComponentIn: lazy(() => import("Components/Admin/MenuManagement/MenuMangementList"))
    },
    {
      path: Paths.manageMenuListAdd,
      ComponentIn: lazy(() => import("Components/Admin/MenuManagement/AddEditMegaMenu"))
    },
    {
      path: Paths.manageMenuListEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/MenuManagement/AddEditMegaMenu"))
    },

    // Profile Menu Management
    {
      path: Paths.manageProfileMenuList,
      ComponentIn: lazy(
        () => import("Components/Admin/ProfileMenuManagement/ProfileMenuManagementList")
      )
    },
    {
      path: Paths.manageProfileMenuListAdd,
      ComponentIn: lazy(() => import("Components/Admin/ProfileMenuManagement/AddEditProfileMenu"))
    },
    {
      path: Paths.manageProfileMenuListEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/ProfileMenuManagement/AddEditProfileMenu"))
    },

    {
      path: Paths.featuredCategory,
      ComponentIn: lazy(() => import("Components/Admin/FeaturedCategory/FeaturedCategory"))
    },
    {
      path: Paths.featuredCategoryDetails + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/FeaturedCategory/CategoryDetails"))
    },
    {
      path: Paths.mediaCategory,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageMedia/MediaCategories/MediaCategoryList")
      )
    },
    {
      path: Paths.mediaCategoryAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageMedia/MediaCategories/AddEditMediaCategory")
      )
    },
    {
      path: Paths.mediaCategoryEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/ManageMedia/MediaCategories/AddEditMediaCategory")
      )
    },
    {
      path: Paths.mediaContentList,
      ComponentIn: lazy(() => import("Components/Admin/ManageMedia/MediaContent/MediaContentList"))
    },
    {
      path: Paths.mediaContentAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageMedia/MediaContent/AddEditMediaContent")
      )
    },
    {
      path: Paths.mediaContentEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/ManageMedia/MediaContent/AddEditMediaContent")
      )
    },
    {
      path: Paths.abMessageList,
      ComponentIn: lazy(() => import("Components/Admin/ABMessages/ABMessageList"))
    },
    {
      path: Paths.abMessageListAdd,
      ComponentIn: lazy(() => import("Components/Admin/ABMessages/ABMessageAddEdit"))
    },
    {
      path: Paths.abMessageListEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/ABMessages/ABMessageAddEdit"))
    },
    {
      path: Paths.pincodeAreaMappingList,
      ComponentIn: lazy(() => import("Components/Admin/PincodeAreaMapping/PincodeAreaMappingList"))
    },
    {
      path: Paths.pincodeAreaMappingAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/PincodeAreaMapping/AddEditPincodeAreaMapping")
      )
    },
    {
      path: Paths.pincodeAreaMappingEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/PincodeAreaMapping/AddEditPincodeAreaMapping")
      )
    },

    {
      path: Paths.downloadCategoryList,
      ComponentIn: lazy(
        () => import("Components/Admin/Download/DownloadCategory/DownloadCategoryList")
      )
    },
    {
      path: Paths.downloadCategoryAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/Download/DownloadCategory/AddEditDownloadCategory")
      )
    },
    {
      path: Paths.downloadCategoryEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/Download/DownloadCategory/AddEditDownloadCategory")
      )
    },

    {
      path: Paths.downloadLanguageList,
      ComponentIn: lazy(
        () => import("Components/Admin/Download/DownloadLanguage/DownloadLanguageList")
      )
    },
    {
      path: Paths.downloadLanguageAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/Download/DownloadLanguage/AddEditDownloadLanguage")
      )
    },
    {
      path: Paths.downloadLanguageEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/Download/DownloadLanguage/AddEditDownloadLanguage")
      )
    },

    {
      path: Paths.contentTypeList,
      ComponentIn: lazy(() => import("Components/Admin/Download/ContentType/ContentTypeList"))
    },
    {
      path: Paths.contentTypeAdd,
      ComponentIn: lazy(() => import("Components/Admin/Download/ContentType/AddEditContentType"))
    },
    {
      path: Paths.contentTypeEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Download/ContentType/AddEditContentType"))
    },

    {
      path: Paths.voucherList,
      ComponentIn: lazy(() => import("Components/Admin/Vouchers/VoucherList"))
    },
    {
      path: Paths.voucherAdd,
      ComponentIn: lazy(() => import("Components/Admin/Vouchers/AddEditVoucher"))
    },
    {
      path: Paths.voucherEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Vouchers/AddEditVoucher"))
    },

    {
      path: Paths.eventsList,
      ComponentIn: lazy(() => import("Components/Admin/RCMEvents/EventsList"))
    },
    {
      path: Paths.ulpTarget,
      ComponentIn: lazy(() => import("Components/Admin/ULPTarget/ULPTarget"))
    },
    {
      path: Paths.eventsAdd,
      ComponentIn: lazy(() => import("Components/Admin/RCMEvents/AddEditEvents"))
    },
    {
      path: Paths.eventsEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/RCMEvents/AddEditEvents"))
    },

    {
      path: Paths.meetingsList,
      ComponentIn: lazy(() => import("Components/Admin/MeetingsSchedule/MeetingsScheduleList"))
    },
    {
      path: Paths.meetingsAdd,
      ComponentIn: lazy(() => import("Components/Admin/MeetingsSchedule/AddEditMeeting"))
    },
    {
      path: Paths.meetingsEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/MeetingsSchedule/AddEditMeeting"))
    },

    {
      path: Paths.marketingPlanLanguageList,
      ComponentIn: lazy(
        () =>
          import("Components/Admin/MarketingPlan/MarketingPlanLanguage/MarketingPlanLanguagesList")
      )
    },
    {
      path: Paths.marketingPlanLanguageAdd,
      ComponentIn: lazy(
        () =>
          import(
            "Components/Admin/MarketingPlan/MarketingPlanLanguage/AddEditMarketingPlanLanguage"
          )
      )
    },
    {
      path: Paths.marketingPlanLanguageEdit + "/:id",
      ComponentIn: lazy(
        () =>
          import(
            "Components/Admin/MarketingPlan/MarketingPlanLanguage/AddEditMarketingPlanLanguage"
          )
      )
    },

    {
      path: Paths.marketingPlanList,
      ComponentIn: lazy(
        () => import("Components/Admin/MarketingPlan/MarketingPlan/MarketingPlansList")
      )
    },
    {
      path: Paths.marketingPlanAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/MarketingPlan/MarketingPlan/AddEditMarketingPlan")
      )
    },
    {
      path: Paths.marketingPlanEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/MarketingPlan/MarketingPlan/AddEditMarketingPlan")
      )
    },

    {
      path: Paths.sizeChartList,
      ComponentIn: lazy(() => import("Components/Admin/SizeCharts/SizeChartsList"))
    },
    {
      path: Paths.ecomSettings,
      ComponentIn: lazy(() => import("Components/Admin/ecomSettings/ecomSettingsList"))
    },
    {
      path: Paths.sizeChartAdd,
      ComponentIn: lazy(() => import("Components/Admin/SizeCharts/AddEditSizeChart"))
    },
    {
      path: Paths.sizeChartEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/SizeCharts/AddEditSizeChart"))
    },
    {
      path: Paths.generalPagesList,
      ComponentIn: lazy(() => import("Components/Admin/GeneralPages/GeneralPageList"))
    },
    {
      path: Paths.ecomContactList,
      ComponentIn: lazy(() => import("Components/Admin/ecomSettings/ecomSettingsList"))
    },
    {
      path: Paths.generalPagesAdd,
      ComponentIn: lazy(() => import("Components/Admin/GeneralPages/AddEditGeneralPage"))
    },
    {
      path: Paths.generalPagesEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/GeneralPages/AddEditGeneralPage"))
    },

    {
      path: Paths.aboutUsHistoryList,
      ComponentIn: lazy(() => import("Components/Admin/AboutUsHistory/AboutUsHistoryList"))
    },
    {
      path: Paths.aboutUsHistoryAdd,
      ComponentIn: lazy(() => import("Components/Admin/AboutUsHistory/AddEditAboutUsHistory"))
    },
    {
      path: Paths.aboutUsHistoryEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/AboutUsHistory/AddEditAboutUsHistory"))
    },
    {
      path: Paths.noticesList,
      ComponentIn: lazy(() => import("Components/Admin/Notices/NoticesList"))
    },
    {
      path: Paths.noticeAdd,
      ComponentIn: lazy(() => import("Components/Admin/Notices/AddEdditNotice"))
    },
    {
      path: Paths.noticeEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Notices/AddEdditNotice"))
    },
    {
      path: Paths.complianceDocumentsList,
      ComponentIn: lazy(
        () => import("Components/Admin/ComplianceDocuments/ComplianceDocumentsList")
      )
    },
    {
      path: Paths.complianceDocumentsAdd,
      ComponentIn: lazy(
        () => import("Components/Admin/ComplianceDocuments/ComplianceDocumentsAddEdit")
      )
    },
    {
      path: Paths.complianceDocumentsEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/ComplianceDocuments/ComplianceDocumentsAddEdit")
      )
    },
    {
      path: Paths.faqsList,
      ComponentIn: lazy(() => import("Components/Admin/Faqs/FaqsList"))
    },
    {
      path: Paths.faqsAdd,
      ComponentIn: lazy(() => import("Components/Admin/Faqs/FaqsAddEdit"))
    },
    {
      path: Paths.faqsEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Faqs/FaqsAddEdit"))
    },

    //Manage banks
    {
      path: Paths.bankList,
      ComponentIn: lazy(() => import("Components/Admin/ManageBanks/BankList"))
    },
    {
      path: Paths.bankAdd,
      ComponentIn: lazy(() => import("Components/Admin/ManageBanks/BankAddEdit"))
    },
     {
      path: Paths.bankEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/ManageBanks/BankAddEdit"))
    },
    //Manage branches
    {
      path: Paths.branchList,
      ComponentIn: lazy(() => import("Components/Admin/ManageBranches/BranchList"))
    },
    {
      path: Paths.branchAdd,
      ComponentIn: lazy(() => import("Components/Admin/ManageBranches/BranchAddEdit"))
    },
     {
      path: Paths.branchEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/ManageBranches/BranchAddEdit"))
    },
    //employee
    {
      path: Paths.employeeList,
      ComponentIn: lazy(() => import("Components/Admin/Employee/EmployeeList"))
    },
    {
      path: Paths.employeeAdd,
      ComponentIn: lazy(() => import("Components/Admin/Employee/EmployeeAddEdit"))
    },
    {
      path: Paths.employeeEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Employee/EmployeeAddEdit"))
    },
    {
      path: Paths.executivesList,
      ComponentIn: lazy(() => import("Components/Admin/ManageExecutives/ExecutivesList"))
    },
    {
      path: Paths.executiveAdd,
      ComponentIn: lazy(() => import("Components/Admin/ManageExecutives/AddEditExecutives"))
    },
    {
      path: Paths.executiveEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/ManageExecutives/AddEditExecutives"))
    },
    ...kycAdminRoutes,
    {
      path: Paths.ecomUserPermissionList,
      ComponentIn: lazy(
        () => import("Components/Admin/ManageEcomUser/manageUserPermission/EcomUserPermissionList")
      )
    },
    {
      path: Paths.ecomUserPermissionEdit + "/:id",
      ComponentIn: lazy(
        () => import("Components/Admin/ManageEcomUser/manageUserPermission/EcomUserPermissionEdit")
      )
    },
    {
      path: Paths.Aparajita,
      ComponentIn: lazy(() => import("Components/Admin/Aparajita/AparajitaModule"))
    },

    // Depots Routes
    {
      path: Paths.depotList,
      ComponentIn: lazy(() => import("Components/Admin/Depots/DepotList"))
    },
    {
      path: Paths.depotAdd,
      ComponentIn: lazy(() => import("Components/Admin/Depots/DepotAdd"))
    },
    {
      path: Paths.depotEdit + "/:id",
      ComponentIn: lazy(() => import("Components/Admin/Depots/DepotEdit"))
    }
  ]
};

export const publicRoutes = [
  {
    path: Paths.nf,
    ComponentIn: lazy(() => import("Components/404/index"))
  },
  {
    path: Paths.base,
    ComponentIn: lazy(() => import("Components/Authentication/login"))
  },
  // {
  //   path: Paths.admin,
  //   ComponentIn: lazy(() => import("Components/Authentication/login"))
  // },
  {
    path: Paths.forgot + "/:type",
    ComponentIn: lazy(() => import("Components/Authentication/forgotPassword"))
  }
];
