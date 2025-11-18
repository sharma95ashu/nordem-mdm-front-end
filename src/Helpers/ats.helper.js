// import variables from "Styles/variables.scss";
import jwt_decode from "jwt-decode";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { message, Tag, Typography, Upload } from "antd";
import {
  abNoMaxLength,
  ALLOWED_FILE_IMAGE_TYPES,
  ALLOWED_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_UPLOAD_FILES,
  LoginModuleError,
  USER_STATUS,
  snackBarErrorConf,
  ALLOWED_IMAGES_GIF,
  PermissionAction,
  ALLOWED_UPLOAD_FILES_PROFILE_MENU,
  ALLOWED_FILE_SIZE_FOR_SVG
} from "./ats.constants";
import { MenuList } from "Static/utils/menuList";
import { enqueueSnackbar } from "notistack";
import Compressor from "compressorjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getFullImageUrl } from "./functions";

dayjs.extend(utc);

export const DesignTokens = {
  light: {
    wireframe: true,
    colorPrimary: "#0062a6",
    colorInfo: "#0062a6",
    colorPrimaryBg: "#f0f8ff",
    colorPrimaryBgHover: "#b8e4ff",
    colorPrimaryBorder: "#79ceff",
    colorPrimaryBorderHover: "#32b5fe",
    colorPrimaryActive: "#034f81",
    colorPrimaryText: "#1a4878",
    colorPrimaryHover: "#007ccd",
    colorPrimaryTextHover: "#2b679e",
    colorPrimaryTextActive: "#1a4878",
    colorSuccessActive: "#00a557",
    colorSuccessHover: "#02e579",
    colorSuccessTextActive: "#00a557",
    colorSuccessTextHover: "#02e579",
    colorSuccessText: "#00bf60",
    colorError: "#dc2626",
    colorErrorActive: "#b91c1c",
    colorErrorHover: "#ef4444",
    colorSuccess: "#00bf60",
    colorWarning: "#fa8c16",
    colorWarningHover: "#ffa940",
    colorWarningBg: "#fff7e6",
    colorWarningBgHover: "#ffe7ba",
    colorWarningBorder: "#ffd591",
    colorWarningBorderHover: "#ffc069",
    colorWarningActive: "#d46b08",
    colorWarningTextHover: "#ffa940",
    colorWarningText: "#fa8c16",
    colorWarningTextActive: "#d46b08",
    colorErrorBg: "#fef2f2",
    colorErrorBgHover: "#fee2e2",
    colorErrorBorder: "#fecaca",
    colorErrorBorderHover: "#fca5a5",
    colorErrorText: "#dc2626",
    colorErrorTextHover: "#ef4444",
    colorErrorTextActive: "#b91c1c",
    colorSuccessBorderHover: "#45d985",
    colorSuccessBorder: "#6ee69e",
    colorSuccessBgHover: "#9bf2bb",
    colorSuccessBg: "#e6ffee",
    colorLinkHover: "#007ccd",
    colorLinkActive: "#0062a6",
    colorText: "rgba(0, 0, 0, 0.8800)",
    colorTextSecondary: "rgba(0, 0, 0, 0.6500)",
    colorTextTertiary: "rgba(0, 0, 0, 0.4500)",
    colorTextQuaternary: "rgba(0, 0, 0, 0.2500)",
    colorTextLightSolid: "#ffffff",
    colorTextHeading: "rgba(0, 0, 0, 0.8800)",
    colorTextLabel: "rgba(0, 0, 0, 0.6500)",
    colorTextDescription: "rgba(0, 0, 0, 0.4500)",
    colorTextDisabled: "rgba(0, 0, 0, 0.2500)",
    colorTextPlaceholder: "rgba(0, 0, 0, 0.2500)",
    colorIcon: "rgba(0, 0, 0, 0.4500)",
    colorIconHover: "rgba(0, 0, 0, 0.8800)",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f5f5f5",
    colorBgMask: "rgba(0, 0, 0, 0.4500)",
    colorBgSpotlight: "rgba(0, 0, 0, 0.8500)",
    colorBgContainerDisabled: "rgba(0, 0, 0, 0.0400)",
    colorBgTextActive: "rgba(0, 0, 0, 0.1500)",
    colorBgTextHover: "rgba(0, 0, 0, 0.0600)",
    colorBorderBg: "#ffffff",
    colorBorder: "#d9d9d9",
    colorBorderSecondary: "#d9d9d9",
    colorSplit: "rgba(0, 0, 0, 0.0600)",
    colorFill: "rgba(0, 0, 0, 0.1500)",
    colorFillSecondary: "rgba(0, 0, 0, 0.0600)",
    colorFillTertiary: "rgba(0, 0, 0, 0.0400)",
    colorFillQuaternary: "rgba(0, 0, 0, 0.0200)",
    colorFillContent: "rgba(0, 0, 0, 0.0600)",
    colorFillContentHover: "rgba(0, 0, 0, 0.1500)",
    colorFillAlter: "rgba(0, 0, 0, 0.0200)",
    colorWhite: "#ffffff",
    colorBgBase: "#ffffff",
    colorTextBase: "#000000",
    transparent: "rgba(0, 0, 0, 0.0000)",
    badgeColor: "#E3E3E3",
    colorInfoBg: "#e6f4ff",
    colorInfoBgHover: "#91caff",
    colorInfoBorder: "#35690",
    colorMagenta: "#520339",
    colorMagentaBg: "#fff0f6",
    colorMagentaBgHover: "#fff0f6",
    colorMagentaBorder: "#ffadd2"
  },
  dark: {
    colorPrimary: "#007ccd",
    colorPrimaryBg: "#062c4b",
    colorPrimaryBgHover: "#062c4b",
    colorPrimaryBorder: "#034f81",
    colorPrimaryBorderHover: "#0062a6",
    colorPrimaryHover: "#32b5fe",
    colorPrimaryActive: "#0062a6",
    colorPrimaryTextHover: "#79ceff",
    colorPrimaryText: "#b8e4ff",
    colorPrimaryTextActive: "#f0f8ff",
    colorSuccess: "#02e579",
    colorSuccessBg: "#00361d",
    colorSuccessBgHover: "#085f37",
    colorSuccessBorder: "#067541",
    colorSuccessBorderHover: "#00a557",
    colorSuccessHover: "#45d985",
    colorSuccessActive: "#02e579",
    colorSuccessTextHover: "#6ee69e",
    colorSuccessText: "#9bf2bb",
    colorSuccessTextActive: "#e6ffee",
    colorWarning: "#d87a16",
    colorWarningBg: "#2b1d11",
    colorWarningBgHover: "#442a11",
    colorWarningBorder: "#593815",
    colorWarningBorderHover: "#7c4a15",
    colorWarningHover: "#e89a3c",
    colorWarningActive: "#aa6215",
    colorWarningTextHover: "#f3b765",
    colorWarningText: "#f8cf8d",
    colorWarningTextActive: "#fae3b7",
    colorWarningOutline: "rgba(173, 107, 0, 0.1500)",
    colorInfo: "#007ccd",
    colorInfoBg: "#062c4b",
    colorInfoBgHover: "#062c4b",

    colorInfoBorder: "#034f81",
    colorInfoBorderHover: "#32b5fe",
    colorInfoHover: "#32b5fe",
    colorInfoActive: "#0062a6",
    colorInfoTextHover: "#79ceff",
    colorInfoText: "#b8e4ff",
    colorInfoTextActive: "#f0f8ff",
    colorError: "#ef4444",
    colorErrorBg: "#450a0a",
    colorErrorBgHover: "#7f1d1d",
    colorErrorBorder: "#991b1b",
    colorErrorBorderHover: "#b91c1c",
    colorErrorHover: "#dc2626",
    colorErrorActive: "#fca5a5",
    colorErrorTextHover: "#dc2626",
    colorErrorText: "#ef4444",
    colorErrorTextActive: "#fca5a5",
    colorErrorOutline: "rgba(238, 38, 56, 0.1100)",
    colorLink: "#007ccd",
    colorLinkHover: "#32b5fe",
    colorLinkActive: "#0062a6",
    controlItemBgActive: "#062c4b",
    controlItemBgActiveDisabled: "rgba(255, 255, 255, 0.1800)",
    controlItemBgActiveHover: "#062c4b",
    controlItemBgHover: "rgba(255, 255, 255, 0.0800)",
    controlOutline: "rgba(0, 60, 180, 0.1500)",
    controlTmpOutline: "rgba(255, 255, 255, 0.0400)",
    colorText: "rgba(255, 255, 255, 0.8500)",
    colorTextSecondary: "rgba(255, 255, 255, 0.6500)",
    colorTextTertiary: "rgba(255, 255, 255, 0.4500)",
    colorTextQuaternary: "rgba(255, 255, 255, 0.2500)",
    colorTextLightSolid: "#ffffff",
    colorTextHeading: "rgba(255, 255, 255, 0.8500)",
    colorTextLabel: "rgba(255, 255, 255, 0.6500)",
    colorTextDescription: "rgba(255, 255, 255, 0.4500)",
    colorTextDisabled: "rgba(255, 255, 255, 0.2500)",
    colorTextPlaceholder: "rgba(255, 255, 255, 0.2500)",
    colorIcon: "rgba(255, 255, 255, 0.4500)",
    colorIconHover: "rgba(255, 255, 255, 0.8500)",
    colorBgContainer: "#141414",
    colorBgElevated: "#1f1f1f",
    colorBgLayout: "#000000",
    colorBgMask: "rgba(0, 0, 0, 0.4500)",
    colorBgSpotlight: "#424242",
    colorBgContainerDisabled: "rgba(255, 255, 255, 0.0800)",
    colorBgTextActive: "rgba(255, 255, 255, 0.1800)",
    colorBgTextHover: "rgba(255, 255, 255, 0.1200)",
    colorBorderBg: "#141414",
    colorBorder: "#424242",
    colorBorderSecondary: "#303030",
    colorSplit: "rgba(255, 255, 255, 0.0600)",
    colorFill: "rgba(255, 255, 255, 0.1800)",
    colorFillSecondary: "rgba(255, 255, 255, 0.1200)",
    colorFillTertiary: "rgba(255, 255, 255, 0.0800)",
    colorFillQuaternary: "rgba(255, 255, 255, 0.0400)",
    colorFillContent: "rgba(255, 255, 255, 0.1200)",
    colorFillContentHover: "rgba(255, 255, 255, 0.1800)",
    colorFillAlter: "rgba(255, 255, 255, 0.0400)",
    colorWhite: "#ffffff",
    colorBgBase: "#000000",
    colorTextBase: "#ffffff",
    transparent: "rgba(255, 255, 255, 0.0000)",
    badgeColor: "#414141"
  }
};

