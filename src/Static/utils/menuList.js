import { KycAdminPaths } from "Router/KYCAdminPaths";
import { Paths } from "Router/Paths";

export const MenuList = [
  // {
  //   title: "Dashboard",
  //   module_slug: "dashboard",
  //   path: Paths.users,
  //   icon: "dashboard"
  // },
  {
    title: "Categories",
    module_slug: "manage_category",
    path: Paths.categoryList,
    icon: "category"
  },
  {
    title: "CRM",
    module_slug: ["crm_orders"],
    icon: "CRM",
    subMenu: [
      {
        title: "Orders",
        module_slug: "crm_orders",
        path: Paths.crmOrders
      },
      {
        title: "Order Returns",
        module_slug: "crm_orders",
        path: Paths.crmOrderReturnSearch
      }
    ]
  },
  {
    title: "Brand Management",
    module_slug: ["brands", "brand_template"],
    icon: "Brands",
    subMenu: [
      {
        title: "Brands",
        module_slug: "brands",
        path: Paths.brandList
      },
      {
        title: "Brand Templates",
        module_slug: "brand_template",
        path: Paths.brandTemplateList
      }
    ]
  },

  {
    title: "Tags",
    module_slug: "manage_tags",
    path: Paths.tagsList,
    icon: "tags"
  },
  {
    title: "Bank Management",
    module_slug: ["manage_bank", "manage_bank_branches"],
    icon: "Banks",
    subMenu: [
      {
        title: "Manage Banks",
        module_slug: "manage_bank",
        path: Paths.bankList
      },
      {
        title: "Manage Branches",
        module_slug: "manage_bank_branches",
        path: Paths.branchList
      }
    ]
  },
  {
    title: "Employee",
    module_slug: "manage_employee",
    path: Paths.employeeList,
    icon: "employees"
  },
  {
    title: "Attributes",
    module_slug: "attributes_list",
    path: Paths.attributesList,
    icon: "attributes"
  },
  {
    title: "Attribute Values",
    module_slug: "variants_list",
    path: Paths.variantsList,
    icon: "variants"
  },
  {
    title: "Depot Manager",
    module_slug: ["manage_depots"],
    icon: "configurations",
    subMenu: [
      {
        title: "Manage Depots",
        path: Paths.depotList,
        module_slug: "manage_depots"
      }
    ]
  },
  {
    title: "Product Manager",
    module_slug: "product_list",
    path: Paths.productList,
    icon: "products",
    subMenu: [
      {
        title: "Products",
        module_slug: "product_list",
        path: Paths.productList
      },

      // {
      //   title: "Bulk Update PV",
      //   path: Paths.bulkUploadPv,
      //   module_slug: "manage_utility"
      // },

      {
        title: "Update Price",
        path: Paths.updatePrice,
        module_slug: "update_price"
      }
    ]
  },
  {
    title: "User Management",
    module_slug: ["manage_user", "manage_role", "manage_executive"],
    icon: "user",
    subMenu: [
      {
        title: "Manage Users",
        path: Paths.manageUser,
        module_slug: "manage_user"
      },
      {
        title: "Manage Roles",
        path: Paths.manageRole,
        module_slug: "manage_role"
      },
      {
        title: "Manage Executives",
        path: Paths.executivesList,
        module_slug: "manage_executive"
      }
    ]
  },
  {
    title: "Manage Ecom User",
    module_slug: ["ecom_user_permission"],
    icon: "user",
    subMenu: [
      {
        title: "Block/Unblock User",
        path: Paths.ecomUserPermissionList,
        module_slug: "ecom_user_permission"
      }
    ]
  },
  {
    title: "Udaan Manager",
    module_slug: ["manage_batch"],
    subMenu: [
      {
        title: "Manage Batches",
        path: Paths.manageBatch,
        module_slug: "manage_batch"
      },
      {
        title: "Registration Report",
        path: Paths.udaanReport,
        module_slug: "manage_udaan_report"
      }
    ]
  },
  {
    title: "Wallet",
    module_slug: ["wallet_list", "mapped_list"],
    icon: "wallet",
    subMenu: [
      {
        title: "All Wallets",
        path: Paths.walletList,
        module_slug: "wallet_list"
      },
      {
        title: "Wallets Mapping",
        path: Paths.mappedList,
        module_slug: "mapped_list"
      }
    ]
  },
  {
    title: "Offers & Vouchers",
    module_slug: ["offer_list", "vouchers"],
    icon: "Offer&Coupon",
    subMenu: [
      // {
      //   title: "Coupons",
      //   path: Paths.couponList,
      //   module_slug: "coupon_list"
      // },
      {
        title: "Offers",
        path: Paths.offersList,
        module_slug: "offer_list"
      },
      {
        title: "Vouchers",
        path: Paths.voucherList,
        module_slug: "vouchers"
      }
    ]
  },
  {
    title: "Custom Shipping",
    module_slug: ["shipping_sequences", "sequence_mapping"],
    icon: "cso",
    subMenu: [
      {
        title: "Shipping Sequences",
        path: Paths.shippingSequencesList,
        module_slug: "shipping_sequences"
      },
      {
        title: "Sequence Mapping",
        path: Paths.sequenceMapppingList,
        module_slug: "sequence_mapping"
      }
    ]
  },
  // {
  //   title: "Pincode Store Map",
  //   module_slug: "pincode_store_map",
  //   path: Paths.pincodeMappingList,
  //   icon: "pincodeStore"
  // },

  {
    title: "Report",
    module_slug: ["manage_aparjita"],
    icon: "",
    subMenu: [
      {
        title: "Aparajita",
        path: Paths.Aparajita,
        module_slug: "manage_aparjita"
      }
    ]
  },
  {
    title: "Store Map",
    module_slug: ["pincode_store_map", "pincode_area_map"],
    icon: "pincodeStore",
    subMenu: [
      {
        title: "Pincode Area Map",
        path: Paths.pincodeAreaMappingList,
        module_slug: "pincode_area_map"
      },
      {
        title: "Pincode Store Map",
        module_slug: "pincode_store_map",
        path: Paths.pincodeMappingList,
        icon: "pincodeStore"
      }
    ]
  },
  {
    title: "Shipping Charges",
    module_slug: "shipping_charges",
    path: Paths.shippingChargesList,
    icon: "shippingPrice"
  },

  {
    title: "Configurations",
    module_slug: ["setting"],
    icon: "configurations",
    subMenu: [
      {
        title: "Settings",
        path: Paths.settingsList,
        module_slug: "setting"
      }
    ]
  },
  {
    title: "Notification Management",
    module_slug: ["shipping_sequences", "sequence_mapping"],
    icon: "manageNotification",
    subMenu: [
      {
        title: "Notification Category",
        path: Paths.notificationCategoryList,
        module_slug: "shipping_sequences"
      },
      {
        title: "Notifications",
        path: Paths.notificationList,
        module_slug: "sequence_mapping"
      },
      {
        title: "Send Notification",
        path: Paths.sendNotificationList,
        module_slug: "sequence_mapping"
      },
      {
        title: "AB Scheduled Messages",
        path: Paths.abScheduledMessagesList,
        module_slug: "sequence_mapping"
      }
    ]
  },
  {
    title: "Website",
    module_slug: [
      "featured_category",
      "menu_management",
      "ecom_profile_modules_management",
      "ab_message",
      "product_sections",
      "downloads",
      "media_category",
      "media_content",
      "banner_list"
    ],
    icon: "website",
    subMenu: [
      {
        title: "Manage Media",
        module_slug: ["media_category", "media_content"],
        icon: "manageMedia",
        subMenu: [
          {
            title: "Media Categories",
            path: Paths.mediaCategory,
            module_slug: "media_category"
          },
          {
            title: "Media Content",
            path: Paths.mediaContentList,
            module_slug: "media_content"
          }
        ]
      },
      {
        title: "Downloads",
        module_slug: ["downloads", "download_category", "content_type", "download_language"],
        icon: "manageMedia",
        subMenu: [
          {
            title: "Download Category",
            path: Paths.downloadCategoryList,
            module_slug: "download_category"
          },
          {
            title: "Download Language",
            path: Paths.downloadLanguageList,
            module_slug: "download_language"
          },
          {
            title: "Content Type",
            path: Paths.contentTypeList,
            module_slug: "content_type"
          },
          {
            title: "Download Content",
            module_slug: "downloads",
            path: Paths.downloadList
          }
        ]
      },
      {
        title: "Static Pages",
        module_slug: [
          "rcm_events",
          "meetings_schedule",
          "general_page",
          "about_us_history",
          "notice"
        ],
        icon: "manageMedia",
        subMenu: [
          // {
          //   title: "Meetings Schedule",
          //   path: Paths.meetingsList,
          //   module_slug: "meetings_schedule"
          // },
          {
            title: "General Pages",
            path: Paths.generalPagesList,
            module_slug: "general_page"
          },
          {
            title: "About Us - History",
            path: Paths.aboutUsHistoryList,
            module_slug: "about_us_history"
          },
          {
            title: "Contact Us",
            module_slug: "ecom_contact_us",
            path: Paths.ecomContactList,
            icon: "contact_us"
          }
        ]
      },
      {
        title: "ULP Manager",
        module_slug: ["rcm_events"],
        icon: "manageMedia",
        subMenu: [
          // {
          //   title: "Meetings Schedule",
          //   path: Paths.meetingsList,
          //   module_slug: "meetings_schedule"
          // },
          {
            title: "RCM Events",
            path: Paths.eventsList,
            module_slug: "rcm_events"
          },
          {
            title: "ULP Target",
            path: Paths.ulpTarget,
            module_slug: "rcm_events"
          }
        ]
      },
      {
        title: "Language",
        path: Paths.marketingPlanLanguageList,
        module_slug: "marketing_plan_language"
      },
      // {
      //   title: "Marketing Plan",
      //   path: Paths.marketingPlanList,
      //   module_slug: "marketing_plan"
      // },
      {
        title: "Banner Management",
        path: Paths.bannerList,
        module_slug: "banner_list"
      },
      {
        title: "Products Section",
        module_slug: "product_sections",
        path: Paths.productSectionsList,
        icon: "productsSection"
      },
      {
        title: "Featured Category",
        module_slug: "featured_category",
        path: Paths.featuredCategory,
        icon: "featuredCategory"
      },
      {
        title: "Header Menu Management",
        module_slug: "menu_management",
        path: Paths.manageMenuList,
        icon: "menuManagement"
      },
      {
        title: "Profile Menu Management",
        module_slug: "ecom_profile_modules_management",
        path: Paths.manageProfileMenuList,
        icon: "menuManagement"
      },
      {
        title: "AB Message",
        module_slug: "ab_message",
        path: Paths.abMessageList,
        icon: "abMessage"
      },
      {
        title: "Compliance Documents",
        module_slug: "compliance_documents",
        path: Paths.complianceDocumentsList,
        icon: "abMessage"
      },
      {
        title: "Faqs",
        module_slug: "faqs",
        path: Paths.faqsList,
        icon: "faqs"
      },
      {
        title: "Size Chart",
        module_slug: "size_chart",
        path: Paths.sizeChartList,
        icon: "abMessage"
      },

      {
        title: "Ecom Notifications",
        path: Paths.noticesList,
        module_slug: "notice"
      }

      // {
      //   title: "Downloads",
      //   module_slug: "downloads",
      //   path: Paths.downloadList,
      //   icon: "downloads"
      // }
    ]
  },
  {
    title: "KYC Modules",
    module_slug: [
      "kyc_search_ab_bank",
      "kyc_search_ab_mobile",
      "kyc_search_ab_aadhar",
      "kyc_search_ab_pan",
      "kyc_search_ab_state_name",
      "kyc_search_ab_reference",
      "kyc_delete_bank_acc",
      "kyc_delete_pan_details",
      "kyc_delete_ab_photo",
      "kyc_enable_refill_kyc",
      "kyc_report_detail_report",
      "kyc_report_not_ok_report",
      "kyc_reports_declaration_report",
      "kyc_report_current_business_report",
      "kyc_report_feeded_user_wise",
      "kyc_report_executive_feedback_report",
      "kyc_report_self_pv_report",
      "kyc_report_amount_wise_ab_count",
      "ekyc_list_for_checking",
      "kyc_list_terminate_repurchase",
      "kyc_list_monthly_meetings_report",
      "kyc_list_technical_leader_tree",
      "kyc_list_technical_core_list",
      "kyc_associate_buyer_ab_id_stop",
      "kyc_associate_buyer_reset_pass",
      "kyc_associate_buyer_ab_details",
      "kyc_associate_buyer_uptree",
      "kyc_associate_buyer_sms_diamond_club",
      "kyc_associate_buyer_purchase_download",
      "kyc_associate_buyer_not_purchase_otp",
      "kyc_declaration_mobile_num",
      "similar_kyc_entries",
      "kyc_new_entry",
      "kyc_todays_users",
      "kyc_old_entry",
      "kyc_terminate_ab",
      "kyc_remove_termination_of_ab",
      "kyc_update_request_bank",
      "kyc_update_request_pan",
      "kyc_document_update_address_id",
      "kyc_document_update_pan",
      "kyc_document_update_ab_photo",
      "verification",
      "kyc_report_death_case_report",
      "kyc_report_stop_ab_report",
      "kyc_report_terminate_ab",
      "kyc_report_non_purchasing_ab_report",
      "kyc_report_pin_achiever_report",
      "kyc_report_ab_last_6_month_report",
      "kyc_associate_buyer_name_update",
      "kyc_associate_buyer_payment",
      "kyc_associate_buyer_repurchase",
      "kyc_associate_buyer_monthly_meetings",
      "kyc_document_update_ab_bank",
      "kyc_death_case",
      "kyc_report_diamond_club_purchase"
    ],
    icon: "kyc-admin",
    subMenu: [
      {
        title: "Search AB Details",
        module_slug: [
          "kyc_search_ab_bank",
          "kyc_search_ab_mobile",
          "kyc_search_ab_aadhar",
          "kyc_search_ab_pan",
          "kyc_search_ab_state_name",
          "kyc_search_ab_reference"
        ],
        icon: "manageMedia",
        subMenu: [
          {
            title: "Bank Account Number",
            path: KycAdminPaths.searchByBankAccountNumber,
            module_slug: "kyc_search_ab_bank"
          },
          {
            title: "Registered Mobile Number",
            path: KycAdminPaths.searchByRegisteredMobileNo,
            module_slug: "kyc_search_ab_mobile"
          },
          {
            title: "Aadhar Number",
            path: KycAdminPaths.searchByAadharNo,
            module_slug: "kyc_search_ab_aadhar"
          },
          {
            title: "PAN Number",
            path: KycAdminPaths.searchByPanNo,
            module_slug: "kyc_search_ab_pan"
          },
          {
            title: "Associate Buyer Name",
            path: KycAdminPaths.stateWiseSearchAbName,
            module_slug: "kyc_search_ab_state_name"
          },
          {
            title: "Reference Number",
            path: KycAdminPaths.referenceNumber,
            module_slug: "kyc_search_ab_reference"
          }
        ]
      },
      {
        title: "Enable Info",
        module_slug: [
          "kyc_delete_bank_acc",
          "kyc_delete_pan_details",
          "kyc_delete_ab_photo",
          "kyc_enable_refill_kyc"
        ],
        icon: "enableInfo",
        subMenu: [
          {
            title: "Bank Account Details",
            path: KycAdminPaths.deleteBankAccountDetails,
            module_slug: "kyc_delete_bank_acc"
          },
          {
            title: "PAN Number",
            path: KycAdminPaths.deletePanNumber,
            module_slug: "kyc_delete_pan_details"
          },
          {
            title: "AB Photo ",
            path: KycAdminPaths.deleteProfilePhoto,
            module_slug: "kyc_delete_ab_photo"
          },
          {
            title: "Re-KYC (For Existing AB) ",
            path: KycAdminPaths.enableReKYC,
            module_slug: "kyc_enable_refill_kyc"
          }
        ]
      },
      {
        title: "Reports",
        module_slug: [
          "kyc_report_detail_report",
          "kyc_report_not_ok_report",
          "kyc_reports_declaration_report",
          "kyc_report_feeded_user_wise",
          "kyc_report_terminate_ab",
          "kyc_report_non_purchasing_ab_report",
          "kyc_report_amount_wise_ab_count",
          "kyc_report_self_pv_report",
          "kyc_list_terminate_repurchase",
          "kyc_report_death_case_report",
          "kyc_report_stop_ab_report",
          "kyc_report_pin_achiever_report",
          "kyc_report_ab_last_6_month_report",
          "kyc_report_diamond_club_purchase"
        ],
        icon: "reports",
        subMenu: [
          {
            title: "Declaration Report",
            path: KycAdminPaths.declareReport,
            module_slug: "kyc_reports_declaration_report"
          },
          {
            title: "KYC Detail Report",
            path: KycAdminPaths.kycDetailReport,
            module_slug: "kyc_report_detail_report"
          },
          {
            title: "KYC Not OK Report",
            path: KycAdminPaths.kycNotOk,
            module_slug: "kyc_report_not_ok_report"
          },
          {
            title: "KYC Feeding Userwise",
            path: KycAdminPaths.kycFeedingReport,
            module_slug: "kyc_report_feeded_user_wise"
          },
          // {
          //   title: "Diamond Club Report",
          //   path: KycAdminPaths.diamondClubReport,
          //   module_slug: "" // change slug
          // },
          {
            title: "Non Purchasing AB",
            path: KycAdminPaths.nonPurchasingABReport,
            module_slug: "kyc_report_non_purchasing_ab_report"
          },
          // {
          //   title: "AB IVRS Report",
          //   path: KycAdminPaths.abIVRSReport,
          //   module_slug: "" // change slug
          // },
          {
            title: "Terminate Repurchase",
            path: KycAdminPaths.terminateRepurchaseReport,
            module_slug: "kyc_list_terminate_repurchase"
          },
          {
            title: "Self P.V. Report",
            path: KycAdminPaths.selfPVReport,
            module_slug: "kyc_report_self_pv_report"
          },
          {
            title: "Amount Wise AB Count",
            path: KycAdminPaths.amountWiseABCountReport,
            module_slug: "kyc_report_amount_wise_ab_count"
          },
          {
            title: "Death Case Report",
            path: KycAdminPaths.deathCaseReport,
            module_slug: "kyc_report_death_case_report"
          },
          {
            title: "Stopped AB Report",
            path: KycAdminPaths.stopABReport,
            module_slug: "kyc_report_stop_ab_report"
          },
          {
            title: "All Termination Report",
            path: KycAdminPaths.allTermination,
            module_slug: "kyc_report_terminate_ab"
          },
          {
            title: "Pin Achiever Report",
            path: KycAdminPaths.pinAchieverReport,
            module_slug: "kyc_report_pin_achiever_report"
          },
          {
            title: "AB Last 6 Month Report",
            path: KycAdminPaths.abLastSixMonthsPurchaseReport,
            module_slug: "kyc_report_ab_last_6_month_report"
          },
          {
            title: "Diamond Club Purchase Report",
            path: KycAdminPaths.diamondClubPurchaseReport,
            module_slug: "kyc_report_diamond_club_purchase"
          }
        ]
      },
      {
        title: "Lists",
        module_slug: [
          "ekyc_list_for_checking",
          "kyc_list_monthly_meetings_report",
          "kyc_list_technical_leader_tree",
          "kyc_list_technical_core_list"
        ],

        icon: "list",
        subMenu: [
          {
            title: "E-KYC",
            path: KycAdminPaths.eKyc,
            module_slug: "ekyc_list_for_checking"
          },
          {
            title: "Download Monthly Meetings",
            path: KycAdminPaths.monthlyMeetings,
            module_slug: "kyc_list_monthly_meetings_report"
          },
          {
            title: "Technical Leader Tree View",
            path: KycAdminPaths.technicalLeaderTreeView,
            module_slug: "kyc_list_technical_leader_tree"
          },
          {
            title: "Technical Core List",
            path: KycAdminPaths.technicalCore,
            module_slug: "kyc_list_technical_core_list"
          }
        ]
      },
      {
        title: "Associate Buyers",
        module_slug: [
          "kyc_report_current_business_report",
          "kyc_associate_buyer_ab_id_stop",
          "kyc_associate_buyer_reset_pass",
          "kyc_associate_buyer_ab_details",
          "kyc_associate_buyer_uptree",
          "kyc_associate_buyer_sms_diamond_club",
          "kyc_associate_buyer_purchase_download",
          "kyc_associate_buyer_not_purchase_otp",
          "kyc_associate_buyer_name_update",
          "kyc_associate_buyer_payment",
          "kyc_associate_buyer_repurchase",
          "kyc_associate_buyer_monthly_meetings",
          "kyc_document_update_ab_bank",
          "kyc_death_case"
        ],
        icon: "user",
        subMenu: [
          {
            title: "Current Business",
            path: KycAdminPaths.currentBusiness,
            module_slug: "kyc_report_current_business_report"
          },
          {
            title: "AB ID Stop",
            path: KycAdminPaths.abIdStop,
            module_slug: "kyc_associate_buyer_ab_id_stop"
          },
          {
            title: "AB Not Purchase OTP",
            path: KycAdminPaths.abNotPurchaseOtp,
            module_slug: "kyc_associate_buyer_not_purchase_otp"
          },
          {
            title: "AB Purchase Download",
            path: KycAdminPaths.abPurchaseDownload,
            module_slug: "kyc_associate_buyer_purchase_download"
          },
          {
            title: "AB Password Reset",
            path: KycAdminPaths.resetpswrd,
            module_slug: "kyc_associate_buyer_reset_pass"
          },
          {
            title: "AB Stop Payment",
            path: KycAdminPaths.stopPayment,
            module_slug: "kyc_associate_buyer_payment"
          },
          {
            title: "SMS Diamond Club",
            path: KycAdminPaths.smsDiamondClub,
            module_slug: "kyc_associate_buyer_sms_diamond_club"
          },
          {
            title: "AB Check Monthly Meetings",
            path: KycAdminPaths.checkMonthlyMeeting,
            module_slug: "kyc_associate_buyer_monthly_meetings"
          },
          {
            title: "AB Repurchase",
            path: KycAdminPaths.rePurchase,
            module_slug: "kyc_associate_buyer_repurchase"
          },
          {
            title: "AB Uptree",
            path: KycAdminPaths.abUptree,
            module_slug: "kyc_associate_buyer_uptree"
          },
          {
            title: "AB Details",
            path: KycAdminPaths.abDetails,
            module_slug: "kyc_associate_buyer_ab_details"
          },
          {
            title: "AB Bank Account Update",
            path: KycAdminPaths.abBankAccntUpdate,
            module_slug: "kyc_document_update_ab_bank"
          },
          {
            title: "AB Name Update",
            path: KycAdminPaths.abNameUpdate,
            module_slug: "kyc_associate_buyer_name_update"
          },
          {
            title: "Death Case/Id Transfer",
            path: KycAdminPaths.deathCase,
            module_slug: "kyc_death_case"
          }
        ]
      },
      {
        title: "Declaration",
        module_slug: ["kyc_declaration_mobile_num"],
        icon: "declaration",
        subMenu: [
          {
            title: "Mobile Declaration",
            path: KycAdminPaths.mobileDeclaration,
            module_slug: "kyc_declaration_mobile_num"
          }
        ]
      },
      {
        title: "KYC",
        module_slug: [
          "similar_kyc_entries",
          "kyc_new_entry",
          "kyc_old_entry",
          "verification",
          "kyc_report_executive_feedback_report",
          "kyc_todays_users"
        ],
        icon: "kyc-icon",
        subMenu: [
          {
            title: "KYC Similar Entities",
            path: KycAdminPaths.kycSimilarEntities,
            module_slug: "similar_kyc_entries"
          },
          {
            title: "KYC New Entry",
            path: KycAdminPaths.kycNewEntry,
            module_slug: "kyc_new_entry"
          },
          {
            title: "KYC Old Entry",
            path: KycAdminPaths.kycOldEntry,
            module_slug: "kyc_old_entry"
          },
          {
            title: "Verification",
            path: KycAdminPaths.kycVerification,
            module_slug: "verification"
          },
          {
            title: "KYC Todays Users",
            path: KycAdminPaths.KycTodaysUsers,
            module_slug: "kyc_todays_users"
          },
          {
            title: "Executive Feedback",
            path: KycAdminPaths.executiveFeedback_Report,
            module_slug: "kyc_report_executive_feedback_report"
          }
        ]
      },
      {
        title: "Terminate-Restore",
        module_slug: ["kyc_terminate_ab"],
        subMenu: [
          {
            title: "Terminate-Restore AB",
            path: KycAdminPaths.terminateAB,
            module_slug: "kyc_terminate_ab"
          }
        ]
      },
      {
        title: "Update Request",
        module_slug: ["kyc_update_request_bank", "kyc_update_request_pan"],
        icon: "updateRequest",
        subMenu: [
          {
            title: "Bank Update Request",
            path: KycAdminPaths.bankUpdateRequest,
            module_slug: "kyc_update_request_bank"
          },
          {
            title: "PAN Update Request",
            path: KycAdminPaths.panUpdateRequest,
            module_slug: "kyc_update_request_pan"
          }
        ]
      },
      {
        title: "Document Update",
        module_slug: [
          "kyc_document_update_address_id",
          "kyc_document_update_pan",
          "kyc_document_update_ab_photo"
        ],
        icon: "doumentUpdate",
        subMenu: [
          {
            title: "Address & ID Proof",
            path: KycAdminPaths.address_id_proof_update,
            module_slug: "kyc_document_update_address_id"
          },
          {
            title: "PAN Detail",
            path: KycAdminPaths.addPan,
            module_slug: "kyc_document_update_pan"
          },
          {
            title: "AB Photo Update",
            path: KycAdminPaths.abPhotoUpdate,
            module_slug: "kyc_document_update_ab_photo"
          }
        ]
      }
    ]
  },
  {
    title: "Utility",
    module_slug: ["manage_utility"],
    path: Paths.bulkUploadPv,
    icon: "",
    subMenu: [
      {
        title: "Bulk Update PV",
        path: Paths.bulkUploadPv,
        module_slug: "manage_utility"
      }
    ]
  },
  {
    title: "Generate Business",
    module_slug: "business_generation",
    path: Paths.generateBusiness,
    icon: "barChart"
  }
];

// create search menus
export const createSearchMenus = (menusArray, parentKey = "") => {
  return menusArray.reduce((acc, curr) => {
    // for submenus
    if (curr?.subMenu?.length > 0) {
      acc = [
        ...acc,
        ...createSearchMenus(curr?.subMenu, parentKey ? `${parentKey} > ${curr.title}` : curr.title)
      ];
    }

    // for single
    else {
      parentKey
        ? acc.push({
            label: `${parentKey} > ${curr.title}`,
            value: curr.path
          })
        : acc.push({
            label: curr.title,
            value: curr.path
          });
    }

    return acc;
  }, []);
};
