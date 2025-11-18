import {
  ClusterOutlined,
  HomeOutlined,
  TagOutlined,
  AppstoreOutlined,
  PlusCircleOutlined,
  SisternodeOutlined,
  GiftOutlined,
  WalletOutlined,
  TagsOutlined,
  EnvironmentOutlined,
  TruckOutlined,
  CloudDownloadOutlined,
  SettingOutlined,
  NotificationOutlined,
  MessageOutlined,
  DeleteOutlined,
  FileDoneOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  UserOutlined
} from "@ant-design/icons";
import { ColorModeContext } from "Helpers/contexts";
import Icon from "@ant-design/icons/lib/components/Icon";
import SVGDualTone from "Components/Shared/SVGDualTone";
import shipingchargesIcon from "Static/img/shippingchargesicon.svg";
import menuManagementIcon from "Static/img/menu_management_logo.svg";
import productsSectionIcon from "Static/img/product_section_logo.svg";
import manageMediaIcon from "Static/img/manage_media.svg";
import featuredCategoryIcon from "Static/img/featured_category.svg";
import websiteTcon from "Static/img/website_logo.svg";
import crmIcon from "Static/img/crmIcon.svg";
import crmIconDarkMode from "Static/img/crmIcondarkMode.svg";
import { useContext } from "react";
import { KycAdminPaths } from "Router/KYCAdminPaths";
import searchByMiscIcon from "Static/img/searchmisc.svg";
import KycIcon from "Static/img/KYC.svg";
import Reports from "Static/KYC_STATIC/img/kyc_report_icon.svg";
import DocUpdateIcon from "Static/KYC_STATIC/img/doc_update.svg";
import UpdateRequestIcon from "Static/KYC_STATIC/img/updateRequestIcon.svg";
import EnableIcon from "Static/img/enableIcon.svg";
import FinanceIcon from "Static/img/finance-icon.svg";
import KYCIcon from "Static/KYC_STATIC/img/kyc_icon.svg";
import defaultIcon from "Static/img/defaultIcon.svg";
import { getTodayDateDDMMYYYY } from "./functions";

export const BASE_URL = "http://localhost:3000/quotes-api";

export const MOBILE_WIDTH = 800; // px

export const ORDERBOOK_LEVELS = 25; // rows count

export const MESSAGES = {
  SUCCESS_LOGIN: "Login Successfully !",
  API_ERROR: "Something Went wrong !",
  OTP_SUCCESS: "OTP Sent Successfully !",
  OTP_VALID: "OTP Is Valid !",
  RESEND_OTP: "OTP Resend Successfully !",
  OTP_NOT_VALID: "OTP Is Not Valid !",
  PASSOWRD_CHANGED: "Password Change Successfully !",
  PROFILE_UPDATED: "Profile Updated Successfully",
  DOCUMENT_UPDATED: "Documents Uploaded Successfully",
  REQUEST_SEND: "Request Send Successfully",
  SETTINGS_UPDATED: "Settings Updated Successfully",
  SETTINGS_UPDATE_FAIL: "Failed To Update Settings",
  SETTINGS_ADDED: "Setting Added Successfully",
  NOT_REQUIRED_PERMISSIONS: "You don't have required permissions"
};
export const LoginModuleError = {
  MOBILENUMBEREQUIRED: "Mobile number is required",
  MOBILENUMBERLENGTH: "Mobile number must be of 10 digit.",
  MOBILENUMBERREGIXMESSAGE: "Invalid mobile number.",
  OTPREQUIRED: "OTP is required",
  OTPINVALID: "OTP is Invalid",
  ENTEROTP: "Please enter otp",
  PASSWORDREQUIRED: "Password is required",
  CONFIRMPASSWORDREQUIRED: "Confirm Password is required",
  MOBILENUMBEREGIX: /^[0-9_]+$/
};

export const RULES_MESSAGES = {
  NO_WHITE_SPACE_MESSAGE: "Please ensure there are no spaces at the beginning or end",
  MIN_MAX_LENGTH_MESSAGE: "The value must be between 1 and 50 characters long.",
  CONSECUTIVE_SPACE_MESSAGE: "Please do not enter more than one consecutive space",
  THREE_To_FIFTY_CHARACTERS_LENGTH: "The value must be between 3 and 50 characters long."
};

export const STATUS = {
  PENDING: "PENDING",
  SENT: "SENT",
  EXPIRED: "EXPIRED",
  NEGOTIATING: "NEGOTIATING",
  ORDER_SUBMITTED: "ORDER SUBMITTED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED"
};

export const ROLE = {
  DEALER: "DEALER",
  INVESTOR: "INVESTOR"
};