/**
 * This configuration will be used for Component Override (Not Tokens)
 */

export const componentTokens = {
  lightComponents: {
    Layout: {
      headerColor: "rgb(255, 255, 255)",
      headerBg: "rgb(255, 255, 255)",
      headerPadding: "0px 20px",
      siderBg: "rgb(255, 255, 255)",
      triggerBg: "rgb(255, 255, 255)",
      bodyBg: "#f5f5f5",

      footerBg: "rgb(245, 245, 245)",
      triggerColor: "rgb(255, 255, 255)",
      lightTriggerColor: "rgb(0, 0, 0)",
      lightTriggerBg: "rgb(255, 255, 255)",
      lightSiderBg: "rgb(255, 255, 255)"
    },
    Button: {
      borderColorDisabled: "rgb(217, 217, 217)",
      dangerColor: "rgb(255, 255, 255)",
      defaultActiveBg: "rgb(255, 255, 255)",
      defaultActiveBorderColor: "rgb(3, 79, 129)",
      defaultActiveColor: "rgb(3, 79, 129)",
      defaultBg: "rgb(255, 255, 255)",
      defaultBorderColor: "rgb(217, 217, 217)",
      defaultColor: "rgba(0, 0, 0, 0.88)",
      defaultGhostBorderColor: "rgb(255, 255, 255)",
      defaultGhostColor: "rgb(255, 255, 255)",
      defaultHoverBg: "rgb(255, 255, 255)",
      defaultHoverBorderColor: "rgb(0, 124, 205)",
      defaultHoverColor: "rgb(0, 124, 205)",
      ghostBg: "rgba(0, 0, 0, 0)",
      groupBorderColor: "rgb(0, 124, 205)",
      linkHoverBg: "rgba(0, 0, 0, 0)",
      primaryColor: "rgb(255, 255, 255)",
      textHoverBg: "rgba(0, 0, 0, 0.06)"
    },
    Breadcrumb: {
      itemColor: "rgba(0, 0, 0, 0.45)",
      lastItemColor: "rgba(0, 0, 0, 0.88)",
      linkColor: "rgba(0, 0, 0, 0.45)",
      linkHoverColor: "rgba(0, 0, 0, 0.88)",
      separatorColor: "rgba(0, 0, 0, 0.45)"
    },
    Pagination: {
      itemActiveBg: "rgb(255, 255, 255)",
      itemActiveBgDisabled: "rgba(0, 0, 0, 0.15)",
      itemActiveColorDisabled: "rgba(0, 0, 0, 0.25)",
      itemBg: "rgb(255, 255, 255)",
      itemInputBg: "rgb(255, 255, 255)",
      itemLinkBg: "rgb(255, 255, 255)"
    },
    Cascader: {
      optionSelectedBg: "rgb(240, 248, 255)"
    },
    DatePicker: {
      activeBg: "rgb(255, 255, 255)",
      activeBorderColor: "rgb(0, 98, 166)",
      addonBg: "rgba(0, 0, 0, 0.02)",
      cellActiveWithRangeBg: "rgb(240, 248, 255)",
      cellBgDisabled: "rgba(0, 0, 0, 0.04)",
      cellHoverBg: "rgba(0, 0, 0, 0.04)",
      cellHoverWithRangeBg: "rgb(184, 228, 255)",
      hoverBg: "rgb(255, 255, 255)",
      cellRangeBorderColor: "rgb(121, 206, 255)",
      hoverBorderColor: "rgb(50, 181, 254)",
      multipleItemBg: "rgba(0, 0, 0, 0.06)",
      multipleItemBorderColor: "rgba(0, 0, 0, 0)",
      multipleItemBorderColorDisabled: "rgba(0, 0, 0, 0)",
      multipleItemColorDisabled: "rgba(0, 0, 0, 0.25)",
      multipleSelectorBgDisabled: "rgba(0, 0, 0, 0.04)"
    },
    Form: {
      labelColor: "rgba(0, 0, 0, 0.88)",
      labelRequiredMarkColor: "rgb(220, 38, 38)"
    },
    Menu: {
      dangerItemColor: "rgb(220, 38, 38)",
      dangerItemHoverColor: "rgb(239, 68, 68)",
      dangerItemActiveBg: "rgb(254, 226, 226)",
      dangerItemSelectedBg: "rgb(254, 242, 242)",
      dangerItemSelectedColor: "rgb(220, 38, 38)",
      darkDangerItemActiveBg: "rgb(220, 38, 38)",
      darkDangerItemSelectedColor: "rgb(255, 255, 255)",
      darkGroupTitleColor: "rgba(255, 255, 255, 0.65)",
      darkDangerItemSelectedBg: "rgb(69, 10, 10)",
      darkDangerItemColor: "rgb(239, 68, 68)",
      darkDangerItemHoverColor: "rgb(220, 38, 38)",
      darkItemColor: "rgba(255, 255, 255, 0.65)",
      darkItemDisabledColor: "rgba(255, 255, 255, 0.25)",
      darkItemHoverBg: "rgba(0, 0, 0, 0)",
      darkItemHoverColor: "rgb(255, 255, 255)",
      darkItemSelectedColor: "rgb(255, 255, 255)",
      darkItemSelectedBg: "rgb(0, 124, 205)",
      darkItemBg: "rgb(23, 23, 23)",
      darkPopupBg: "rgb(23, 23, 23)",
      darkSubMenuItemBg: "rgb(15, 15, 15)",
      groupTitleColor: "rgba(0, 0, 0, 0.45)",
      horizontalItemHoverBg: "rgba(0, 0, 0, 0)",
      popupBg: "rgb(255, 255, 255)",
      itemSelectedColor: "rgb(0, 98, 166)",
      subMenuItemBg: "rgba(0, 0, 0, 0.02)",
      itemSelectedBg: "rgb(240, 248, 255)",
      itemHoverColor: "rgba(0, 0, 0, 0.88)",
      itemHoverBg: "rgba(0, 0, 0, 0.06)",
      itemDisabledColor: "rgba(0, 0, 0, 0.25)",
      itemColor: "rgba(0, 0, 0, 0.88)",
      itemBg: "rgb(255, 255, 255)",
      itemActiveBg: "rgb(240, 248, 255)",
      horizontalItemSelectedColor: "rgb(0, 98, 166)",
      horizontalItemSelectedBg: "rgba(0, 0, 0, 0)",
      horizontalItemHoverColor: "rgb(0, 124, 205)"
    },
    Steps: {
      finishIconBorderColor: "rgb(0, 98, 166)",
      navArrowColor: "rgba(0, 0, 0, 0.25)"
    },
    Input: {
      activeBg: "rgb(255, 255, 255)",
      activeBorderColor: "rgb(3, 79, 129)",
      addonBg: "rgba(0, 0, 0, 0.02)",
      hoverBg: "rgb(255, 255, 255)",
      hoverBorderColor: "rgb(0, 124, 205)"
    },
    InputNumber: {
      activeBg: "rgb(255, 255, 255)",
      activeBorderColor: "rgb(3, 79, 129)",
      addonBg: "rgba(0, 0, 0, 0.02)",
      filledHandleBg: "rgb(240, 240, 240)",
      handleActiveBg: "rgba(0, 0, 0, 0.02)",
      handleBg: "rgb(255, 255, 255)",
      handleBorderColor: "rgb(217, 217, 217)",
      handleHoverColor: "rgb(0, 124, 205)",
      hoverBg: "rgb(255, 255, 255)",
      hoverBorderColor: "rgb(0, 124, 205)"
    },
    Select: {
      clearBg: "rgb(255, 255, 255)",
      multipleItemBg: "rgba(0, 0, 0, 0.06)",
      multipleItemBorderColor: "rgba(0, 0, 0, 0)",
      multipleItemBorderColorDisabled: "rgba(0, 0, 0, 0)",
      multipleItemColorDisabled: "rgba(0, 0, 0, 0.25)",
      multipleSelectorBgDisabled: "rgba(0, 0, 0, 0.04)",
      optionActiveBg: "rgba(0, 0, 0, 0.04)",
      optionSelectedBg: "rgb(240, 248, 255)",
      optionSelectedColor: "rgba(0, 0, 0, 0.88)",
      selectorBg: "rgb(255, 255, 255)"
    },
    Slider: {
      dotActiveBorderColor: "rgb(50, 181, 254)",
      dotBorderColor: "rgb(240, 240, 240)",
      handleColorDisabled: "rgb(191, 191, 191)",
      railBg: "rgba(0, 0, 0, 0.04)",
      railHoverBg: "rgba(0, 0, 0, 0.06)",
      trackBgDisabled: "rgba(0, 0, 0, 0.04)",
      handleColor: "rgb(121, 206, 255)",
      handleActiveColor: "rgb(0, 98, 166)",
      trackBg: "rgb(121, 206, 255)",
      trackHoverBg: "rgb(50, 181, 254)"
    },
    Switch: {
      handleBg: "rgb(255, 255, 255)"
    },
    TreeSelect: {
      nodeHoverBg: "rgba(0, 0, 0, 0.04)",
      nodeSelectedBg: "rgb(240, 248, 255)"
    },
    Upload: {
      actionsColor: "rgba(0, 0, 0, 0.45)"
    },
    Avatar: {
      groupBorderColor: "rgb(255, 255, 255)"
    },
    Calendar: {
      fullBg: "rgb(255, 255, 255)",
      fullPanelBg: "rgb(255, 255, 255)",
      itemActiveBg: "rgb(240, 248, 255)"
    },
    Card: {
      actionsBg: "rgb(255, 255, 255)",
      extraColor: "rgba(0, 0, 0, 0.88)"
    },
    Carousel: {
      colorBgContainer: "rgb(255, 255, 255)",
      colorText: "rgba(0, 0, 0, 0.88)"
    },
    Collapse: {
      contentBg: "rgb(255, 255, 255)",
      headerBg: "rgba(0, 0, 0, 0.02)"
    },
    Descriptions: {
      contentColor: "rgba(0, 0, 0, 0.88)",
      extraColor: "rgba(0, 0, 0, 0.88)",
      labelBg: "rgba(0, 0, 0, 0.02)",
      titleColor: "rgba(0, 0, 0, 0.88)"
    },
    Empty: {
      colorText: "rgba(0, 0, 0, 0.88)",
      colorTextDisabled: "rgba(0, 0, 0, 0.25)"
    },
    Image: {
      previewOperationColor: "rgba(255, 255, 255, 0.65)",
      previewOperationColorDisabled: "rgba(255, 255, 255, 0.25)",
      previewOperationHoverColor: "rgba(255, 255, 255, 0.85)"
    },
    List: {
      footerBg: "rgba(0, 0, 0, 0)",
      headerBg: "rgba(0, 0, 0, 0)"
    },
    Segmented: {
      itemActiveBg: "rgba(0, 0, 0, 0.15)",
      itemColor: "rgba(0, 0, 0, 0.65)",
      itemHoverBg: "rgba(0, 0, 0, 0.06)",
      itemHoverColor: "rgba(0, 0, 0, 0.88)",
      itemSelectedBg: "rgb(255, 255, 255)",
      itemSelectedColor: "rgba(0, 0, 0, 0.88)",
      trackBg: "rgba(0, 0, 0, 0.06)"
    },
    Table: {
      footerColor: "rgba(0, 0, 0, 0.88)",
      headerBg: "rgb(250, 250, 250)",
      headerColor: "rgba(0, 0, 0, 0.88)",
      headerFilterHoverBg: "rgba(0, 0, 0, 0.06)",
      headerSortActiveBg: "rgb(240, 240, 240)",
      headerSortHoverBg: "rgb(240, 240, 240)",
      headerSplitColor: "rgb(240, 240, 240)",
      rowExpandedBg: "rgba(0, 0, 0, 0.02)",
      rowHoverBg: "rgb(250, 250, 250)",
      rowSelectedBg: "rgb(240, 248, 255)",
      rowSelectedHoverBg: "rgb(184, 228, 255)",
      stickyScrollBarBg: "rgba(0, 0, 0, 0.25)",
      bodySortBg: "rgb(250, 250, 250)",
      borderColor: "rgb(240, 240, 240)",
      expandIconBg: "rgb(255, 255, 255)",
      filterDropdownBg: "rgb(255, 255, 255)",
      filterDropdownMenuBg: "rgb(255, 255, 255)",
      fixedHeaderSortActiveBg: "rgb(240, 240, 240)",
      footerBg: "rgb(250, 250, 250)"
    },
    Tabs: {
      cardBg: "rgba(0, 0, 0, 0.02)",
      inkBarColor: "rgb(0, 98, 166)",
      itemActiveColor: "rgb(3, 79, 129)",
      itemColor: "rgba(0, 0, 0, 0.88)",
      itemHoverColor: "rgb(0, 124, 205)",
      itemSelectedColor: "rgb(0, 98, 166)"
    },
    Tag: {
      defaultBg: "#fafafa",
      defaultColor: "rgba(0, 0, 0, 0.88)"
    },
    Timeline: {
      dotBg: "rgb(255, 255, 255)",
      tailColor: "rgba(5, 5, 5, 0.06)"
    },
    Tree: {
      directoryNodeSelectedBg: "rgb(0, 98, 166)",
      directoryNodeSelectedColor: "rgb(255, 255, 255)",
      nodeHoverBg: "rgba(0, 0, 0, 0.04)",
      nodeSelectedBg: "rgb(240, 248, 255)"
    },
    Message: {
      contentBg: "rgb(255, 255, 255)"
    },
    Modal: {
      contentBg: "rgb(255, 255, 255)",
      footerBg: "rgba(0, 0, 0, 0)",
      headerBg: "rgb(255, 255, 255)",
      titleColor: "rgba(0, 0, 0, 0.89)"
    },
    Progress: {
      circleTextColor: "rgba(0, 0, 0, 0.88)",
      defaultColor: "rgb(0, 98, 166)",
      remainingColor: "rgba(0, 0, 0, 0.06)"
    },
    Mentions: {
      activeBorderColor: "rgb(0, 98, 166)",
      activeBg: "rgb(255, 255, 255)",
      addonBg: "rgba(0, 0, 0, 0.02)",
      hoverBg: "rgb(255, 255, 255)",
      hoverBorderColor: "rgb(0, 124, 205)"
    },
    Radio: {
      buttonBg: "rgb(255, 255, 255)",
      buttonCheckedBg: "rgb(255, 255, 255)",
      buttonCheckedBgDisabled: "rgba(0, 0, 0, 0.15)",
      buttonCheckedColorDisabled: "rgba(0, 0, 0, 0.25)",
      buttonColor: "rgba(0, 0, 0, 0.88)",
      buttonSolidCheckedActiveBg: "rgb(3, 79, 129)",
      buttonSolidCheckedBg: "rgb(0, 98, 166)",
      buttonSolidCheckedColor: "rgb(255, 255, 255)",
      buttonSolidCheckedHoverBg: "rgb(0, 124, 205)",
      dotColorDisabled: "rgba(0, 0, 0, 0.25)"
    },
    PopConfirm: {
      zIndexPopup: 2000
    }
  },
  darkComponents: {
    Layout: {
      headerColor: "rgb(255, 255, 255)",
      headerPadding: "0px 20px",
      headerBg: "rgb(17, 17,17)",
      siderBg: "rgb(17, 17,17)",
      triggerBg: "rgb(17, 17,17)",
      bodyBg: "#000000",
      footerBg: "rgb(245, 245, 245)",
      triggerColor: "rgb(255, 255, 255)",
      lightTriggerColor: "rgb(0, 0, 0)",
      lightTriggerBg: "rgb(255, 255, 255)",
      lightSiderBg: "rgb(255, 255, 255)"
    },
    CustomButton: {
      colorPrimary: "#000",
      algorithm: true // Enable algorithm
    },
    PopConfirm: {
      zIndexPopup: 2000
    },
    Tag: {
      defaultBg: "#fafafa",
      defaultColor: "rgba(0, 0, 0, 0.88)"
    },
    Menu: {
      darkItemSelectedBg: "rgb(0, 98, 166)",
      darkItemSelectedColor: "rgb(255,255,255)",
      darkItemBg: "rgb(23,23,23)",
      darkSubMenuItemBg: "rgb(35,35,35)",
      darkItemColor: "rgb(255,255,255)",
      darkItemHoverColor: "rgb(255,255,255)",
      darkItemHoverBg: "rgb(0,0,0)"
    }
  }
};

