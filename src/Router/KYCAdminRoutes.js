import { lazy } from "react";
import { KycAdminPaths } from "./KYCAdminPaths";

export const kycAdminRoutes = [
  // Search AB Details
  {
    path: KycAdminPaths.searchByBankAccountNumber,
    ComponentIn: lazy(() => import("Components/KycAdmin/SearchABDetails/BankAccountNumber"))
  },
  {
    path: KycAdminPaths.searchByRegisteredMobileNo,
    ComponentIn: lazy(() => import("Components/KycAdmin/SearchABDetails/RegisteredMobileNumber"))
  },
  {
    path: KycAdminPaths.searchByAadharNo,
    ComponentIn: lazy(() => import("Components/KycAdmin/SearchABDetails/AadharNumber"))
  },
  {
    path: KycAdminPaths.searchByPanNo,
    ComponentIn: lazy(() => import("Components/KycAdmin/SearchABDetails/PanNumber"))
  },
  {
    path: KycAdminPaths.stateWiseSearchAbName,
    ComponentIn: lazy(() => import("Components/KycAdmin/SearchABDetails/StateWiseSearchAbName.jsx"))
  },
  {
    path: KycAdminPaths.referenceNumber,
    ComponentIn: lazy(() => import("Components/KycAdmin/SearchABDetails/ReferenceNumber.jsx"))
  },
  {
    path: KycAdminPaths.mobileDeclaration,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Declaration/MobileDeclaration/MobileDeclaration.js")
    )
  },
  {
    path: KycAdminPaths.terminateOk,
    ComponentIn: lazy(() => import("Components/KycAdmin/Terminate/TerminateOk.js"))
  },
  {
    path: KycAdminPaths.terminateAB,
    ComponentIn: lazy(() => import("Components/KycAdmin/Terminate/TerminateAb/TerminateAb.js"))
  },
  {
    path: KycAdminPaths.softTerminate,
    ComponentIn: lazy(() => import("Components/KycAdmin/Terminate/SoftTerminate/SoftTerminate.jsx"))
  },
  // Delete AB Details
  {
    path: KycAdminPaths.deleteBankAccountDetails,
    ComponentIn: lazy(() => import("Components/KycAdmin/DeleteABDetails/DeleteBankAccount"))
  },
  {
    path: KycAdminPaths.deletePanNumber,
    ComponentIn: lazy(() => import("Components/KycAdmin/DeleteABDetails/DeletePanNumber"))
  },
  {
    path: KycAdminPaths.deleteProfilePhoto,
    ComponentIn: lazy(() => import("Components/KycAdmin/DeleteABDetails/DeletePhoto"))
  },
  {
    path: KycAdminPaths.enableReKYC,
    ComponentIn: lazy(() => import("Components/KycAdmin/DeleteABDetails/EnableReKYC"))
  },

  {
    path: KycAdminPaths.checkMonthlyMeeting,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/AssociateBuyers/MonthlyMeetings/ABCheckMonthlyMeetings")
    )
  },

  // Report Module
  {
    path: KycAdminPaths.declareReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/DeclarationReport/DeclarationReport.js")
    )
  },
  {
    path: KycAdminPaths.kycDetailReport,
    ComponentIn: lazy(() => import("Components/KycAdmin/Reports/KYCDetails/KycDetailReport.js"))
  },
  {
    path: KycAdminPaths.kycNotOk,
    ComponentIn: lazy(() => import("Components/KycAdmin/Reports/KycNotOk/kycNotOk.js"))
  },
  {
    path: `${KycAdminPaths.currentBusiness}/:id?`,
    ComponentIn: lazy(() => import("Components/KycAdmin/Reports/CurrentBusiness/CurrentBusiness"))
  },
  {
    path: KycAdminPaths.kycFeedingReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/KYCFeedingReport/KycFeedingReport.js")
    )
  },
  // {
  //   path: KycAdminPaths.diamondClubReport,
  //   ComponentIn: lazy(
  //     () => import("Components/KycAdmin/Reports/DiamondClubReport/DiamondClubReport.jsx")
  //   )
  // },
  {
    path: KycAdminPaths.selfPVReport,
    ComponentIn: lazy(() => import("Components/KycAdmin/Reports/SelfPVReport/SelfPVReport.jsx"))
  },
  {
    path: KycAdminPaths.diamondClubPurchaseReport,
    ComponentIn: lazy(() => import("Components/KycAdmin/Reports/DiamondClubPurchaseReport/DiamondClubPurchaseReport.jsx"))
  },
  {
    path: KycAdminPaths.executiveFeedback_Report,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/ExecutiveFeedbackReport/ExecutivesList.jsx")
    )
  },
  {
    path: KycAdminPaths.executiveFeedback_ReportData,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/ExecutiveFeedbackReport/ExecutivesReportData.jsx")
    )
  },
  {
    path: KycAdminPaths.executiveFeedback_UserProfile,
    ComponentIn: lazy(
      () =>
        import(
          "Components/KycAdmin/Reports/ExecutiveFeedbackReport/ExecutivesReportUserProfile.jsx"
        )
    )
  },
  {
    path: KycAdminPaths.nonPurchasingABReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/NonPurchasingABReport/NonPurchasingABReport.jsx")
    )
  },
  {
    path: KycAdminPaths.amountWiseABCountReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/AmountWiseABCount/AmountWiseABCount.jsx")
    )
  },
  {
    path: KycAdminPaths.abLastSixMonthsPurchaseReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/AbLastSixMonthsReport/AbLastSixMonthsReport.jsx")
    )
  },
  {
    path: KycAdminPaths.deathCaseReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/AdminReports/DeathCase/DeathCaseReport.jsx")
    )
  },
  {
    path: KycAdminPaths.stopABReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/AdminReports/StopABReport/StopABReport.jsx")
    )
  },
  {
    path: KycAdminPaths.allTermination,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/AdminReports/AllTermination/AllTermination.jsx")
    )
  },
  // Associate Buyer
  {
    path: KycAdminPaths.abIdStop,
    ComponentIn: lazy(() => import("Components/KycAdmin/AssociateBuyers/ABIDStop"))
  },
  {
    path: KycAdminPaths.resetpswrd,
    ComponentIn: lazy(() => import("Components/KycAdmin/AssociateBuyers/ABResetPassword"))
  },
  {
    path: KycAdminPaths.stopPayment,
    ComponentIn: lazy(() => import("Components/KycAdmin/AssociateBuyers/AbStopPayment"))
  },
  {
    path: KycAdminPaths.rePurchase,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/AssociateBuyers/ABRepurchaseSummaryDetails")
    )
  },
  {
    path: KycAdminPaths.abDetails,
    ComponentIn: lazy(() => import("Components/KycAdmin/AssociateBuyers/ABDetails/ABDetailsIndex"))
  },
  {
    path: KycAdminPaths.smsDiamondClub,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/AssociateBuyers/SmsDiamondClub/SmsDiamondClub")
    )
  },
  {
    path: KycAdminPaths.abNotPurchaseOtp,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/AssociateBuyers/ABNotPurchaseOtp/ABNotPurchaseOtp")
    )
  },
  {
    path: KycAdminPaths.abBankAccntUpdate,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/AssociateBuyers/ABBankAccountUpdate/ABBankAccountUpdate")
    )
  },
  {
    path: KycAdminPaths.abNameUpdate,
    ComponentIn: lazy(() => import("Components/KycAdmin/AssociateBuyers/ABNameUpdate/ABNameUpdate"))
  },

  // List
  {
    path: KycAdminPaths.eKyc,
    ComponentIn: lazy(() => import("Components/KycAdmin/Lists/E-KYC/EKYC.js"))
  },
  {
    path: KycAdminPaths.monthlyMeetings,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Lists/DownloadMonthlyMeeting/MonthlyMeeting.js")
    )
  },
  {
    path: KycAdminPaths.terminateRepurchaseReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Lists/TerminateRepurchase/TerminateRepuchaseReport.js")
    )
  },
  {
    path: KycAdminPaths.abUptree,
    ComponentIn: lazy(() => import("Components/KycAdmin/AssociateBuyers/ABUptree"))
  },
  {
    path: KycAdminPaths.abPurchaseDownload,
    ComponentIn: lazy(() => import("Components/KycAdmin/AssociateBuyers/ABPurchaseDownload"))
  },
  {
    path: KycAdminPaths.technicalCore,
    ComponentIn: lazy(() => import("Components/KycAdmin/Lists/TechnicalCore/TechnicalCoreList.jsx"))
  },
  {
    path: KycAdminPaths.technicalLeaderTreeView,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Lists/TechnicalLeaderTreeView/TechnicalLeaderTreeView")
    )
  },
  {
    path: KycAdminPaths.pinAchieverReport,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/Reports/PinAchieverReport/PinAchieverReport.jsx")
    )
  },

  // KYC
  {
    path: KycAdminPaths.kycSimilarEntities,
    ComponentIn: lazy(() => import("Components/KycAdmin/KYC/KycSimilarEntities/KycSimilarEntities"))
  },
  {
    path: KycAdminPaths.kycDocumentUpdate,
    ComponentIn: lazy(() => import("Components/KycAdmin/KYC/KycDocumentUpdate/KycDocumentUpdate"))
  },
  {
    path: KycAdminPaths.abPhotoUpdate,
    ComponentIn: lazy(() => import("Components/KycAdmin/KYC/AbPhotoUpdate/AbPhotoUpdate.jsx"))
  },
  {
    path: KycAdminPaths.kycNewEntry,
    ComponentIn: lazy(() => import("Components/KycAdmin/KYC/KycNewEntry/KycNewEntry.jsx"))
  },
  {
    path: KycAdminPaths.KycTodaysUsers,
    ComponentIn: lazy(() => import("Components/KycAdmin/KYC/kycTodaysUsers/KycTodaysUsers.jsx"))
  },
  {
    path: KycAdminPaths.kycOldEntry,
    ComponentIn: lazy(() => import("Components/KycAdmin/KYC/KycOldEntry/KycOldEntry.jsx"))
  },
  {
    path: KycAdminPaths.kycVerification,
    ComponentIn: lazy(() => import("Components/KycAdmin/KYC/Verification/Verification.jsx"))
  },

  // Document Update
  {
    path: KycAdminPaths.addPan,
    ComponentIn: lazy(() => import("Components/KycAdmin/DocumentUpdate/ABPanAdd"))
  },
  {
    path: KycAdminPaths.address_id_proof_update,
    ComponentIn: lazy(() => import("Components/KycAdmin/DocumentUpdate/AddressAndIDProofUpdate"))
  },

  // update request
  {
    path: KycAdminPaths.bankUpdateRequest,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/UpdateRequest/BankUpdateRequest/BankUpdateRequestList")
    )
  },
  {
    path: KycAdminPaths.viewBankUpdateRequest + "/:id",
    ComponentIn: lazy(
      () => import("Components/KycAdmin/UpdateRequest/BankUpdateRequest/ViewBankUpdateRequest")
    )
  },
  {
    path: KycAdminPaths.panUpdateRequest,
    ComponentIn: lazy(
      () => import("Components/KycAdmin/UpdateRequest/PANUpdateRequest/PanUpdateRequest")
    )
  },
  {
    path: KycAdminPaths.viewPanUpdateRequest + "/:id",
    ComponentIn: lazy(
      () => import("Components/KycAdmin/UpdateRequest/PANUpdateRequest/ViewRequest")
    )
  },

  // Miscellanous
  {
    path: KycAdminPaths.abIdUnStop,
    ComponentIn: lazy(() => import("Components/KycAdmin/Miscellaneous/ABIDUnStop.jsx"))
  },
  {
    path: KycAdminPaths.deathCase,
    ComponentIn: lazy(() => import("Components/KycAdmin/Miscellaneous/DeathCase/DeathCase.jsx"))
  },
  // Assign KYC Lead
  {
    path: KycAdminPaths.assignKYCLead,
    ComponentIn: lazy(() => import("Components/KycAdmin/KYC/AssignKYCLead/AssignKYCLead"))
  }
];