export const snackBarSuccessConf = {
  variant: "success",
  anchorOrigin: { vertical: "top", horizontal: "right" }
};

export const snackBarErrorConf = {
  variant: "error",
  anchorOrigin: { vertical: "top", horizontal: "right" }
};
export const snackBarInfoConf = {
  variant: "info",
  anchorOrigin: { vertical: "top", horizontal: "right" }
};
export const snackBarWarningConf = {
  variant: "warning",
  anchorOrigin: { vertical: "top", horizontal: "right" }
};

/**
 * Function to return Icon According to MenuList and breadcrumb Icon
 * @param {*} icon
 * @returns
 */

const IconRenderer = ({ svgElement }) => <SVGDualTone svgElement={svgElement} />;

const ShippingPriceIcon = (props) => (
  <Icon component={() => <IconRenderer svgElement={shipingchargesIcon} />} {...props} />
);
const MenuManagementIcon = (props) => (
  <Icon component={() => <IconRenderer svgElement={menuManagementIcon} />} {...props} />
);
const ProductsSectionIcon = (props) => (
  <Icon component={() => <IconRenderer svgElement={productsSectionIcon} />} {...props} />
);

const MangeMediaIcon = (props) => (
  <Icon component={() => <IconRenderer svgElement={manageMediaIcon} />} {...props} />
);

const FeaturedCategoryIcon = (props) => (
  <Icon component={() => <IconRenderer svgElement={featuredCategoryIcon} />} {...props} />
);

const WebsiteIcon = (props) => (
  <Icon component={() => <IconRenderer svgElement={websiteTcon} />} {...props} />
);
const CrmIconImage = (props) => {
  const { mode } = useContext(ColorModeContext);

  return (
    <Icon
      component={() => <IconRenderer svgElement={mode ? crmIcon : crmIconDarkMode} />}
      {...props}
    />
  );
};

const customSvgIcon = (icon, props) => (
  <Icon component={() => <IconRenderer svgElement={icon} />} {...props} />
);

export const returnMenuIcon = (icon) => {
  if (icon === "dashboard") {
    return <HomeOutlined />;
  } else if (icon === "category") {
    return <ClusterOutlined />;
  } else if (icon === "user") {
    return <UserOutlined />;
  } else if (icon === "tags") {
    return <TagOutlined />;
  } else if (icon === "Brands") {
    return <AppstoreOutlined />;
  } else if (icon === "attributes") {
    return <PlusCircleOutlined />;
  } else if (icon === "variants") {
    return <SisternodeOutlined />;
  } else if (icon === "products") {
    return <GiftOutlined />;
  } else if (icon === "wallet") {
    return <WalletOutlined />;
  } else if (icon === "Offer&Coupon") {
    return <TagsOutlined />;
  } else if (icon === "pincodeStore") {
    return <EnvironmentOutlined />;
  } else if (icon === "cso") {
    return <TruckOutlined />;
  } else if (icon === "shippingPrice") {
    return <ShippingPriceIcon />;
  } else if (icon === "downloads") {
    return <CloudDownloadOutlined />;
  } else if (icon === "configurations") {
    return <SettingOutlined />;
  } else if (icon === "manageNotification") {
    return <NotificationOutlined />;
  } else if (icon === "menuManagement") {
    return <MenuManagementIcon />;
  } else if (icon === "productsSection") {
    return <ProductsSectionIcon />;
  } else if (icon === "featuredCategory") {
    return <FeaturedCategoryIcon />;
  } else if (icon === "manageMedia") {
    return <MangeMediaIcon />;
  } else if (icon === "abMessage") {
    return <MessageOutlined />;
  } else if (icon === "website") {
    return <WebsiteIcon />;
  } else if (icon === "CRM") {
    return <CrmIconImage />;
  } else if (icon === "no") {
    return null;
  } else if (icon == "searchab") {
    return customSvgIcon(searchByMiscIcon);
  } else if (icon == "delete-outlined") {
    return <DeleteOutlined />;
  } else if (icon == "kyc-icon") {
    return customSvgIcon(KycIcon);
  } else if (icon == "reports") {
    return customSvgIcon(Reports);
  } else if (icon == "declaration") {
    return <FileDoneOutlined />;
  } else if (icon == "list") {
    return <UnorderedListOutlined />;
  } else if (icon == "doumentUpdate") {
    return customSvgIcon(DocUpdateIcon);
  } else if (icon == "updateRequest") {
    return customSvgIcon(UpdateRequestIcon);
  } else if (icon == "enableInfo") {
    return customSvgIcon(EnableIcon);
  } else if (icon == "finance-icon") {
    return customSvgIcon(FinanceIcon);
  } else if (icon == "barChart") {
    return <BarChartOutlined />;
  } else if (icon == "kyc-admin") {
    return customSvgIcon(KYCIcon);
  } else {
    return customSvgIcon(defaultIcon);
  }
};