const customTokens = {
  light: {
    customPrimaryColor: "#000",
    customTextColor: "#fff",
    customFontSizeBase: "14px"
  },
  dark: {
    customPrimaryColor: "#ec238f",
    customTextColor: "#fff",
    customFontSizeBase: "14px"
  }
};

/**
 * Design token for ANTD Styling
 * @param {*} isDarkMode
 * @param {*} theme
 * @returns
 */
export const getDesignTokens = (isDarkMode, theme) => {
  return {
    cssVar: true,
    algorithm: isDarkMode ? theme.defaultAlgorithm : theme.darkAlgorithm,
    token: isDarkMode ? DesignTokens.light : DesignTokens.dark,
    components: isDarkMode ? componentTokens.lightComponents : componentTokens.darkComponents,
    customToken_box: isDarkMode ? customTokens.light : customTokens.dark
  };
};

/**
 * Returns the number rounded to the nearest interval.
 * Example:
 *
 *   roundToNearest(1000.5, 1); // 1000
 *   roundToNearest(1000.5, 0.5);  // 1000.5
 *
 * @param {number} value    The number to round
 * @param {number} interval The numeric interval to round to
 * @return {number}
 */
export const roundToNearest = (value, interval) => {
  return Math.floor(value / interval) * interval;
};

export const formatNumber = (arg) => {
  return new Intl.NumberFormat("en-US").format(arg);
};

// Get current Date String
export const currentDateTimeFormat = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");
  const milliseconds = currentDate.getMilliseconds().toString().padStart(3, "0");

  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  return formattedDateTime;
};

/**
 * Validates token expiration
 * @param {*} token
 * @returns Boolean
 */
export const isTokenValidate = (token) => {
  try {
    const { exp: expirationTime } = jwt_decode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return expirationTime > currentTime;
  } catch (error) {
    // Handle error, token is not valid
    return false;
  }
};

/**
 * User details extraction from token
 * @param {*} token
 * @returns Object {}
 */
export const extractTokenDetails = (token) => {
  try {
    const userDetails = jwt_decode(token);
    return userDetails;
  } catch (error) {
    // Handle error, token is not valid
    return false;
  }
};