export const tabletWidth = 1024;

/**
 * This will be used for BRANDS, CATS, PRODUCTS,
 */
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "video/mp4"];

export const ALLOWED_IMAGES_GIF = ["image/jpeg", "image/png", "video/mp4", "image/gif"];

/**
 * This will be used for BRANDS, CATS, PRODUCTS,
 */
export const ALLOWED_FILE_IMAGE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

/**
 * This will be used for SIZE CALCULATION IN MB
 */
export const ALLOWED_FILE_SIZE = 5;
export const ALLOWED_FILE_SIZE_FOR_SVG = 3;
export const ALLOWED_UPLOAD_FILES_AB_SCHEDULED_MESSAGES = ["image/jpeg", "image/png", "image/jpg"];
export const ALLOWED_FILE_SIZE_FOR_AB_SCHEDULED_MESSAGES = 5; // 5MB

export const REQUIERD_MESSAGES = {
  variant_attr: {
    message: "Attribute Value is required",
    placeholder: "Enter Attribute Value"
  }
};
export const PermissionAction = {
  ADD: "add",
  EDIT: "edit",
  VIEW: "view",
  DELETE: "delete",
  DOWNLOAD: "download",
  UPLOAD: "upload",
  IMPORT: "import",
  EXPORT: "export",
  BULK_DELETE: "bulk_delete",
  BULK_DOWNLOAD: "bulk_download",
  BULK_UPLOAD: "bulk_upload",
  BULK_IMPORT: "bulk_import",
  BULK_EXPORT: "bulk_export"
};

export const productSampleSheetData = {
  productSheet: [
    {
      "SAP Code": "10001",
      Type: "Master",
      Name: "T-Shirt",
      Brand: "Polo",
      "Dispatch By": "HO",
      Weight: "1000",
      "Net Content": "1",
      Barcode: "123456789",
      "New Arrival": "0",
      // //"Short Description": "it is a long established fact that a reader will be distracted by the readable con",
      "Full Description":
        "t is a long established fact that a reader will be distracted by the readable t is a long established fact that a reader will be distracted by the readable con",
      Category: "Man's Shirt",
      "Min Cart Quantity": "2",
      "Max Cart Quantity": "10",
      "Meta Title": "Test title",
      "Meta Description": "Test Desc",
      "Meta Keyword": "shirt, polo shirt",
      "HSN Number": "999999",
      GST: "8",
      "GST Exempted": 1,
      "Purchase Price": "100",
      MRP: "150",
      "Shipping Price": "20",
      "Sale Price": "130",
      "Purchase Volume": "40",
      "Same Price For All State": "0",
      Parent: "",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "Red, Blue, White",
      "Attribute 1 visible": "1",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "S,M,L,XL",
      "Attribute 2 visible": "1",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10002",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      Barcode: "",
      "Net Content": "1",
      "New Arrival": "0",
      // //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "Red",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "S",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10003",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "Red",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "M",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10004",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "Red",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "L",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10005",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "Red",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "XL",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10006",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "Blue",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "S",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10007",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "Blue",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "L",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10008",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "Blue",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "XL",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10009",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "White",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "S",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10010",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "White",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "M",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10011",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "White",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "L",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    },
    {
      "SAP Code": "10012",
      Type: "Variant",
      Name: "",
      Brand: "",
      "Dispatch By": "",
      "New Arrival": "0",
      "Net Content": "1",
      //"Short Description": "",
      "Full Description": "",
      Category: "",
      "Min Cart Quantity": "",
      "Max Cart Quantity": "",
      "Meta Title": "",
      "Meta Description": "",
      "Meta Keyword": "",
      "HSN Number": "",
      GST: "",
      "GST Exempted": 1,
      "Purchase Price": "",
      MRP: "",
      "Shipping Price": "",
      "Sale Price": "",
      "Purchase Volume": "",
      "Same Price For All State": "",
      Parent: "10001",
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": "White",
      "Attribute 1 visible": "",
      "Attribute 2 name": "Size",
      "Attribute 2 value(s)": "XL",
      "Attribute 2 visible": "",
      "Product Image Link":
        "https://danceloveinclusive.com/cdn/shop/products/mens-classic-tee-red-front-642818f9c5dae_1100x.jpg?v=1680716439, https://rukminim2.flixcart.com/image/850/1000/l37mtu80/t-shirt/g/g/n/s-amg-43-tshirt-fastb-original-imagedkgecxmfzmg.jpeg?q=90&crop=false"
    }
  ],
  productStateSheet: [
    {
      "SAP Code": "10001",
      State: "Rajasthan",
      "Sale Price": "130",
      "PV Price": "40",
      "Shipping Price": "20"
    },
    {
      "SAP Code": "10001",
      State: "Gujarat",
      "Sale Price": "130",
      "PV Price": "40",
      "Shipping Price": "20"
    },
    {
      "SAP Code": "10001",
      State: "Haryana",
      "Sale Price": "130",
      "PV Price": "40",
      "Shipping Price": "20"
    },
    {
      "SAP Code": "10001",
      State: "Himachal Pradesh",
      "Sale Price": "130",
      "PV Price": "40",
      "Shipping Price": "20"
    },
    {
      "SAP Code": "10001",
      State: "Jammu and Kashmir",
      "Sale Price": "130",
      "PV Price": "40",
      "Shipping Price": "20"
    },
    {
      "SAP Code": "10001",
      State: "Karnataka",
      "Sale Price": "130",
      "PV Price": "40",
      "Shipping Price": "20"
    },
    {
      "SAP Code": "10001",
      State: "Kerala",
      "Sale Price": "130",
      "PV Price": "40",
      "Shipping Price": "20"
    },
    {
      "SAP Code": "10001",
      State: "Madhya Pradesh",
      "Sale Price": "130",
      "PV Price": "40",
      "Shipping Price": "20"
    }
  ]
};
export const bulkUploadSampleData = [
  {
    "SAP Code": "10001",
    "Purchase Volume": "40"
  },
  {
    "SAP Code": "10002",
    "Purchase Volume": "20.45"
  }
];

export const updatePriceBulkUpload = [
  {
    "SAP Code": "10001",
    MRP: "129",
    SP: "23",
    PV: "40",
    "Is SP/PV Same In All States": "0",
    "Effective Date": getTodayDateDDMMYYYY()
  },
  {
    "SAP Code": "10002",
    MRP: "123",
    SP: "25",
    PV: "35",
    "Is SP/PV Same In All States": "1",
    "Effective Date": getTodayDateDDMMYYYY()
  }
];

export const statePriceBulkUpload = [
  { "SAP Code": "10001", State: "ANDAMAN AND NICOBAR ISLANDS", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Andhra Pradesh", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Arunachal Pradesh", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Assam", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Bihar", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Chandigarh", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "CHHATTISGARH", SP: "130", PV: "40" },
  {
    "SAP Code": "10001",
    State: "DAMAN AND DIU",
    SP: "130",
    PV: "40"
  },
  { "SAP Code": "10001", State: "Delhi", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Goa", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Gujarat", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Haryana", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Himachal Pradesh", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Jammu and Kashmir", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Jharkhand", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Karnataka", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Kerala", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Lakshadweep", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Madhya Pradesh", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Maharashtra", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Manipur", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Meghalaya", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Mizoram", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Nagaland", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Odisha", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "PUDUCHERRY", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Punjab", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Rajasthan", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Sikkim", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Tamil nadu", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Telangana", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Tripura", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Uttarakhand", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "Uttar Pradesh", SP: "130", PV: "40" },
  { "SAP Code": "10001", State: "West Bengal", SP: "130", PV: "40" }
];

export const instructionsUpdatePrice = [
  {
    "Column Name": "SAP Code",
    Description: "This is the unique SAP code assigned to the master product. It should be numeric."
  },
  {
    "Column Name": "MRP",
    Description: "Enter the MRP for the SAP Code. It should be numeric."
  },
  {
    "Column Name": "SP",
    Description: "Enter the Selling Price for the SAP Code. It should be numeric."
  },
  {
    "Column Name": "PV",
    Description: "Enter the Purchase Volume for the SAP code. It will be a numeric value."
  },

  {
    "Column Name": "Is SP/PV Same In All States",
    Description:
      "Enter the Is SP/PV Same In All States for the SAP code. It will be either 0(No) or 1(Yes)."
  },

  {
    "Column Name": "Effective Date",
    Description:
      "Enter the Effective Date for the SAP code. It should be of Date type in dd/mm/yyyy format and cannot be in the past."
  }
];
export const mappedSheetData = {
  mappedSheet: [
    {
      "AB ID": "123",
      "Wallet Name": "Test",
      "Balance Amount": "2342",
      "Expiry Date of Balance": "23-06-2025",
      "Show On": "Web,App,PUC"
    },
    {
      "AB ID": "321",
      "Wallet Name": "Test",
      "Balance Amount": "3215",
      "Expiry Date of Balance": "24-07-2025",
      "Show On": "Web,PUC"
    }
  ]
};

export const pincodeSheetData = {
  pincodeSheet: [
    {
      "Store Name": "test store name 1",
      Pincode: 302001,
      "Store Code": 12345678
    },
    {
      "Store Name": "test store name 2",
      Pincode: 302002,
      "Store Code": 12345678
    },
    {
      "Store Name": "test store name 3",
      Pincode: 302003,
      "Store Code": 12345678
    },
    {
      "Store Name": "test store name 4",
      Pincode: 302004,
      "Store Code": 12345678
    },
    {
      "Store Name": "test store name 5",
      Pincode: 302005,
      "Store Code": 12345678
    }
  ]
};

export const ABSheetData = {
  ABSheet: [
    {
      "AB Number": 5115,
      "Registration ID": 651651,
      Status: "Active"
    },
    {
      "AB Number": 51315,
      "Registration ID": 65165,
      Status: "Inactive"
    },
    {
      "AB Number": 123,
      "Registration ID": 132,
      Status: "active"
    }
  ],
  AssociateBuyerSheet: [
    { "Associate Buyer": 1001 },
    { "Associate Buyer": 1002 },
    { "Associate Buyer": 1003 },
    { "Associate Buyer": 1004 },
    { "Associate Buyer": 1005 }
  ]
};

/**
 * function to validate password match
 * @param {*} param0
 * @returns
 */
export const passwordMatchedValidator = ({ getFieldValue }) => ({
  validator(_, value) {
    if (!value || getFieldValue("password") === value) {
      return Promise.resolve();
    }

    return Promise.reject("Confirm password not matched !");
  }
});

/**
 * function to validate password match
 * @param {*} param0
 * @returns
 */
export const confirmPasswordMatchedValidator = ({ getFieldValue }) => ({
  validator(_, value) {
    if (!value || getFieldValue("confirm_password") === value) {
      return Promise.resolve();
    }

    return Promise.reject(" password not matched !");
  }
});

/**
 * function to validate mobile number
 * @param {*} _
 * @param {*} value
 * @returns
 */
export const validateMobile = (_, value) => {
  if (value && (value.length < 10 || value.length > 10)) {
    return Promise.reject(LoginModuleError.MOBILENUMBERLENGTH);
  }

  if (value && !LoginModuleError.MOBILENUMBEREGIX.test(value)) {
    return Promise.reject(LoginModuleError.MOBILENUMBERREGIXMESSAGE);
  }

  return Promise.resolve();
};

/**
 * function  to validate otp
 * @param {*} _
 * @param {*} value
 * @returns
 */
export const validateOTP = (_, value) => {
  if (!value || value.includes(undefined) || value.includes("")) {
    return Promise.reject(LoginModuleError.OTPINVALID);
  }

  return Promise.resolve();
};

export const depotList = [
  {
    value: "delhi",
    label: "Delhi"
  },
  {
    value: "jaipur",
    label: "Jaipur"
  },
  {
    value: "noida",
    label: "Noida"
  }
];

export const dispatchBy = [
  { label: "PUC", value: "PUC" },
  { label: "Depot", value: "Depot" }
  // { label: "Head Office", value: "HO" }
];

export const otherUsergroup = [
  { label: "All", value: "all" },
  { label: "DIST", value: "DIST" },
  { label: "CUST", value: "CUST" },
  { label: "REG", value: "REG" },
  { label: "DEPO", value: "DEPO" },
  // { label: "PUC", value: "PUC" },
  { label: "BZR", value: "BZR" },
  { label: "WW", value: "WW" },
  { label: "WWQ", value: "WWQ" },
  { label: "WWP", value: "WWP" },
  { label: "KSO", value: "KSO" },
  { label: "DW", value: "DW" }
];

export const pucUsergroup = [
  { label: "All", value: "all" },
  { label: "DIST", value: "DIST" },
  { label: "CUST", value: "CUST" },
  { label: "REG", value: "REG" }
];

export const userDownloadGroup = [
  { label: "All", value: "all" },
  // { label: "DIST", value: "DIST" },
  // { label: "CUST", value: "CUST" },
  // { label: "REG", value: "REG" },
  // { label: "DEPO", value: "DEPO" },
  // { label: "PUC", value: "PUC" },
  // { label: "BZR", value: "BZR" },
  { label: "WW", value: "wonder_world" },
  { label: "WWQ", value: "wonder_world_quick" },
  { label: "WWP", value: "wonder_world_prime" },
  { label: "KSO", value: "keysoul_store" },
  { label: "DW", value: "display_wall" }
];

export const paymentMethods = [
  // { label: "All", value: "all" },
  { label: "Online Payment (Prepaid)", value: "prepaid" },
  // { label: "Pick up at Nearest Store", value: "pick up at nearest store" },
  { label: "Cash On Delivery (COD)", value: "cod" }
];

export const whiteSpaceDecimalandValueGreaterthanZERO = [
  { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
  {
    pattern: /^[1-9]\d*$/,
    message: "Value must be greater than 0 and decimal value is not allowed"
  }
];

export const shippingChargeOptions = [
  { label: "Price", value: "price" },
  // { label: "Weight", value: "weight" },
  { label: "Always", value: "always" }
];

export const productExportKeys = [
  "SAP Code",
  "Type",
  "Name",
  "Brand",
  "Barcode",
  "Dispatch By",
  "New Arrival",
  "Weight",
  "Net Content",
  "Short Description",
  "Full Description",
  "Category",
  "Min Cart Quantity",
  "Max Cart Quantity",
  "Meta Title",
  "Meta Description",
  "Meta Keyword",
  "HSN Number",
  "GST",
  "GST Exempted",
  "Purchase Price",
  "MRP",
  "Shipping Price",
  "Sale Price",
  "Purchase Volume",
  "Same Price For All State",
  "Parent",
  "Attribute 1 name",
  "Attribute 1 value(s)",
  "Attribute 1 visible",
  "Attribute 2 name",
  "Attribute 2 value(s)",
  "Attribute 2 visible",
  "Attribute Display Order",
  "Images"
];

export const allSupportedStores = [
  "wonder_world",
  "wonder_world_quick",
  "keysoul_store",
  "display_wall"
];

export const categorySheetData = {
  categorySheet: [
    {
      "Category Name": "Test Category",
      "Display Order": 1,
      // "Is Featured": 0,
      Description: "Category's description",
      Status: "active",
      // "Show On Type": "web" + "," + "app",
      // "Supported Stores": "wonder_world" + "," + "wonder_world_quick" + "," + "keysoul_store" + "," + "display_wall",
      "Parent Category": "",
      "Category Image": "https://picsum.photos/200",
      "Banner Image": "https://picsum.photos/200",
      "Banner Mobile Image": "https://picsum.photos/200"
    }
  ]
};

export const brandSheetData = {
  brandSheet: [
    {
      "Brand name": "Test Brand",
      Description: "Brand's description",
      "Brand Logo Image": "https://picsum.photos/200",
      "Banner Image": "https://picsum.photos/200",
      "Banner Mobile Image": "https://picsum.photos/200",
      Status: "active"
    }
  ]
};

export const sliderTypeOptions = [
  { label: "URL", value: "url" },
  // { label: "API", value: "api" },
  { label: "PAGE", value: "page" },
  { label: "MESSAGE", value: "message" },
  { label: "YOUTUBE LINK", value: "youtube_url" }
];

export const webORAppOptions = [
  { label: "Web", value: "web" },
  { label: "App", value: "app" }
  // { label: "Both", value: "both" }
];

export const settingTypeOptions = [
  { label: "Text", value: "text" },
  { label: "Switch", value: "switch" },
  { label: "Number", value: "number" },
  { label: "Image", value: "image" },
  { label: "Editor", value: "editor" }
];
export const settingTypeEcomOptions = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" }
];

export const advancedExampleData = {
  dummyId: 1,
  dummyInfo: { email: "fake1@example.com", phone: "79000000001" },
  role: "dummy role",
  maxLength: 15,
  minLength: 2,
  prefix: false,
  suffix: false
};

export const generalExampleData = {
  dummyId: 1,
  dummyInfo: { email: "fake1@example.com", phone: "79000000001" },
  role: "dummy role"
};
export const generalSettings = {
  email: "fake1@example.com",
  phone: "79000000001"
};

export const DATEFORMAT = {
  RANGE_FORMAT: "DD-MM-YYYY"
};

export const menuTupeOptions = [
  {
    label: "Category",
    value: "Category"
  },
  {
    label: "Category Mega Menu",
    value: "Category Mega Menu"
  },
  {
    label: "Brand",
    value: "Brand"
  },
  {
    label: "Link",
    value: "Link"
  },
  {
    label: "Page",
    value: "Custom"
  }
];

export const productSectionSheetData = {
  productSectionSheet: [
    {
      "SAP Code": "999999"
    }
  ]
};

export const SECTION_CATEGORY = [
  {
    label: "Trending",
    value: "is_trending"
  },
  {
    label: "Featured",
    value: "is_featured"
  },
  {
    label: "Promotion",
    value: "is_promotion"
  }
];

export const pageSizeOptions = ["5", "10", "20", "50", "100"];

export const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

export const valueUptoTwoDecimalValueRegex = /^\d*(\.\d{0,2})?$/;

// exclude path

export const excludedPaths = [
  "product_add",
  "product_edit",
  "keysoul-template",
  "crm",
  "crm-order-view",
  "orders",
  "order-view",
  "generate-business",
  ...Object.values(KycAdminPaths)
];

// excludedBreadCrumb
export const excludedBreadCrumb = ["crm", ...Object.values(KycAdminPaths)];

export const typesOfOffer = [
  {
    value: "buy_x_get_y_free",
    label: "Buy X Qty Get Y Qty Free"
  },
  {
    value: "buy_x_amount_of_products_and_get_a_product_free",
    label: "Buy X amount of Product and get a product free"
  },
  {
    value: "buy_x_amount_of_products_and_get_a_product_on_y_prices_or_get_y%_discount",
    label: "Buy X amount of Products and get A product on Y prices or get Y% discount"
  },
  {
    value: "bundle_deal",
    label: "Bundle Deal / Progressive Deal"
  },
  {
    value: "buy_x_get_y_eligible",
    label: "Buy X[ ], Get Y Eligible"
  },
  // {
  //   value: "free_shipping",
  //   label: "Free Shipping"
  // },
  {
    value: "default_offer",
    label: "Default"
  }
];

export const supportedStoresOptions = [
  { label: "Wonder World", value: "wonder_world" },
  { label: "Wonder World Quick", value: "wonder_world_quick" },
  { label: "Wonder World Prime", value: "wwp" },
  { label: "Keysoul Store", value: "keysoul_store" },
  { label: "Display Wall", value: "display_wall" }
];

export const applicableBuyerType = [
  { label: "DIST (Associate Buyer)", value: "DIST" },
  { label: "CUST (Customer Buyer)", value: "CUST" },
  { label: "REG (Register Buyer)", value: "REG" },
  { label: "DW (Display Wall)", value: "DW" }
];

export const GST_VALUES = [
  { label: 0, value: 0 },
  { label: 5, value: 5 },
  { label: 12, value: 12 }
  // { label: 18, value: 18 }
];
export const APPLICABLE_ON_TYPES = [
  { value: "all", label: "All" },
  { value: "brands", label: "Brand" },
  { value: "categories", label: "Category" }
];

// Function to format labels
export const formatLabel = (label) => {
  return label
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

export const RESOURCE_TYPES = [
  {
    value: "pos",
    label: "POS"
  },
  {
    value: "e-com",
    label: "E-COM"
  }
];

export const RESORCE_USER_TYPES = [
  {
    value: "keysoul_store",
    label: "Keysoul Store"
  },
  {
    value: "wonder_world",
    label: "Wonder World"
  },
  {
    value: "wonder_world_quick",
    label: "Wonder World Quick"
  },
  {
    value: "display_wall",
    label: "Display Wall"
  }
];

export const DISCOUNT_TYPE = [
  {
    value: "percentage",
    label: "Percentage"
  },
  {
    value: "fixed",
    label: "Fixed"
  }
];

export const PROGRAM_TYPE = [
  {
    value: "rcm_zonal_celebration_program",
    label: "RCM ZONAL CELEBRATION PROGRAM"
  },
  {
    value: "rcm_ulp_program",
    label: "RCM ULP PROGRAM"
  }
];

export const WALLET_TYPES = [
  { value: "brand", label: "Brand" },
  { value: "category", label: "Category" },
  { value: "product", label: "Product" },
  { value: "generic", label: "Generic" }
];

export const MEETING_TYPE = [
  {
    value: "wwq",
    label: "WWQ"
  },
  {
    value: "open",
    label: "OPEN"
  }
];

export const URL_VALIDATION_REGEX =
  /^(https?:\/\/)[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(:\d+)?(\/[^\s?#]*)?(\?[^\s#]*)?(#[^\s]*)?$/;

export const templateOptions = [
  { label: "Default", value: "default" },
  { label: "Keysoul", value: "keysoul" }
];

export const FALL_BACK =
  "data:image/png;base64,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";

export const NOTICESSHOWONLIST = [
  { label: "Default", value: "default" },
  { label: "Keysoul", value: "keysoul" }
];

export const KYC_TERMINATE_REMARK = [
  { label: "Document are incorrect", value: "Document are incorrect" },
  { label: "Image are not clear", value: "Image are not clear" }
];
export const USER_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive"
};

export const E_KYC_LIST_TYPE = [
  {
    label: "E-Registration",
    value: "e_registration"
  },
  {
    label: "E-Registration Edit",
    value: "e_registration_edit"
  },
  {
    label: "ID Activation",
    value: "id_activation"
  },
  {
    label: "Account Check",
    value: "account_check"
  },
  {
    label: "Old KYC",
    value: "old_kyc"
  },
  {
    label: "Auto Check",
    value: "auto_check"
  }
];

// This method will return the Months array
export const getMonths = () => {
  return [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];
};

// This method will return the last 100 years from CURRENT YEAR...
export const getYears = () => {
  let startYear = new Date().getFullYear();
  const years = [{ value: startYear, label: startYear }];
  for (let index = 1; index < 100; index++) {
    years.push({ value: startYear - index, label: startYear - index });
  }
  return years;
};

// KYC Status

export const KYC_STATUS = {
  OK: "KYC OK",
  NOT: "KYC NOT OK"
};

export const abNoMaxLength = 18;
export const aadharNumberMaxLength = 12;
export const languageOption = [
  {
    label: "English",
    value: 1
  },
  {
    label: "Hindi",
    value: 2
  }
];

export const monthsArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

// dummy data for sms diamond club demo sheet

export const SMS_EXPORT_DATA = [
  { "Mobile Number": "7615811280" },
  { "Mobile Number": "7737640687" },
  { "Mobile Number": "8209372075" }
];

// Meeting Type

export const MEETING_TYPE_KEY = {
  WWQ: "wwq",
  ULP_QUICK: "ulp_quick"
};

// MEETING STATUS => USED IN (AB MODULE : CHECK MONTHLY MEETING)
export const MEETING_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected"
};

export const ALLOWED_UPLOAD_FILES = ["image/jpeg", "image/png", "image/jpg"];
export const ALLOWED_UPLOAD_FILES_PROFILE_MENU = ["image/svg+xml"];
export const USER_TYPES = ["DIST", "CUST", "REG", "DEPOT", "PUC", "BZR", "WW", "WWQ", "KSO"];
export const DEVICE_TYPES = ["web", "app"];

export const RejectionReason = { Other: 15 };

export const batchTypes = [
  { label: "Buniyaad", value: "Buniyaad" },
  { label: "Main", value: "Main" },
  { label: "Sewa", value: "Sewa" },
  { label: "Udaan", value: "Udaan" }
];

export const MDM_PAGINATION = ["5", "10", "20", "50"];
export const abBankDetails = {
  bank_name: {
    fieldName: "bank_code",
    validations: [
      {
        required: true,
        message: `Bank Name is required`
      }
    ]
  },
  branch_state: {
    fieldName: "branch_state_code",
    validations: [
      {
        required: true,
        message: `Branch State is required`
      }
    ]
  },
  branch_name: {
    fieldName: "branch_name",
    validations: [
      {
        required: true,
        message: `Branch Name is required`
      }
    ]
  },
  bank_acc_no: {
    fieldName: "bank_acc_no"
  },
  bank_proof: {
    fieldName: "bank_proof",
    validations: [
      {
        required: true,
        message: `Bank Account Proof Photo is required`
      }
    ]
  }
};

export const monthsMapping = {
  1: "jan",
  2: "feb",
  3: "mar",
  4: "apr",
  5: "may",
  6: "jun",
  7: "jul",
  8: "aug",
  9: "sep",
  10: "oct",
  11: "nov",
  12: "dec"
};

export const bankAccountNumberValidation = {
  regex: new RegExp(/^(?=.*[1-9]).*$/),
  message: "Bank account number must contain at least one non-zero digit"
};

export const STORES = {
  keysoul_store: "Keysoul Store",
  wonder_world: "Wonder World",
  wonder_world_quick: "Wonder World Quick",
  display_wall: "Display Wall"
};

export const CART_TYPE = {
  PUC: "puc",
  DEPOT: "depot"
};

export const BUSINESS_GENERATION_STEPS = {
  BASE_STEP: "base_step",
  PERFORMANCE_CALCULATED: "performance_calculated",
  PROCESS_STARTED: "process_started",
  NET_AMOUNT_CALCULATED: "generated_net_amt",
  TDS_CALCULATED: "tds_sync",
  FINAL_BUSINESS_CALCULATED: "gst_sync"
};

export const KYC_SCHEDULE_MAINTENANCE = "kyc-schedule-maintenance";

// Converts 12-hour time (e.g. "02:30 PM") to total minutes
const timeStringToMinutes = (t) => {
  if (!t) return 0; // fallback
  const [time, modifier] = t.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier == "PM" && hours != 12) hours += 12;
  if (modifier == "AM" && hours == 12) hours = 0;
  return hours * 60 + minutes;
};

// Sorts objects by time in ascending order
export const timeSorter = (a, b) => timeStringToMinutes(a.time) - timeStringToMinutes(b.time);

export const Price_obj = {
  MRP: "MRP",
  SP: "S.P.",
  PV: "P.V."
};

export const bankAccountLengthOptions = [
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
  { label: "13", value: 13 },
  { label: "14", value: 14 },
  { label: "15", value: 15 },
  { label: "16", value: 16 },
  { label: "17", value: 17 },
  { label: "18", value: 18 }
];