// Get get Date String from TimeStamp
export const getDateFromTimestamp = (date) => {
  const currentDate = new Date(date);
  const year = currentDate.getUTCFullYear();
  const month = (currentDate.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getUTCDate().toString().padStart(2, "0");
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getUTCSeconds().toString().padStart(2, "0");
  const milliseconds = currentDate.getUTCMilliseconds().toString().padStart(3, "0");

  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  return formattedDateTime;
};

// Ant design time format
export const getAntDateTimeFormat = (date) => {
  return dayjs(date).utc().local().format("DD-MM-YYYY");
};

// common time format
export const getDateTimeFormat = (date, format = "DD/MM/YYYY hh:mm A") => {
  return dayjs(date).format(format);
};

// common time format
export const getCommonDateTimeFormat = (date) => {
  return dayjs(date).format("MM/DD/YYYY hh:mm:ss A");
};

// utc time
export const getUTCDateTimeFormat = (date, format = "MM/DD/YYYY hh:mm A") => {
  return dayjs(date).utc().format(format);
};

export const toLocalTimeString = (date) => {
  let newDate = new Date(date);
  return newDate.toLocaleTimeString();
};

//file upload validation
export const validateFileSize = (file) => {
  const isJpgOrPng = ALLOWED_FILE_TYPES.includes(file.type);
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < ALLOWED_FILE_SIZE;
  if (!isLt2M) {
    message.error(`Image must be smaller than ${ALLOWED_FILE_SIZE}MB!`);
  }
  return isJpgOrPng && isLt2M;
};

//file upload validation for Gif
export const validateFileSizeGif = (file) => {
  const isJpgOrPng = ALLOWED_IMAGES_GIF.includes(file.type);
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG/GIF file!");
  }
  const isLt2M = file.size / 1024 / 1024 < ALLOWED_FILE_SIZE;
  if (!isLt2M) {
    message.error(`Image must be smaller than ${ALLOWED_FILE_SIZE}MB!`);
  }
  return isJpgOrPng && isLt2M;
};

//PDF file upload validation
export const validateFilePdfSize = (file) => {
  const isJpgOrPng = ALLOWED_FILE_IMAGE_TYPES.includes(file.type);
  if (!isJpgOrPng) {
    message.error("You can only upload Pdf/JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < ALLOWED_FILE_SIZE;
  if (!isLt2M) {
    message.error(`Image must be smaller than ${ALLOWED_FILE_SIZE}MB!`);
  }
  return isJpgOrPng && isLt2M;
};

export const validateImageSize = (file) => {
  const isJpgOrPng = ALLOWED_UPLOAD_FILES.includes(file.type);
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < ALLOWED_FILE_SIZE;
  if (!isLt2M) {
    message.error(`Image must be smaller than ${ALLOWED_FILE_SIZE}MB!`);
  }
  return isJpgOrPng && isLt2M;
};

export const validateImage = (file) => {
  const isJpgOrPng = ALLOWED_UPLOAD_FILES.includes(file.type);
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG/JPEG file!");
  }
  const isLtOrEq5M = file.size / 1024 / 1024 <= ALLOWED_FILE_SIZE;

  if (!isLtOrEq5M) {
    message.error(`Image must be smaller than ${ALLOWED_FILE_SIZE}MB!`);
  }
  return isJpgOrPng && isLtOrEq5M;
};

export const validateSVGForUpload = (file) => {
  const isSVG = ALLOWED_UPLOAD_FILES_PROFILE_MENU.includes(file.type);
  if (!isSVG) {
    message.error("You can only upload SVG file!");
  }
  const isLtOrEq5M = file.size / 1024 / 1024 <= ALLOWED_FILE_SIZE_FOR_SVG;

  if (!isLtOrEq5M) {
    message.error(`Image must be smaller than ${ALLOWED_FILE_SIZE_FOR_SVG}MB!`);
  }
  return isSVG && isLtOrEq5M;
};

export const validateImageMobile = (file) => {
  return new Promise((resolve) => {
    const isJpgOrPng = ALLOWED_UPLOAD_FILES.includes(file.type);
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG/JPEG file!");
      return resolve(false);
    }

    const isLtOrEq5M = file.size / 1024 / 1024 <= 5;
    if (!isLtOrEq5M) {
      message.error("Image must be 5MB or smaller!");
      return resolve(false);
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const isValidResolution = img.width <= 340 && img.height <= 120;
      if (!isValidResolution) {
        message.error(
          `Image resolution must be at most 340x120! (Current: ${img.width}x${img.height})`
        );
        return resolve(false);
      }
      resolve(true);
    };

    img.onerror = () => {
      message.error("Invalid image file!");
      resolve(false);
    };
  });
};

export const validateVideoFileSize = (file) => {
  const isJpgOrPng = ALLOWED_FILE_TYPES.includes(file.type);
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG/MP4 file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 10;
  if (!isLt2M) {
    message.error("File must be smaller than 10MB!");
  }
  return isJpgOrPng && isLt2M;
};

//This method used for calculate image Height and Width
const calculateImageHeightWidth = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let maxWidth = process.env.REACT_APP_MAX_WIDTH || 1024; //1280; // 1024
          let maxHeight = process.env.REACT_APP_MAX_HEIGHT || 1024; //720; //520
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          resolve({ width, height });
        };
        img.onerror = function () {
          reject(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      reject(false);
    }
  });
};

// This is method used to compress image till the size gets achived
const imageCompressFn = async (file, quality, prevsize, imgHW) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const compressedFile = await new Promise((resolve, reject) => {
        const compressor = new Compressor(file, {
          quality: quality,
          maxWidth: imgHW.width,
          maxHeight: imgHW.height,
          // // resize: "contain",
          // // mimeType: "auto",
          convertSize: 150,
          success(result) {
            if (result.size > 150 * 1024 && quality > 0.1 && prevsize != result.size) {
              // Recursively compress with a lower quality
              let qtly = quality > 0.2 ? quality - 0.1 : quality;
              qtly = parseFloat(qtly.toFixed(1));
              resolve(imageCompressFn(file, qtly, result.size, imgHW));
              compressor.abort();
            } else {
              const fileName = `${Date.now()}.${result.type.split("/").pop()}`;
              const renamedFile = new File([result], fileName, { type: result.type });
              resolve(renamedFile);
              compressor.abort();
            }
          },
          error(err) {
            compressor.abort();
            reject(err.message);
          }
        });
      });

      resolve(compressedFile);
    } catch (error) {
      reject(error);
    }
  });
};
export const imageCompress = async (file) => {
  try {
    const prevsize = file.size;

    const imgHW = await calculateImageHeightWidth(file);
    const compressFile = await imageCompressFn(file, 0.8, prevsize, imgHW);

    return compressFile;
  } catch (error) {
    console.log(error, "check error");
    return false;
  }
};

export const TextTruncate = (str, num, dot) => {
  try {
    if (str && str.length > num) {
      if (dot) {
        return str.substring(0, num) + "...";
      } else {
        return str.substring(0, num);
      }
    } else {
      return str;
    }
  } catch (error) {}
};

// Function to return submenu according to route
const searchMenu = (menuItems, term, parent = null) => {
  return menuItems.reduce((result, menuItem) => {
    if (!result && menuItem.path === term) {
      return menuItem;
    }

    if (menuItem.subMenu && menuItem.subMenu.length > 0) {
      return result || searchMenu(menuItem.subMenu, term, menuItem);
    }

    return result;
  }, null);
};

/**
 * Function to get parent the menu only
 */
const returnParentPath = (modulePath) => {
  try {
    let path;
    if (modulePath) {
      path = modulePath;
    } else {
      path = location.pathname;
    }

    const parentPath = path.match(/^\/([^/]+)/);

    return parentPath ? `${parentPath[1]}` : path;
  } catch (error) {
    //
  }
};

// Function for checking the action according to permission
export const actionsPermissionValidator = (modulePath, action) => {
  var slugPermission = JSON.parse(localStorage.getItem("slugPermission"));

  if (slugPermission) {
    const userParsed = slugPermission;
    const currentMenuFromList = searchMenu(MenuList, returnParentPath(modulePath));

    if (userParsed && currentMenuFromList) {
      const filterpermission = userParsed.filter(
        (item) => item.module_slug === currentMenuFromList.module_slug
      );

      return (
        filterpermission?.[0]?.permissions.length > 0 &&
        filterpermission?.[0]?.permissions?.includes(action)
      );
    }
  }
  return false;
};

export const checkSAPValidation = () => ({
  validator(_, value) {
    if (value) {
      if (String(value?.length) > 3) {
        return Promise.resolve();
      }
      return Promise.reject("Minimum 3 characters are required");
    } else {
      return Promise.resolve();
    }
  }
});

export const check3charcterValidation = () => ({
  validator(_, value) {
    if (value) {
      if (String(value?.length) > 3) {
        return Promise.resolve();
      }
      return Promise.reject("Minimum 3 characters are required");
    } else {
      return Promise.resolve();
    }
  }
});

export const checkCharcterValidation = (num) => ({
  validator(_, value) {
    if (value) {
      if (String(value?.length) >= num) {
        return Promise.resolve();
      }
      return Promise.reject(`Minimum ${num} characters are required`);
    } else {
      return Promise.resolve();
    }
  }
});

export const negativeValueValiation = (_, value) => {
  if (value && value < 0) {
    return Promise.reject(new Error("Negative value is not allowed"));
  } else if (value && value == 0) {
    return Promise.reject(new Error("Value must be greater than 0"));
  } else {
    return Promise.resolve();
  }
};

export const negativeValueWithZeroAllowValiation = (_, value) => {
  if (value && value < 0) {
    return Promise.reject(new Error("Negative value is not allowed"));
  } else {
    return Promise.resolve();
  }
};

export const gstValiation = (_, value) => {
  if (value < 0) {
    return Promise.reject(new Error("Negative value is not allowed"));
  } else if (value == 0) {
    return Promise.reject(new Error("Value must be greater than 0"));
  } else {
    return Promise.resolve();
  }
};

export const checkHsnNo = () => ({
  validator(_, value) {
    if (value) {
      if (value > 99 && value < 99999999) {
        return Promise.resolve();
      }
      // return Promise.reject("Value must be greater than 99,999 and less than 99,999,999");
      return Promise.reject("The number must be between 3 and 8 digits long.");
    } else {
      return Promise.resolve();
    }
  }
});

export const checkIfEditorEmpty = (value) => {
  // Check if the content has any text apart from HTML tags
  let textContent = value.replace(/<(.|\n)*?>/g, "").trim();
  // Check if there is at least one image tag
  let hasImage = /<img\s[^>]*src="([^"]+)"[^>]*>/i.test(value);

  return textContent.length === 0 && !hasImage ? "" : value;
};

export const firstlettCapital = (str) => {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
};

export const checkDiscountValue = (form) => ({
  validator(_, val) {
    return new Promise((resolve, reject) => {
      let value = Number(val);
      let minPurchaseAmount = parseInt(form.getFieldValue("minimum_purchase_amount"));
      let discountType = form.getFieldValue("discount_type");

      if (value && discountType && discountType === "percentage" && value > 100) {
        reject("Discount value must be less than or equal to 100");
      } else if (value && minPurchaseAmount && discountType === "fixed") {
        if (value > minPurchaseAmount) {
          reject("Discount value must be less than minimum purchase amount");
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
});

export const checkMinimumPriceValue = (_, val, form) => {
  let value = Number(val);
  let discountVal = parseInt(form.getFieldValue("discount_value"));
  let discountType = form.getFieldValue("discount_type");

  if (value && discountVal && discountType == "fixed") {
    if (value < discountVal) {
      return Promise.reject("Minimum purchase amount must be greater than discount value ");
    } else {
      form.setFields([{ name: "discount_value", errors: [] }]);
      return Promise.resolve();
    }
  }

  return Promise.resolve();
};

// disabled pervious time

export const disabledDateTime = (current) => {
  const now = dayjs();

  if (current && current.isSame(now, "day")) {
    const disabledHours = [];
    const disabledMinutes = [];

    // Disable past hours
    for (let i = 0; i < now.hour(); i++) {
      disabledHours.push(i);
    }

    // Disable past minutes in the current hour
    if (current.hour() === now.hour()) {
      for (let i = 0; i < now.minute(); i++) {
        disabledMinutes.push(i);
      }
    }

    return {
      disabledHours: () => disabledHours,
      disabledMinutes: () => disabledMinutes
    };
  }
  return {};
};

// Validate date Ranage (start time and endTime are not same)

export const validateRange = (_, value) => {
  if (value && value.length === 2) {
    const [startDate, endDate] = value;
    if (dayjs(startDate).isSame(endDate)) {
      return Promise.reject("Start and end date time cannot be the same");
    }
    // Check if end time is at least 5 minutes after the start time
    const minEndTime = dayjs(startDate).add(5, "minute");
    if (dayjs(endDate).isBefore(minEndTime)) {
      return Promise.reject("End time must be at least 5 minutes after the start time");
    }
  }
  return Promise.resolve();
};

export const checkTotalUsageLimit = (form) => ({
  validator(_, val) {
    let value = Number(val);
    let usagePerUser = parseInt(form.getFieldValue("usage_limit_per_user"));

    if (value && usagePerUser) {
      if (value < usagePerUser) {
        return Promise.reject("Total Usage Limit must be grater than Usage Per User");
      } else {
        form.setFields([{ name: "usage_limit", errors: [] }]);
        return Promise.resolve();
      }
    } else {
      return Promise.resolve();
    }
  }
});

export const checkUsagePerUser = (form) => ({
  validator(_, val) {
    let value = Number(val);
    let usageLimit = parseInt(form.getFieldValue("usage_limit"));

    if (value && usageLimit) {
      if (value > usageLimit) {
        return Promise.reject("Usage Per User must be lesser than Total Usage Limit  ");
      } else {
        form.setFields([{ name: "usage_limit", errors: [] }]);
        return Promise.resolve();
      }
    } else {
      return Promise.resolve();
    }
  }
});

export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const extractPlainText = (html) => {
  // Replace HTML tags with an empty string
  return html ? html.replace(/<[^>]*>/g, "") : "";
};

export const capitalizeFirstLetterAndRemoveUnderScore = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
};
export const capitalizeFirstWORDAndRemoveUnderScore = (str) => {
  return str.split("_")[0].toUpperCase() + " " + str.split("_")[1].replace(/_/g, " ");
};

export const capitalizeFirstWORDAndSecondWordFirstLetterCapital = (str) => {
  return str.replace(/(^|_)([a-z])/g, (match) => match.toUpperCase().replace("_", " "));
};

export const convertToUppercaseAndCapitalize = (value, wordsToUppercase = []) => {
  let str = capitalizeFirstWORDAndSecondWordFirstLetterCapital(value)?.replace(/_/g, " ");
  try {
    for (const word of wordsToUppercase) {
      const regexPattern = word.replace(/_/g, "\\b");
      const regex = new RegExp(`\\b${regexPattern}\\b`, "gi");
      str = str.replace(regex, word?.toUpperCase());
    }
  } catch (error) {}
  return str;
};

export const replaceHyphensAndGetTitle = (str) => {
  if (typeof str !== "string" || !str) return "";

  return str
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Get the current time
const currentTime = dayjs();

// Function to disable past times if the selected date is today
export const disablePastTimes = (current, picker) => {
  // If the selected date is today
  if (dayjs(current).isSame(dayjs(), "day")) {
    // Disable times before the current time
    return {
      disabledHours: () => range(0, currentTime.hour()),
      disabledMinutes: () =>
        range(0, currentTime.hour() == dayjs(current).hour() ? currentTime.minute() : 0)
    };
  }
  // For other cases, allow all times
  return {
    disabledHours: () => [],
    disabledMinutes: () => []
  };
};

export const range = (start, end) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

/**
 * Convert ranges for Start and End of the Day
 * @param {*} values
 * @returns
 */

export const convertRangeISODateFormat = (values) => {
  try {
    let range = {};
    range["start"] = dayjs(values[0]).startOf("day").utc().toISOString();
    range["end"] = dayjs(values[1]).endOf("day").utc().toISOString();

    return range;
  } catch (error) {
    console.log(error, "error");
  }
};

export const formatString = (input) => {
  if (input) {
    // Replace underscores with spaces
    let formattedString = input.replace(/_/g, " ");

    // Capitalize the first letter of each word
    formattedString = formattedString.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    return formattedString;
  }
};

// disable future date in datepicker

export const disableFutureDates = (current) => {
  return current && dayjs(current).isAfter(dayjs().endOf("day"), "day");
};

export const disableCurrentAndFutureDates = (current) => {
  return (current && current.isSame(dayjs(), "day")) || current.isAfter(dayjs());
};

export const disableDatesBefore = (current, referenceDate) => {
  return current && dayjs(current).isBefore(dayjs(referenceDate), "day");
};

// disable past date in datepicker
export const disabledDate = (current) => {
  return current && dayjs(current).isBefore(dayjs(), "day");
};

export const disableDateTillToday = (current) => {
  return (
    current && (dayjs(current).isBefore(dayjs(), "day") || dayjs(current).isSame(dayjs(), "day"))
  );
};

export const disablePasscodeStartTime = (current) => {
  return current && current.isBefore(dayjs(), "minute");
};

// remove breadCrumb
export const excludeBreadCrumbs = (pathname, Array = []) => {
  // Check if the pathname includes any of the excluded paths
  const isExcluded = Array.some((path) => pathname.includes(path));
  return isExcluded;
};

export const splitConversion = (value) => {
  try {
    // Split the string by hyphen and underscore, then join with empty space
    const convertedString = value
      .split(/[_-]/) // Use regex to split by both _ and -
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return convertedString;
  } catch (error) {
    // Handle the error as needed
    return null;
  }
};

// validate length and slice
export const validateLength = (e, length = 10) => {
  let value = e.target.value;
  // Remove any non-numeric characters
  value = value.replace(/\D/g, "");
  // Limit the length to 10 characters
  e.target.value = value.slice(0, length);
};

export const uniqueArray = (array1, array2, key) => {
  // Combine the arrays
  const combinedList = [...array1, ...array2];

  // Use a Set to track unique values
  const trackedValues = new Set();
  const uniqueArray = [];

  combinedList.forEach((item) => {
    if (!trackedValues.has(item[key])) {
      trackedValues.add(item[key]);
      uniqueArray.push(item);
    }
  });

  return uniqueArray;
};

// Ant design time format
export const getAntTimeFormat = (date) => {
  return dayjs(date).utc().local().format("h:mm A");
};

// handle to allow only numeric values in the input
export const validationNumber = (e) => {
  const value = e.target.value;
  e.target.value = value.replace(/\D/g, "");
};

// validate otp
export const validateOTP = (_, value) => {
  if (!value) {
    return Promise.reject(LoginModuleError.ENTEROTP);
  }
  if (value.some((v) => v === undefined || v === "") || value.length !== 6) {
    return Promise.reject(LoginModuleError.OTPINVALID);
  }
  if (!value.every((v) => /^\d+$/.test(v))) {
    return Promise.reject(LoginModuleError.OTPINVALID);
  }

  return Promise.resolve();
};
// handle to allow only numeric values in the input for purchase volume
export const validationFloatNumber = (e) => {
  const value = e.target.value;
  e.target.value = value
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1")
    .replace(/^(\d*\.\d{2}).*$/, "$1");
};

export const StringTruncate = (text, length = 10) => {
  // Split the input text into words

  // If there are more than 30 words, slice the first 30 and add "..."
  if (text?.length > length) {
    return text?.slice(0, length) + "...";
  }

  // If there are 30 or fewer words, return the text as is
  return text;
};

// Validate Associate buyer number
export const validateAssociateBuyerNo = (_, value) => {
  if (!value) {
    return Promise.reject("Field are required");
  }
  if (value.length < 3) {
    return Promise.reject("Minium length will be 3");
  }
  if (value.length > 18) {
    return Promise.reject("Maximum length will be 18");
  }
  return Promise.resolve();
};

// status tag

export const statusTag = (value) => {
  switch (value) {
    case USER_STATUS.ACTIVE:
      return (
        <Tag color="success" bordered={true}>
          Active
        </Tag>
      );
    case USER_STATUS.INACTIVE:
      return (
        <Tag color="error" bordered={true}>
          Inactive
        </Tag>
      );
    default:
      return (
        <Tag bordered={true} className="textCapitalize">
          {(value && splitConversion(value)) || "N/A"}
        </Tag>
      );
  }
};
export const validateMobileNo = (rule, value) => {
  if (!value) {
    return Promise.reject(`Registered Mobile Number is required`);
  }
  if (value && !/^[6-9]\d{9}$/.test(value)) {
    return Promise.reject(`Registered Mobile Number is invalid`);
  }
  return Promise.resolve();
};
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const validatePAN = (rule, value) => {
  if (!value) {
    return Promise.reject("PAN Number is required.");
  }
  if (value && !panRegex.test(value)) {
    return Promise.reject("Please enter a valid PAN Number.");
  }
  return Promise.resolve();
};

export const validateAadharNo = (rule, value) => {
  if (!value) {
    return Promise.reject(`Aadhar Number is required`);
  }
  if (value && !/^\d{12}$/.test(value)) {
    return Promise.reject(`Aadhar Number is invalid`);
  }
  return Promise.resolve();
};

export const panInput = (e) => {
  e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
  e.target.value = e.target.value.toUpperCase();
};

// bank accnt validation
export const validatebanAccNo = (_, value) => {
  if (!value) {
    return Promise.reject(`Bank Account Number is required.`);
  }

  // // Check for other validation conditions like length
  // if (value && !bank_acc_num_length?.includes(String(value)?.length)) {
  //   return Promise.reject(`Invalid Bank Account Number`);
  // }
  return Promise.resolve();
};

export const validateABnumber = (rule, value) => {
  try {
    if (!value) {
      return Promise.reject("Associate Buyer Number is required.");
    }

    if (value && !/^\d+$/.test(value)) {
      return Promise.reject("Please enter only numeric digits.");
    }
    if ((value && value.length < 3) || (value && value.length > abNoMaxLength)) {
      return Promise.reject(`Number must be between 3 and ${abNoMaxLength} digits long.`);
    }
    return Promise.resolve();
  } catch (error) {
    console.log(error);
  }
};

export const validateABAndReferenceNumber = (rule, value) => {
  try {
    if (!value) {
      return Promise.reject("Associate Buyer Number / Reference Number is required.");
    }

    if (value && !/^\d+$/.test(value)) {
      return Promise.reject("Please enter only numeric digits.");
    }
    if ((value && value.length < 3) || (value && value.length > abNoMaxLength)) {
      return Promise.reject(`Number must be between 3 and ${abNoMaxLength} digits long.`);
    }
    return Promise.resolve();
  } catch (error) {
    console.log(error);
  }
};

// convert start date and end date

export const convertDateISODateFormat = (values) => {
  try {
    let range = {};
    range["start"] = dayjs(values).startOf("day").utc().toISOString();
    range["end"] = dayjs(values).endOf("day").utc().toISOString();

    return range;
  } catch (error) {
    console.log(error, "error");
  }
};

export const filterdocument = (file = [], fileName = []) => {
  const result = file.reduce((acc, item) => {
    // Check if item doc_type is in the fileName array and if doc_path exists
    if (fileName.includes(item.doc_type) && item.doc_path) {
      // If the doc_type already exists in the accumulator, add the item to the array
      if (!acc[item.doc_type]) {
        acc[item.doc_type] = []; // Initialize as an array if not already
      }
      acc[item.doc_type].push(item); // Add the item to the corresponding doc_type
    }
    return acc;
  }, {}); // Start with an empty object as the accumulator

  return result;
};

// get document["bank_proof", "address_proof", "applicant_photo"]

//Function to validate valid URL
export const linkValidation = (_, value) => {
  if (!/^https?:\/\/[^ "]+$/.test(value)) {
    return Promise.reject("Please enter a valid URL");
  }

  return Promise.resolve();
};

//Function to validate URL only when URL is entered
export const UrlValidation = (_, value) => {
  if (!value) {
    // If no value is entered, skip validation (field is optional)
    return Promise.resolve();
  }

  // Only validate if value is present
  if (!/^https?:\/\/[^ "]+$/.test(value)) {
    return Promise.reject("Please enter a valid URL");
  }

  return Promise.resolve();
};

// This is render the value ( remove underscore, capitalize text)
export const renderColumnData = (value) => {
  if (value !== null && typeof value === "object") {
    let { data } = value;
    return (
      data
        ?.toString()
        ?.replace(/_/g, " ")
        .split(" ")
        .map((word) => {
          if (word == "of") {
            return "of"; // Replace "Of" with "of" (case-sensitive, whole word)
          } else {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
        })
        .join(" ") || "-"
    );
  }

  return (
    value
      ?.toString()
      ?.replace(/_/g, " ")
      .split(" ")
      .map((word) => {
        if (word == "of") {
          return "of"; // Replace "Of" with "of" (case-sensitive, whole word)
        } else {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
      })
      .join(" ") || "-"
  );
};
export const filterDocument = (file = [], fileName = []) => {
  const result = file.reduce((acc, item) => {
    // Check for predefined keys and assign the item to those keys

    if (fileName.includes(item.doc_type) && item.doc_path) {
      acc[item.doc_type] = item;
    }

    return acc;
  }, {});

  return result;
};

export const validateMobileNumber = (rule, value, record) => {
  if (!value) {
    return Promise.reject(` Mobile Number is required`);
  }
  if (value == record) {
    return Promise.reject(`You cannot update to the same mobile number`);
  }
  if (value && !/^[6-9]\d{9}$/.test(value)) {
    return Promise.reject(` Mobile Number is invalid`);
  }
  return Promise.resolve();
};

export const getDocumentPath = (files = [], key) => {
  return (files.length > 0 && files.find((file) => file.doc_type === key)?.doc_path) || null;
};

export const selectFieldRequired = (rule, value) => {
  try {
    if (!value) {
      return Promise.reject("Field is required.");
    }
    return Promise.resolve();
  } catch (error) {}
};

export const validateRemarks = (_, value) => {
  if (!value) {
    return Promise.reject(new Error("Remarks are required."));
  }
  if (value.trim() !== value) {
    return Promise.reject(new Error("Trailing or leading spaces are not allowed."));
  }
  if (value.length < 6) {
    return Promise.reject(new Error("Remarks must be at least 6 characters."));
  }
  if (value.length > 150) {
    return Promise.reject(new Error("Remarks cannot exceed 150 characters."));
  }
  return Promise.resolve();
};

export const validateMobileNoSms = (rule, value) => {
  if (!value) {
    return Promise.reject(`Mobile Number is required`);
  }
  if (value && !/^[6-9]\d{9}$/.test(value)) {
    return Promise.reject(`Mobile Number is invalid`);
  }
  return Promise.resolve();
};

export const downloadExcel = (exportData = []) => {
  // Convert JSON data to a worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Generate the Excel file and trigger the download
  XLSX.writeFile(wb, "SampleSheet.xlsx");
};

//Function to get title by removing underscore and capitalising the first word
export function getTitle(str) {
  if (!str || typeof str !== "string") return ""; // Handle null, undefined, and non-string values

  return str
    .split("_")
    .filter(Boolean) // Filter out any empty strings caused by consecutive underscores
    .map((data) => data.charAt(0).toUpperCase() + data.slice(1).toLowerCase())
    .join(" ");
}

// validate excel file
export const fileUploadHelper = {
  checkFileExtension: (filename, extension) => {
    const regex = new RegExp("\\." + extension + "$", "i");
    return regex.test(filename);
  },
  hasRequiredColumn: (records, requiredColumns) => {
    const hasRequiredColumn = Object.keys(records[0]).some((columnName) =>
      requiredColumns.includes(columnName)
    );
    return hasRequiredColumn;
  },
  getRowsInfo: async (records, key, validation) => {
    const incorrectBuyerRows = {};
    const associateBuyers = {};
    let allRecords = new Set();
    let duplicates = new Set();

    // Looping on all the excel sheet records
    for (let i = 0; i < records.length; i++) {
      let { __rowNum__, ...otherColumns } = records[i];
      let currentNumber = records[i][key];
      associateBuyers[__rowNum__] = {
        ...fileUploadHelper.transformKeysToSnakeCase(otherColumns)
      };

      // Validating Field
      try {
        await validation(null, currentNumber);
      } catch (error) {
        // If Invalid, pushing into array
        incorrectBuyerRows[__rowNum__] = {
          ...fileUploadHelper.transformKeysToSnakeCase(otherColumns),
          error: error
        };
      }

      // Validating Duplicate Entries
      if (allRecords.has(currentNumber)) {
        duplicates.add({ __rowNum__, currentNumber }); // exist
        incorrectBuyerRows[__rowNum__] = {
          ...fileUploadHelper.transformKeysToSnakeCase(otherColumns),
          error: "Duplicate Record"
        };
      } else {
        allRecords.add(currentNumber); // unique
      }
    }
    return { incorrectBuyerRows, associateBuyers };
  },
  transformKeysToSnakeCase: (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = fileUploadHelper.trimHeading(key);
      acc[newKey] = obj[key];
      return acc;
    }, {});
  },
  trimHeading: (text) => text.trim().replace(/\s+/g, "_").toLowerCase(),
  generateTableColumns: (headingArray, incorrectBuyerRows) => {
    let tableColumns = [];

    // Adding Row number
    tableColumns.push({
      title: "Row No.",
      dataIndex: "row_no",
      key: "row_no",
      width: 100,
      render: (value, record) => (
        <>
          <Typography.Text type={record.error ? "danger" : ""}>{value}</Typography.Text>
        </>
      )
    });

    // Sheet Columns
    headingArray.forEach((heading) => {
      tableColumns.push({
        title: heading,
        width: 100,
        dataIndex: fileUploadHelper.trimHeading(heading),
        key: fileUploadHelper.trimHeading(heading),
        render: (value, record) => (
          <Typography.Text type={record.error ? "danger" : ""}>{value}</Typography.Text>
        )
      });
    });

    // Adding Error Column if any incorrect entry found...
    if (Object.keys(incorrectBuyerRows).length > 0) {
      tableColumns.push({
        title: "Error",
        dataIndex: "error",
        key: "error",
        width: 100,
        render: (value, record) => (
          <Typography.Text type={record.error ? "danger" : ""}>{value}</Typography.Text>
        )
      });
    }

    return tableColumns;
  },
  isAnyRowCellEmpty: (columnName = "", records = []) => {
    let isUniform = true;
    let prevRow = records[0]?.__rowNum__; // assigning the first row number which has data

    if (records.length === 0) {
      return; // early return is sheet is empty...
    }

    if (prevRow && prevRow !== 1) {
      return (isUniform = false); // early return is first row is empty...
    }

    // starting loop from 2nd row...
    for (let index = 1; index < records.length; index++) {
      const currentRow = records[index];

      // breaking loop if [ required column data is empty || if row is not in series ]
      if ((columnName && !currentRow[columnName]) || prevRow + 1 !== currentRow.__rowNum__) {
        isUniform = false;
        break;
      } else {
        prevRow = currentRow.__rowNum__;
      }
    }

    return isUniform;
  }
};

// check responsive design
export const isDesktopScreen = (screens) => {
  try {
    return screens.lg || screens.xl || screens.xxl;
  } catch (error) {}
};

// Modify the API Response for KYC
export // Modifying the user response...
const modifyCustomerResponse = (data) => {
  let newData = data ?? {};

  const isIdStopped = !data?.is_terminated && data?.id_stop;
  const isIDUnderDeathCase = data?.death_case;

  // Adding User Details for profile card...
  newData["dist_name"] = data?.dist_name;
  newData["dist_no"] = data?.dist_no;
  newData["member_since"] = data?.member_since || data?.dist_join_date;
  newData["doc_path"] = getDocumentPath(data?.files_meta, "applicant_photo");

  // KYC Info
  newData["KYC_INFO"] = {
    "KYC Status": {
      data: data?.kyc_info?.status ? "Active" : "Inactive",
      tag: data?.kyc_info?.status ? "success" : "error"
    },
    Message: data?.kyc_info?.msg,
    ...(data?.kyc_info?.date
      ? {
          [`${data?.kyc_info?.status ? "KYC OK Date" : "KYC Not OK Date"} `]: getDateTimeFormat(
            data?.kyc_info?.date,
            "DD/MM/YYYY"
          )
        }
      : {}),
    "Last Modified Date":
      data?.kyc_info?.last_date && getDateTimeFormat(data?.kyc_info?.last_date, "DD/MM/YYYY"),
    "Serial Number": data?.kyc_info?.serial_no,
    reference_number: data?.kyc_info?.ref_no,
    feeded_by: data?.kyc_info?.user_by,
    remark: data?.kyc_info?.remark
  };

  // Exception Info
  newData["EXP_INFO"] = (isIDUnderDeathCase || isIdStopped) && {
    message: {
      data: data.exp_info.message,
      tag: "error"
    },
    "Created Date":
      data?.exp_info?.created_on && getDateTimeFormat(data?.exp_info?.created_on, "DD/MM/YYYY"),
    ["Created By"]: data?.exp_info?.created_by,
    ...(data?.exp_info?.new_dist_no && {
      ["New AB Number"]: data?.exp_info?.new_dist_no
    }),
    ...(data?.exp_info?.remark && {
      remark: data?.exp_info?.remark
    })
  };

  // Basic Details
  newData["BASIC_DETAILS"] = {
    sponsor_number: data?.sponsor,
    sponsor_name: data?.sponsor_name,
    proposer_number: data?.proposer,
    proposer_name: data?.proposer_name
  };

  // Sponsor/Proposer Info
  newData["SPONSOR_INFO"] = {
    sponsor_number: data?.sponsor,
    sponsor_name: data?.sponsor_name,
    proposer_number: data?.proposer,
    proposer_name: data?.proposer_name
  };

  // Personal Info
  newData["PERSONAL_INFO"] = {
    ["Name Title"]: data?.personal_details?.applicant_title,
    ["Gender"]: data?.personal_details?.gender,
    ["Applicant Date of Birth"]: data?.personal_details?.applicant_dob
      ? getDateTimeFormat(data?.personal_details?.applicant_dob, "DD/MM/YYYY")
      : null,
    ["Aadhaar Number"]: data?.personal_details?.aadhar_no ? data?.personal_details?.aadhar_no : "-",
    ["Father's Name"]:
      data?.personal_details?.late_father && data?.personal_details?.father_name
        ? `Late. ${data?.personal_details?.father_name}`
        : data?.personal_details?.father_name,
    ["Father's Aadhaar Number"]: "-",
    ["Marital Status"]: { span: 24, data: data?.personal_details?.marital_status },
    ["Spouse Name"]: data?.personal_details?.spouse_name,
    ["Spouse Aadhaar Number"]: "-",
    ["Declaration"]: data?.personal_details?.declaration,
    ["Occupation"]: data?.personal_details?.occupation_info
  };

  // Nominee Info
  newData["NOMINEE_INFO"] = {
    ...(data?.nominee_details?.is_ab && {
      "Nominee AB Number": {
        routerLink: data?.nominee_details?.nominee_ab_no
      }
    }),
    ["Nominee Name"]: data?.nominee_details?.nominee_name,
    ["Nominee Date of Birth"]: data?.nominee_details?.nominee_dob
      ? getDateTimeFormat(data?.nominee_details?.nominee_dob, "DD/MM/YYYY")
      : null,
    ["Nominee Aadhaar Number"]: "-",
    ["Nominee Relation"]: data?.nominee_details?.relation,
    ["Nominee Address"]: {
      span: 12,
      data: data?.nominee_details?.nominee_address
    }
  };

  // Communication Info
  newData["COMMUNICATION_INFO"] = {
    ["Address"]: { span: 24, data: data?.communication_details?.address },
    ["City"]: data?.communication_details?.city,
    ["Pincode"]: data?.communication_details?.pincode,
    ["Tehsil"]: data?.communication_details?.tehsil,
    ["Post"]: data?.communication_details?.post,
    ["State"]: data?.communication_details?.state,
    ["District"]: data?.communication_details?.district_name,
    ["Registered Mobile Number"]: data?.communication_details?.mobile_no,
    ["Alternate Mobile Number"]: data?.communication_details?.whatsapp_mobile_no,
    ["E-Mail"]: { span: 24, data: data?.communication_details?.email }
  };

  // Bank Account Info
  newData["BANK_ACCOUNT_INFO"] = {
    ["Bank Account Number"]: data?.bank_details?.bank_acc_no,
    ["Bank Name"]: data?.bank_details?.bank_name,
    ["Branch Name"]: data?.bank_details?.branch_name,
    ["IFSC Code"]: data?.bank_details?.ifsc_code,
    ["Branch State"]: data?.bank_details?.branch_state,
    ["PAN Number"]: data?.bank_details?.pan_no,
    ["GST Number"]: "-"
  };

  // Assigning Document Photos...
  newData["identity_proof_doc_path"] = getDocumentPath(data?.files_meta, "identity_proof"); // Personal
  newData["identity_proof_doc_name"] = data?.communication_details?.id_proof_doc_name;

  newData["address_proof_doc_path"] = getDocumentPath(data?.files_meta, "address_proof"); // Communication
  newData["address_proof_doc_name"] = data?.communication_details?.address_proof_doc_name;

  newData["bank_proof_doc_path"] = getDocumentPath(data?.files_meta, "bank_proof"); //Bank
  newData["bank_proof_doc_name"] = "Bank Proof";

  newData["pan_proof_doc_path"] = getDocumentPath(data?.files_meta, "pan_proof"); //Pan
  newData["pan_proof_doc_name"] = "Pan Proof";

  // Sponsor/Proposer Info
  newData["AB_NAME_UPDATE_BASIC_DETAILS"] = {
    ["Gender"]: data?.personal_details?.gender,
    ["Marital Status"]: { data: data?.personal_details?.marital_status },
    ["Father's Name"]:
      data?.personal_details?.late_father && data?.personal_details?.father_name
        ? `Late. ${data?.personal_details?.father_name}`
        : data?.personal_details?.father_name,
    ["Spouse Name"]: data?.personal_details?.spouse_name,
    sponsor_number: data?.sponsor,
    sponsor_name: data?.sponsor_name,
    proposer_number: data?.proposer,
    proposer_name: data?.proposer_name
  };

  return newData;
};

// validate image size and image type
export const validateImageSizeAndType = (file) => {
  const isJpgOrPng = ALLOWED_UPLOAD_FILES.includes(file.type);
  if (!isJpgOrPng) {
    message.error("You can only upload JPEG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must be smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

// this method used to handel file after choose
export const handleExcelfile = (file, fileReaderFunction) => {
  try {
    const fileName = file.name.toLowerCase(); // Make the check case-insensitive
    const validExtensions = ["csv", "xlsx", "xls"];
    const fileExtension = fileName.split(".").pop(); // Get the file extension

    if (validExtensions.includes(fileExtension)) {
      fileReaderFunction(file); // Proceed with file reading if valid
      return true; // Allow the file to be uploaded
    } else {
      enqueueSnackbar("Invalid file. Accept only xlsx, xls, CSV", snackBarErrorConf);
      return Upload.LIST_IGNORE; // Prevent upload and ignore the file in the list
    }
  } catch (error) {
    console.error(error);
    return Upload.LIST_IGNORE;
  }
};

export const safeString = (value) => (value || "").toString();

//Function to capitalize first word of string passed
export function capitalizeFirstWord(str) {
  if (!str) return ""; // Handle empty or null input
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

//Function to download excel data
export const downloadExcelData = (data, name, customHeaders = null) => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  let ws;

  if (customHeaders && Array.isArray(customHeaders)) {
    const headerLabels = customHeaders.map((h) => h.label);

    // Create sheet from data but skip auto header
    ws = XLSX.utils.json_to_sheet(data, {
      skipHeader: true,
      origin: "A2"
    });

    // Manually insert custom headers
    XLSX.utils.sheet_add_aoa(ws, [headerLabels], { origin: "A1" });
  } else {
    // Default behavior: generate header from keys
    ws = XLSX.utils.json_to_sheet(data);
  }

  // Make header bold
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });

    if (!ws[cellRef]) continue;

    ws[cellRef].s = {
      font: { bold: true }
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${name || "data"}.xlsx`);
};

//Function to download pdf data in table format
export const downloadJsonAsPDF = (data, fileName) => {
  if (!data || data.length === 0) {
    alert("No data available for download.");

    return;
  }

  // Create a new PDF instance
  const pdf = new jsPDF();

  // Extract column headers from the keys of the first object
  const headers = Object.keys(data[0]);

  // Convert JSON data into table format
  const tableData = data.map((row) => headers.map((header) => row[header]));

  // Add title
  pdf.text(`${fileName}`, 14, 15);

  // Add table using autoTable plugin
  pdf.autoTable({
    startY: 20,
    head: [headers],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [22, 160, 133] } // Custom header color
  });

  // Save the PDF
  pdf.save(`${fileName}.pdf`);
};

export const getRankColor = (rank) => {
  const pinColorMapping = {
    ["BEGINNER"]: "gray",
    ["STARTER"]: "gray",
    ["OPENER"]: "purple",
    ["EAGLE"]: "volcano",
    ["RUNNER"]: "lime",
    ["WINNER"]: "orange",
    ["STAR"]: "gold",
    ["GOLD"]: "gold",
    ["FOUNDER GOLD"]: "gold",
    ["STAR GOLD"]: "gold",
    ["FOUNDER STAR GOLD"]: "gold",
    ["PLATINUM"]: "geekblue",
    ["FOUNDER PLATINUM"]: "geekblue",
    ["STAR PLATINUM"]: "geekblue",
    ["FOUNDER STAR PLATINUM"]: "geekblue",
    ["PEARL"]: "magenta",
    ["FOUNDER PEARL"]: "magenta",
    ["STAR PEARL"]: "magenta",
    ["FOUNDER STAR PEARL"]: "magenta",
    ["EMERALD"]: "green",
    ["FOUNDER EMERALD"]: "green",
    ["STAR EMERALD"]: "green",
    ["FOUNDER STAR EMERALD"]: "green",
    ["RUBY"]: "red",
    ["FOUNDER RUBY"]: "red",
    ["STAR RUBY"]: "red",
    ["FOUNDER STAR RUBY"]: "red",
    ["SAPPHIRE"]: "geekblue",
    ["FOUNDER SAPPHIRE"]: "geekblue",
    ["STAR SAPPHIRE"]: "geekblue",
    ["FOUNDER STAR SAPPHIRE"]: "geekblue",
    ["DIAMOND"]: "blue",
    ["FOUNDER DIAMOND"]: "blue",
    ["STAR DIAMOND"]: "blue",
    ["FOUNDER STAR DIAMOND"]: "blue"
  };

  return pinColorMapping[rank] || "magenta";
};

// this will return the filtered months based on the current year
export const getFilteredMonths = (form, monthsList) => {
  const currentMonth = new Date().getUTCMonth() + 1; // for May, It will be 4 + 1 = 5th....
  const currentYear = new Date().getUTCFullYear();
  const { year, month } = form.getFieldsValue(); // slected year in drop down

  // If current year is selected...
  if (year && currentYear == year) {
    let allowedMonths = monthsList.filter((month) => month.value <= currentMonth); // filtered months

    // empty the months dropdown if currently selected month in not in the YEARS dropdown
    let index = allowedMonths?.findIndex((e) => e.value == month);
    if (index === -1) {
      form.setFieldsValue({ month: null });
    }

    return allowedMonths;
  }

  // return all if selected year is not current year..
  return monthsList || [];
};

// this function will remove the keys passed and return a new object...
export const removeKeysFromObject = (obj, ...keys) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (!keys.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const sanitizeName = (e) => {
  const value = e.target.value;
  e.target.value = value.replace(/[^a-zA-Z\s.'()]/g, "");
};

export const validateNameField = (rule, value) => {
  const trimmedValue = value?.trim();

  if (!value) {
    return Promise.reject("Name is required");
  }

  // Check if there are leading or trailing spaces
  if (value && trimmedValue && value !== trimmedValue) {
    return Promise.reject("Name cannot have leading or trailing spaces.");
  }

  if ((value && value.length < 3) || (value && value.length > 100)) {
    return Promise.reject("Name must be between 3 and 100 characters long.");
  }

  // Check for multiple consecutive spaces between words (double spaces or more)
  if (/ {2,}/.test(trimmedValue)) {
    return Promise.reject("Only one space between words is allowed.");
  }
  return Promise.resolve();
};

export const validateReferenceNumber = (rule, value) => {
  try {
    if (!value) {
      return Promise.reject("Reference Number is required.");
    }

    if (value && !/^\d+$/.test(value)) {
      return Promise.reject("Please enter only numeric digits.");
    }
    if ((value && value.length < 3) || (value && value.length > abNoMaxLength)) {
      return Promise.reject(`Number must be between 3 and ${abNoMaxLength} digits long.`);
    }
    return Promise.resolve();
  } catch (error) {
    console.log(error);
  }
};

export const getFile = (path) => {
  return getFullImageUrl(path);
};
export const formatApplyFilterDates = {
  fieldDate: (date) => {
    let data = dayjs(date, "DD-MM-YYYY");
    return data.format("MM-DD-YYYY");
  },
  conditionalDate: (date) => {
    return dayjs(date).endOf("day").utc().format("MM-DD-YYYY");
  }
};

// Checking If have the required EDIT Permission...
export const hasEditPermission = (path = window.location.pathname) =>
  actionsPermissionValidator(path, PermissionAction.EDIT) ? true : false;

// Checking If have the required ADD Permission...
export const hasAddPermission = (path = window.location.pathname) =>
  actionsPermissionValidator(path, PermissionAction.ADD) ? true : false;

export const getExpectedPickupTime = (secondsLeftForPickup, format = "DD-MM-YYYY ") => {
  // If the seconds are negative, we add them to the current time to calculate the expected pickup time
  const expectedPickup = dayjs().add(secondsLeftForPickup, "seconds");

  // Format it to a more readable format (e.g., "DD-MM-YYYY HH:mm:ss")
  return expectedPickup.format(format);
};

export const getNextFivePickupDates = () => {
  const dates = [];
  const now = new Date();

  let initial = now.getHours() >= 12 ? 1 : 0;
  let daysCount = now.getHours() >= 12 ? 6 : 5;

  let i = initial;

  while (dates.length < daysCount) {
    const date = dayjs().add(i, "day");

    if (date.day() !== 0) {
      // 0 = Sunday
      const label = i == 0 ? "Today" : i == 1 ? "Tommorow" : date.format("DD MMM'YY"); // e.g., "19 May'25"
      const value = date.format("YYYY-MM-DD"); // e.g., "2025-05-15"
      dates.push({ label, value });
    }

    i++;
  }

  return dates;
};

export const imagePath = (image) => {
  try {
    const logoSrc = image?.file_path
      ? image.origin_type === "remote"
        ? image.file_path
        : getFullImageUrl(image.file_path)
      : "";
    return logoSrc;
  } catch (error) {}
};

// Validator for the "Reason" field
export const validateReason = (_, value) => {
  if (!value || value.trim().length === 0) {
    return Promise.reject(new Error("Reason is required"));
  }

  if (value.startsWith(" ")) {
    return Promise.reject(new Error("Reason cannot start with a space"));
  }

  if (value.length > 250) {
    return Promise.reject(new Error("Reason cannot exceed 250 characters"));
  }

  return Promise.resolve(); // If no errors, resolve the promise
};

// Validate fields
export const depotValidateFields = {
  depotCode: (rule, value) => {
    return commonValidation(rule, value, {
      fieldName: "Depot code",
      minLength: 3,
      maxLength: 10,
      extraRegex: {
        code: /^[a-zA-Z0-9]*$/,
        message: "Depot code must be alphanumeric"
      }
    });
  },
  depotName: (rule, value) => {
    return commonValidation(rule, value, { fieldName: "Depot name", minLength: 3, maxLength: 255 });
  },
  city: (rule, value) => {
    return commonValidation(rule, value, { fieldName: "City", minLength: 3, maxLength: 50 });
  },
  addressLine: (rule, value) => {
    return commonValidation(rule, value, { fieldName: "Address", minLength: 3, maxLength: 255 });
  }
};

// profile menu validate record
export const profileMenuValidateFields = {
  moduleName: (rule, value) => {
    return commonValidation(rule, value, {
      fieldName: "Module name",
      minLength: 3,
      maxLength: 100
    });
  }
};

export const commonValidation = (
  _,
  value,
  { fieldName, minLength = 3, maxLength = 100, extraRegex = null }
) => {
  const trimmedValue = value?.trim();

  if (extraRegex && !extraRegex.code.test(value)) {
    return Promise.reject(extraRegex.message);
  }

  if (value && trimmedValue && value !== trimmedValue) {
    return Promise.reject(`${fieldName} cannot have leading or trailing spaces.`);
  }

  if ((value && value.length < minLength) || (value && value.length > maxLength)) {
    return Promise.reject(
      `${fieldName} must be between ${minLength} and ${maxLength} characters long.`
    );
  }

  return Promise.resolve();
};
