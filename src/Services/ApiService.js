/**
 * API Service for handle http request
 */
export class ApiService {
  basePath = "";
  middleware = "";
  constructor(basePath, middleware = {}) {
    this.basePath = basePath;
    this.middleware = middleware;
  }

  // Generic request for all the endpoints
  async httpRequest(method, path, body, options = {}) {
    let response;

    try {
      let token = localStorage.getItem("Authorization");
      response = await fetch(`${this.basePath}${path}`, {
        method,
        headers: {
          ...(options.multiPart ? {} : body ? { ["Content-Type"]: "application/json" } : {}),
          // ...(options.location ? {} : { Authorization: `Bearer ${token}` })
          ...{ Authorization: `Bearer ${token}` }
        },
        body: options.multiPart ? body : body ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      if (e instanceof Error) {
        this.middleware.onError?.(e);
        return;
      }
    }
    // handle if error from API
    if (response && response.ok) {
      try {
        return await response.json();
      } catch (e) {
        if (e instanceof Error) {
          this.middleware.onError?.(e);
        }

        throw e;
      }
    } else {
      // handle all other errors
      await this.handleResponseError(response);
    }
  }

  async httpRequestBlob(method, path, body, options = {}) {
    let response;

    try {
      let token = localStorage.getItem("Authorization");
      response = await fetch(`${this.basePath}${path}`, {
        method,
        headers: {
          ...(options.multiPart ? {} : body ? { ["Content-Type"]: "application/json" } : {}),
          // ...(options.location ? {} : { Authorization: `Bearer ${token}` })
          ...{ Authorization: `Bearer ${token}` }
        },
        body: options.multiPart ? body : body ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        this.middleware.onError?.(e);
        return;
      }
    }
    // handle if error from API
    if (response && response.ok) {
      try {
        const blob = await response.blob();

        // Extract filename from headers
        const disposition = response.headers.get("Content-Disposition");
        let filename = "download.csv";
        if (disposition && disposition.includes("filename=")) {
          filename = disposition.split("filename=")[1].split(";")[0].replace(/"/g, "");
        }

        // Download the blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return; // no need to return blob
      } catch (e) {
        if (e instanceof Error) {
          this.middleware.onError?.(e);
        }
        throw e;
      }
    } else {
      await this.handleResponseError(response);
    }
  }

  // Handle API response errors
  async handleResponseError(response) {
    let json;
    try {
      json = await response.json();
    } catch (e) {
      json = e;
    }
    this.middleware.onError?.(json);
    throw json;
  }

  //  API To Make Get Request for Common API
  getRequest(apiUrl) {
    return this.httpRequest("GET", `${apiUrl}`, null);
  }
  //  API To Make Get Request for Common API
  getRequestWithParams(apiUrl) {
    return this.httpRequest("GET", `${apiUrl}`, null);
  }
  //  API call to Make Get Request for fetching categories by brand
  getCategoryByBrand(brandId) {
    return this.httpRequest("GET", `/brands/get-all-categories/${brandId}`, null);
  }

  /**
   * Login Request API Call
   * @param {*} data
   * @returns
   */
  adminLogin(data) {
    return this.httpRequest("POST", `/generic/users/login-user`, data);
    // return true;
  }
  /**
   * export products API Call
   * @param {*} data
   * @returns
   */
  exportProducts(data) {
    return this.httpRequestBlob("POST", `/generic/export/products`, data);
    // return true;
  }
  getCategoryDropDownForExport(data) {
    return this.httpRequest("POST", `/generic/export/category-dropdown`, data);
    // return true;
  }
  getBrandDropDownForExport(data) {
    return this.httpRequest("POST", `/generic/export/brand-dropdown`, data);
    // return true;
  }
  /**
   * export category API Call
   * @param {*} data
   * @returns
   */
  exportCategory(data) {
    return this.httpRequestBlob("POST", `/generic/export/category`, data);
    // return true;
  }
  /**
   * export brands API Call
   * @param {*} data
   * @returns
   */
  exportBrands(data) {
    return this.httpRequestBlob("POST", `/generic/export/brand`, data);
    // return true;
  }

  /**
   * Create Tag API Call
   * @param {*} data
   * @returns
   */
  createTag(data, multiPart = true) {
    return this.httpRequest("POST", `/tags`, data, { multiPart });
  }

  /**
   * Update Tag API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updateTag(data, id) {
    return this.httpRequest("PUT", `/tags/${id}`, data, { multiPart: true });
  }

  /**
   * Delete Tag API Call
   * @param {*} data
   * @returns
   */
  deleteTag(data) {
    return this.httpRequest("DELETE", `/tags`, data);
  }

  /**
   * Create Variant API Call
   * @param {*} data
   * @returns
   */
  createVariant(data) {
    return this.httpRequest("POST", `/attributeValues`, data);
  }

  /**
   * Update Variant API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updateVariant(data, id) {
    return this.httpRequest("PUT", `/attributeValues/${id}`, data);
  }

  /**
   * Delete Variant API Call
   * @param {*} data
   * @returns
   */
  deleteVariant(data) {
    return this.httpRequest("DELETE", `/attributeValues`, data);
  }

  /**
   * Create product basic details
   */

  createBasicDetails(data) {
    return this.httpRequest("POST", "/products/basic-details", data);
  }

  /**
   * Update product basic details
   */

  updatedBasicDetails(data, id) {
    return this.httpRequest("PUT", `/products/basic-details/${id}`, data);
  }

  /**
   * Update media details
   */

  updatedMediaDetails(data, id, multiPart = false) {
    return this.httpRequest("POST", `/products/media-details/${id}`, data, { multiPart });
  }

  /**
   * Update seo details
   */

  updatedSeoDetails(data, id) {
    return this.httpRequest("POST", `/products/seo-details/${id}`, data);
  }

  /**
   * Update Attributes details
   */

  updatedAttributesDetails(data, id) {
    return this.httpRequest("POST", `/products/attributes/${id}`, data);
  }

  /**
   * Update Variant details
   */

  updatedVariantDetails(data, id, multiPart = true) {
    return this.httpRequest("POST", `/products/variants/${id}`, data, { multiPart });
  }
  /**
   * Delete Variant details
   */

  deleteVariantDetails(id) {
    return this.httpRequest("DELETE", `/products/variants/${id}`, null);
  }

  /**
   * function to fetch wallet brand data
   * @returns
   */
  getWalletBrandDetails() {
    return this.httpRequest(
      "GET",
      `/wallets/brands/all/0/100?filterTerm={"status" : "active"}&sortOrder=desc`,
      null
    );
  }

  /**
   * function to fetch wallet category data
   * @returns
   */
  getWalletCategoryDetails() {
    return this.httpRequest(
      "GET",
      `/wallets/categories/all/0/1000?filterTerm={"status" : "active"}&sortOrder=desc`,
      null
    );
  }

  /**
   * function to fetch wallet product data
   * @returns
   */
  getWalletProductDetails(val = null) {
    if (val) {
      return this.httpRequest(
        "GET",
        `/wallets/products/all/0/1000?sortOrder=desc&searchTerm=${val}`,
        null
      );
    } else {
      return this.httpRequest("GET", `/wallets/products/all/0/1000?sortOrder=desc`, null);
    }
  }

  /**
   * Update Coupon API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updateCoupon(data, id) {
    return this.httpRequest("PUT", `/coupons/${id}`, data);
  }

  /**
   * Delete Coupon API Call
   * @param {*} data
   * @returns
   */
  deleteCoupon(data) {
    return this.httpRequest("DELETE", `/coupons`, data);
  }

  /**
   * function to fetch coupon brand data
   * @returns
   */
  getCouponBrandDetails() {
    return this.httpRequest(
      "GET",
      `/coupons/brands/all/0/100?filterTerm={"status" : "active"}&sortOrder=desc`,
      null
    );
  }
  /**
   * function to fetch coupon category data
   * @returns
   */
  getCouponCategoryDetails() {
    return this.httpRequest(
      "GET",
      `/coupons/categories/all/0/100?filterTerm={"status" : "active"}&sortOrder=desc`,
      null
    );
  }
  /**
   * function to fetch coupon product data
   * @returns
   */
  getCouponProductDetails(val) {
    if (val) {
      return this.httpRequest(
        "GET",
        `/coupons/products/all/0/200?sortOrder=desc&searchTerm=${val}`,
        null
      );
    } else {
      return this.httpRequest("GET", `/coupons/products/all/0/200?sortOrder=desc`);
    }
  }

  /**
   * function to fetch offers brand data
   * @returns
   */
  getOffersBrandDetails() {
    return this.httpRequest(
      "GET",
      `/offers/brands/all/0/100?filterTerm={"status" : "active"}&sortOrder=desc`,
      null
    );
  }
  /**
   * function to fetch offers category data
   * @returns
   */
  getOffersCategoryDetails() {
    return this.httpRequest(
      "GET",
      `/offers/categories/all/0/100?filterTerm={"status" : "active"}&sortOrder=desc`,
      null
    );
  }
  /**
   * function to fetch offers product data
   * @returns
   */
  getOffersProductDetails() {
    return this.httpRequest(
      "GET",
      `/offers/products/all/0/100?filterTerm={"status" : "active"}&sortOrder=desc`,
      null
    );
  }

  /**
   * function to fetch wallet product data
   * @returns
   */
  getMappedProductDetails(id) {
    return this.httpRequest("GET", `/walletmaps/${id}`, null);
  }

  /**
   * get Variant details
   */

  getVariantDetails(id) {
    return this.httpRequest("GET", `/products/variants/${id}`, null);
  }

  /**
   * Update Price Detail
   */

  updatedPriceDetails(data, id) {
    return this.httpRequest("POST", `/products/price-details/${id}`, data);
  }
  /**
   * Get Seo details
   */

  getSeoDetails(id) {
    return this.httpRequest("GET", `/products/seo-details/${id}`, null);
  }

  /**
   * Get Price details
   */

  getPriceDetails(id) {
    return this.httpRequest("GET", `/products/price-details/${id}`, null);
  }
  /**
   * Get all state details
   */

  getAllState() {
    return this.httpRequest("GET", `/products/countryStates/0/100`, null);
  }

  /**
   * Get all department for employee
   */

  getAllDepartment() {
    return this.httpRequest("GET", `/employee/all-departments`, null);
  }

  /**
   * Get all company for employee
   */

  getAllCompany() {
    return this.httpRequest("GET", `/employee/all-company`, null);
  }

  /**
   * Get Attributes details
   */

  getAttributesDetails(id) {
    return this.httpRequest("GET", `/products/attributes/${id}`, null);
  }

  /**
   * Get product  basic details
   */

  getBasicDetails(id) {
    return this.httpRequest("GET", `/products/basic-details/${id}`, null);
  }

  /**
   * Get Media details
   */

  getMediaDetails(id) {
    return this.httpRequest("GET", `/products/media-details/${id}`, null);
  }
  /**
   * Create Attributes API Call
   * @param {*} data
   * @returns
   */
  createAttributes(data) {
    return this.httpRequest("POST", `/attributes`, data);
  }

  /**
   * Get Single Wallet details
   * @param {*} id
   * @returns
   */
  getSingleWalletDetails(id) {
    return this.httpRequest("GET", `/wallets/${id}`, null);
  }
  /**
   * Create All Wallet API Call
   * @param {*} data
   * @returns
   */
  addEditWallet(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/wallets/${id}`, data);
    } else {
      return this.httpRequest("POST", `/wallets`, data);
    }
  }

  /**
   * Create coupon API Call
   * @param {*} data
   * @returns
   */
  createCoupon(data) {
    return this.httpRequest("POST", `/coupons`, data);
  }

  /**
   * Get Single Wallet details
   * @param {*} id
   * @returns
   */
  getSingleCouponDetails(id) {
    return this.httpRequest("GET", `/coupons/${id}`, null);
  }

  /**
   * function to create mapped data
   * @param {*} data
   * @returns
   */
  createMappedData(data) {
    return this.httpRequest("POST", `/walletMaps`, data);
  }

  /**
   * function to update mapped data
   * @param {*} data
   * @returns
   */
  updateMappedData(data, id) {
    return this.httpRequest("PUT", `/walletMaps/${id}`, data);
  }

  /**
   * function to update wallet detail
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updateAllWallet(data, id) {
    return this.httpRequest("PUT", `/wallets/${id}`, data);
  }

  /**
   * function to fetch all wallet detail
   */
  getAllWalletDetails() {
    return this.httpRequest("GET", `/wallets/all/0/100`, null);
  }

  /**
   * function to fetch all user
   */
  getAllUserDetails() {
    return this.httpRequest("GET", `/walletmaps/users/all/0/100?sortOrder=desc`, null);
  }
  /**
   * Create Attributes API Call
   * @param {*} data
   * @returns
   */
  updateAttributes(data, id) {
    return this.httpRequest("PUT", `/attributes/${id}`, data);
  }

  /**
   * Delete Attributes API Call
   * @param {*} data
   * @returns
   */
  deleteAttributes(data) {
    return this.httpRequest("DELETE", `/attributes`, data);
  }

  /**
   * Create Brand API Call
   * @param {*} data
   * @param {*} multiPart
   * @returns
   */
  createBrand(data, multiPart = false) {
    return this.httpRequest("POST", `/brands`, data, { multiPart });
  }

  /**
   * Create Brands API Call
   * @param {*} data
   * @param {*} multiPart
   * @returns
   */
  updateBrand(data, id, multiPart = false) {
    return this.httpRequest("PUT", `/brands/${id}`, data, { multiPart });
  }

  /**
   * Delete Brands API Call
   * @param {*} data
   * @returns
   */
  deleteBrand(data) {
    return this.httpRequest("DELETE", `/brands`, data);
  }

  /**
   * Delete Mapped Wallet API Call
   * @param {*} data
   * @returns
   */
  deleteMappedWallet(data) {
    return this.httpRequest("DELETE", `/walletmaps`, data);
  }

  /**
   * Delete product API Call
   * @param {*} data
   * @returns
   */
  deleteProduct(data) {
    return this.httpRequest("DELETE", `/products`, data);
  }

  /**
   * Create Category API Call
   * @param {*} data
   * @param {*} multiPart
   * @returns
   */
  createCategory(data, multiPart = false) {
    return this.httpRequest("POST", `/categories`, data, { multiPart });
  }

  /**
   * Create Category API Call
   * @param {*} data
   * @param {*} multiPart
   * @returns
   */
  updateCategory(data, id, multiPart = false) {
    return this.httpRequest("PUT", `/categories/${id}`, data, { multiPart });
  }

  /**
   * Delete Category API Call
   * @param {*} data
   * @returns
   */
  deleteCategory(data) {
    return this.httpRequest("DELETE", `/categories`, data);
  }

  // Get All Modules
  getAllModules() {
    return this.httpRequest("GET", `/modules/get-all-modules`, null);
  }

  // Get All Permissions
  getAllModulesPermissions() {
    return this.httpRequest("GET", `/permissions/get-all-permissions`, null);
  }

  // Create Role
  createRole(data) {
    return this.httpRequest("POST", `/roles/add-role`, data);
  }

  // Get Single Role Data
  getSingleRoleData(id) {
    return this.httpRequest("GET", `/mappings/get-single-role-mapping/${id}`, null);
  }

  // Update Role
  updateRole(id, data) {
    return this.httpRequest("PATCH", `/roles/update-role/${id}`, data);
  }

  // Delete role
  deleteSingleRole(data) {
    return this.httpRequest("POST", `/roles/delete-multiple-role`, data);
  }

  // Delete user
  deleteSingleUser(data) {
    return this.httpRequest("POST", `/users/delete-multiple-user`, data);
  }

  // Get All Roles
  getAllRoles() {
    return this.httpRequest("GET", `/roles/get-all-roles/0/200`);
  }

  // Create New User
  createUser(data) {
    return this.httpRequest("POST", `/users/add-user`, data);
  }

  // GET Single User Details
  getSingleUserDetails(id) {
    return this.httpRequest("GET", `/users/get-single-user/${id}`);
  }

  // Update Role
  updateUser(id, data) {
    return this.httpRequest("PUT", `/users/update-user/${id}`, data);
  }

  // Role Permission
  getRolePermission(id) {
    return this.httpRequest("GET", `/mappings/get-single-role-mapping/${id}`);
  }

  // Delete wallet
  deleteWallet(data) {
    return this.httpRequest("DELETE", `/wallets`, data);
  }

  /**
   * Upload mapped bulk file API Call
   * @param {*} data
   * @param {*} multiPart
   * @returns
   */

  uploadMappedBulkUploadFile(data, randomId, multiPart = false) {
    return this.httpRequest("POST", `/walletmaps/bulk-upload/${randomId}`, data, { multiPart });
  }

  /**
   * Upload mapped bulk file API Call
   * @param {*} data
   * @param {*} multiPart
   * @returns
   */

  uploadPincodeBulkUploadFile(data, randomId, multiPart = false) {
    return this.httpRequest("POST", `/pincodemaps/bulk-edit/${randomId}`, data, { multiPart });
  }

  /**
   * Upload bulk file API Call
   * @param {*} data
   * @param {*} multiPart
   * @returns
   */

  uploadBulkUploadFile(data, randomId, multiPart = false) {
    return this.httpRequest("POST", `/products/bulk-upload/${randomId}`, data, { multiPart });
  }

  // Add Offer Module - Data Based on Applicable On API
  getDataBasedonApplicableOn(type) {
    return this.httpRequest(
      "GET",
      `/offers/${type}/all/0/100?filterTerm={"status":"active"}&sortOrder=desc`,
      null
    );
  }

  // Add Offer Module - Products List API
  getProductsListForOffer() {
    return this.httpRequest(
      "GET",
      `/offers/products/all/0/100?filterTerm={"status":"active"}&sortOrder=desc`,
      null
    );
  }

  // Add Offer Module -Products Api
  getProductsForCoupon(val = null, isEligible = false) {
    if (val) {
      return this.httpRequest(
        "GET",
        `/offers/products/all/0/10/?searchTerm=${val}&sortOrder=desc&isOffer=true&isEligible=${isEligible}`,
        null
      );
    } else {
      return this.httpRequest(
        "GET",
        `/offers/products/all/0/10?sortOrder=desc&isOffer=true&isEligible=${isEligible}`,
        null
      );
    }
  }

  // Add Offer Module - Add Offer API
  addOffer(data) {
    return this.httpRequest("POST", `/offers`, data);
  }

  // Add Offer Module - role data
  getAllUsersGroup() {
    return this.httpRequest("GET", `/offers/get-all-roles/0/500`, null);
  }

  // Add Offer Module -Data Based on Applicable On API
  getSingleOfferDetails(id) {
    return this.httpRequest("GET", `/offers/${id}`, null);
  }

  // Offer Module -Delete Offer
  deleteSingleOffer(data) {
    return this.httpRequest("DELETE", `/offers`, data);
  }
  // Offer module - update Offer
  updateOffer(data, id) {
    return this.httpRequest("PUT", `/offers/${id}`, data);
  }

  //Forgot Password request
  sendOTP(data) {
    return this.httpRequest("POST", `/generic/users/forget-password`, data);
  }

  // validate OTP
  validateOTP(data) {
    return this.httpRequest("POST", `/generic/users/validate-otp`, data);
  }
  // confidm password
  confirmPassword(data, id) {
    return this.httpRequest("POST", `/generic/users/change-password/${id}`, data);
  }

  // resend OTP
  resendOTP(data) {
    return this.httpRequest("POST", `/generic/users/forget-password`, data);
  }

  // CSO Module - Add CSO API
  addCSO(data) {
    return this.httpRequest("POST", `/csos`, data);
  }

  // CSO Module - Delete CSO API
  deleteCSO(data) {
    return this.httpRequest("DELETE", `/csos`, data);
  }

  // CSO Module - Single CSO API
  getSingleCSODetail(id) {
    return this.httpRequest("GET", `/csos/${id}`);
  }

  // CSO Module - UpdateSingle CSO API
  updateSingleCSODetail(id, data) {
    return this.httpRequest("PUT", `/csos/${id}`, data);
  }

  /**
   * get store code
   */
  getStoreCode(code) {
    return this.httpRequest("GET", `/pincodeMaps/check-code/${code}`, null);
  }

  // Pincode store map Module - Get Pincode List API
  getStorePincodeList(val) {
    return this.httpRequest("GET", `/pincodeMaps/pincode/all/?searchTerm=${val}`);
  }

  /**
   * Create pincode mapping API Call
   * @param {*} data
   * @returns
   */
  createPincodeMapping(data) {
    return this.httpRequest("POST", `/pincodemaps`, data);
  }

  /**
   * Update pincode mapping API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updatePincodeMapping(data, id) {
    return this.httpRequest("PUT", `/pincodemaps/${id}`, data);
  }

  /**
   * Delete pincode mapping API Call
   * @param {*} data
   * @returns
   */
  deletePincodeMapping(data) {
    return this.httpRequest("DELETE", `/pincodemaps`, data);
  }

  // CSO Map Module - Get CSO List API
  getCSOList(searchVal) {
    if (searchVal) {
      return this.httpRequest("GET", `/csomaps/cso/all/0/10?searchTerm=${searchVal}`);
    } else {
      return this.httpRequest("GET", `/csomaps/cso/all/0/10`);
    }
  }

  // CSO Map Module - Get State List API
  getStateListForCSOMap() {
    return this.httpRequest("GET", `/csomaps/states/all/0/50`);
  }

  // CSO Map Module - Get Distric List API
  getDistrictList(val) {
    return this.httpRequest(
      "GET",
      `/csomaps/district/all/?filterTerm={"state_name":${JSON.stringify(val)}}`
    );
  }

  // CSO Map Module - Get Pincode List API
  getPincodeList(val) {
    if (typeof val == "object") {
      return this.httpRequest(
        "GET",
        `/csomaps/pincode/all/?searchTerm=${val?.search}&filterTerm=${val?.state}`
      );
    } else {
      return this.httpRequest("GET", `/csomaps/pincode/all/?filterTerm=${val}`);
    }
  }

  // CSO Map Module - Get Pincode List API
  addCSOMapping(val) {
    return this.httpRequest("POST", `/csomaps/`, val);
  }

  // CSO Map Module - Get Single Cson Map Details API
  getSingleCSOMapDetails(id) {
    return this.httpRequest("GET", `/csomaps/${id}`);
  }

  // CSO Map Module - Update Single CSO Map API
  updateCSOMapping(id, data) {
    return this.httpRequest("PUT", `/csomaps/${id}`, data);
  }

  // CSO Module - Delete CSO API
  deleteCSOMap(data) {
    return this.httpRequest("DELETE", `/csomaps`, data);
  }

  // CSO Module - Single CSO API
  getCSODepots() {
    return this.httpRequest("GET", `/depots/all/0/500`);
  }

  // Shipping Price Module - Add API
  addShippingCharges(val) {
    return this.httpRequest("POST", `/shippingcharges/`, val);
  }

  // Shipping Price Module - Add API
  getAllShippingCharges(val) {
    return this.httpRequest("GET", `/shippingcharges/`);
  }

  getSingleShippingChargesDetails(id) {
    return this.httpRequest("GET", `/shippingcharges/${id}`);
  }

  updateSingleShippingChargesDetails(id, body) {
    return this.httpRequest("PUT", `/shippingcharges/${id}`, body);
  }

  deleteShippingCharges(data) {
    return this.httpRequest("DELETE", `/shippingcharges/`, data);
  }

  /**
   * Create download API Call
   * @param {*} data
   * @returns
   */
  // createDownload(data, multiPart = true) {
  //   return this.httpRequest("POST", `/downloads/add-download-doc`, data, { multiPart });
  // }

  createDownload(id, data, multiPart = true) {
    return id
      ? this.httpRequest("PUT", `/downloads/update-download-doc/${id}`, data, { multiPart })
      : this.httpRequest("POST", `/downloads/add-download-doc`, data, { multiPart });
  }

  getSingleDownloadContent(id) {
    return this.httpRequest("GET", `/downloads/${id}`);
  }
  /**
   * Edit download API Call
   * @param {*} data
   * @returns
   */
  editDownload(data, id, multiPart = true) {
    return this.httpRequest("PUT", `/downloads/update-download-doc/${id}`, data, { multiPart });
  }
  /**
   * Delete download API Call
   * @param {*} data
   * @returns
   */
  deleteDownload(data) {
    return this.httpRequest("DELETE", `/downloads/delete-multiple-docs/`, data);
  }

  shippingCharges(id, body) {
    return id
      ? this.httpRequest("PUT", `/shippingcharges/${id}`, body)
      : this.httpRequest("POST", `/shippingcharges/`, body);
  }

  uploadBrandsBulkUploadFile(data, randomId, multiPart = false) {
    return this.httpRequest("POST", `/brands/bulk-upload/${randomId}`, data, { multiPart });
  }

  uploadCategoryBulkUploadFile(data, randomId, multiPart = false) {
    return this.httpRequest("POST", `/categories/bulk-upload/${randomId}`, data, { multiPart });
  }

  //Banner mangemnt- create new  Api
  addUpdateBannerdetails(id, data, multiPart = true) {
    return id
      ? this.httpRequest("PUT", `/banner_list/${id}`, data, { multiPart })
      : this.httpRequest("POST", `/banner_list`, data, { multiPart });
  }

  getSingleBannerdetails(id) {
    return this.httpRequest("GET", `/banner_list/${id}`);
  }
  deleteBanners(data) {
    return this.httpRequest("DELETE", `/banner_list/`, data);
  }

  // Settings Module - create new setting
  createSetting(data) {
    return this.httpRequest("POST", `/settings`, data);
  }
  // Settings Module - getsetting
  getAllSettings() {
    return this.httpRequest("GET", `/settings`);
  }

  updateAllSettings(data) {
    return this.httpRequest("PUT", `/settings`, data);
  }

  getAllKycModules() {
    return this.httpRequest("GET", `/settings/get-kyc-modules`);
  }

  /**
   * Create Notification Category API Call
   * @param {*} data
   * @returns
   */
  createNotificationCategory(data) {
    return this.httpRequest("POST", `/notification_category_list`, data);
  }
  /**
   * Update Notification Category API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updateNotificationCategory(data, id) {
    return this.httpRequest("PUT", `/notification_category_list/${id}`, data);
  }
  /**
   * Delete Notification Category API Call
   * @param {*} data
   * @returns
   */
  deleteNotificationCategory(data) {
    return this.httpRequest("DELETE", `/notification_category_list`, data);
  }

  /**
   * Create Notification API Call
   * @param {*} data
   * @returns
   */
  createNotification(data, multiPart = true) {
    return this.httpRequest("POST", `/notification_list`, data, { multiPart });
  }
  /**
   * Update Notification API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updateNotification(data, id, multiPart = true) {
    return this.httpRequest("PUT", `/notification_list/${id}`, data, { multiPart });
  }
  /**
   * Delete Notification API Call
   * @param {*} data
   * @returns
   */
  deleteNotification(data) {
    return this.httpRequest("DELETE", `/notification_list`, data);
  }

  // Pincode store map Module - Get Pincode List API
  getCategoryNotification(val) {
    return this.httpRequest(
      "GET",
      `/notification_list/notification-categories-all/0/200?searchTerm=${val}`
    );
  }

  /**
   * Send Notification API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  sendNotification(id) {
    return this.httpRequest("PUT", `/notification_list/send-notifications/${id}`);
  }

  /**
   * Create Send Notification API Call
   * @param {*} data
   * @returns
   */
  createSendNotification(data, multiPart = true) {
    return this.httpRequest("POST", `/send_notification_list`, data, { multiPart });
  }
  /**
   * Update Send Notification API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updateSendNotification(data, id, multiPart = true) {
    return this.httpRequest("PUT", `/send_notification_list/${id}`, data, { multiPart });
  }

  // Products Section : get products
  getAllProductsforProductsSection(data) {
    if (data) {
      return this.httpRequest("GET", `/product_section/products/all/0/200?searchTerm=${data}`);
    } else {
      return this.httpRequest("GET", `/product_section/products/all/0/200`);
    }
  }

  // Products Section : add product section
  addEditProductSection(data, id, multiPart = true) {
    if (id) {
      return this.httpRequest("PUT", `/product_section/${id}`, data, { multiPart });
    } else {
      return this.httpRequest("POST", `/product_section/`, data, { multiPart });
    }
  }

  // Products Section : add product section
  getSingleProductSection(id) {
    return this.httpRequest("GET", `/product_section/${id}`);
  }
  // Products Section : delete product section
  deleteProductSection(data) {
    return this.httpRequest("DELETE", `/product_section`, data);
  }

  // Products Section : view single product section's product
  getProductsForView(id) {
    return this.httpRequest("GET", `/product_section/view-product/${id}`);
  }

  // menu mangement : add menu
  addUpdateMenu(data) {
    if (data?.id) {
      return this.httpRequest("PUT", `/menu_management/${data?.id}`, data?.payload);
    } else {
      return this.httpRequest("POST", `/menu_management`, data?.payload);
    }
  }
  // menu mangement : get single menu data
  getSingleMenuData(id) {
    return this.httpRequest("GET", `/menu_management/${id}`);
  }
  // menu mangement : delete menu
  deleteMenus(data) {
    return this.httpRequest("DELETE", `/menu_management`, data);
  }

  // menu mangement : get categories list
  getCategoriesForMenuData() {
    return this.httpRequest("GET", `/generic/all-categories`);
  }

  // menu mangement : get brands list
  getBrandsForMenuData() {
    return this.httpRequest("GET", `/generic/all-brands`);
  }
  // menu mangement : get parent menu list
  getParentMenuListData() {
    return this.httpRequest("GET", `/generic/all-parent-menu`);
  }

  // featured Category : get categories list
  getAllCategoriesForFeatured() {
    return this.httpRequest("GET", `/featured_categories/categories/all`);
  }

  // featured Category : update categories sequence
  updateCategoriesForFeatured(data) {
    return this.httpRequest("PUT", `/featured_categories/`, data);
  }

  // featured Category : get featured categories list
  getFeaturedCategoriesList() {
    return this.httpRequest("GET", `/featured_categories/all`);
  }

  // featured Category : get single featured category data
  getSingleFeaturedCategoryData(id) {
    return this.httpRequest("GET", `/featured_categories/${id}`);
  }

  // featured Category : update single featured category data
  updatetSingleFeaturedCategoryData(id, data, multiPart = true) {
    return this.httpRequest("PUT", `/featured_categories/${id}`, data, { multiPart });
  }

  // manage media - category : get parent category list
  getParentMediaCategoryListData() {
    return this.httpRequest("GET", `/media_categories/all`);
  }

  // manage media - category : delete category
  deleteMediaCategory(data) {
    return this.httpRequest("DELETE", `/media_categories`, data);
  }

  // manage media - category : add/edit category
  addUpdateMediaCategory(data) {
    if (data?.id) {
      return this.httpRequest("PUT", `/media_categories/${data?.id}`, data?.payload);
    } else {
      return this.httpRequest("POST", `/media_categories`, data?.payload);
    }
  }

  // menu mangement - category : get single media category data
  getSingleMediaCategoryData(id) {
    return this.httpRequest("GET", `/media_categories/single/${id}`);
  }

  // menu mangement - media content :  add/edit media content
  addEditSingleMediaContent(id, data, multiPart = true) {
    if (id) {
      return this.httpRequest("PUT", `/media_content/${id}`, data, { multiPart });
    } else {
      return this.httpRequest("POST", `/media_content`, data, { multiPart });
    }
  }

  // menu mangement - media content : get media categories iist
  getCategoriesListForMediaContent() {
    return this.httpRequest("GET", `/media_content/get-all-parent-category`);
  }
  // menu mangement - media content : get media sub categories iist
  getSubCategoriesListForMediaContent(id) {
    return this.httpRequest("GET", `/media_content/get-all-child-category/${id}`);
  }

  // menu mangement - media content : get single media content data
  getSingleMediaContentData(id) {
    return this.httpRequest("GET", `/media_content/${id}`);
  }

  // manage media - media content : delete media content
  deleteMediaContent(data) {
    return this.httpRequest("DELETE", `/media_content`, data);
  }

  // ab message : add/edit ab message
  addUpdateABMessage(id, data, multiPart = true) {
    if (id) {
      return this.httpRequest("PUT", `/ab_message/${id}`, data, { multiPart });
    } else {
      return this.httpRequest("POST", `/ab_message`, data, { multiPart });
    }
  }

  // ab message : get single  ab message data
  getSingleABmessageData(id) {
    return this.httpRequest("GET", `/ab_message/${id}`);
  }

  // ab message : delete ab message
  deleteSingleABmessage(data) {
    return this.httpRequest("DELETE", `/ab_message`, data);
  }

  AparajitaUploadBrandsBulkUploadFile(data, randomId, multiPart = false) {
    return this.httpRequest("POST", `/report/bulk-upload/${randomId}`, data, { multiPart });
  }

  //---------------------- Crm Api-----------------------------------------------------------------------------------------------------------
  getCrmOrders(data) {
    return this.httpRequest("POST", `/crm_order/get-order-detail`, data);
  }
  getCrmReturnOrders(data) {
    return this.httpRequest("POST", `/crm_order/get-return-order-detail`, data);
  }

  // crm order by date
  getCrmOrdersByDate(data, arg) {
    delete data?.search_type;
    return this.httpRequest("POST", `/crm_order/get-order-by-date`, data);
  }

  getCrmOrdersByDateDownload(data, arg) {
    delete data?.search_type;
    return this.httpRequest("POST", `/crm_order/get-order-by-date-download`, data);
  }

  // crm order by date
  getCrmReturnOrdersByDate(data) {
    delete data?.search_type;
    return this.httpRequest("POST", `/crm_order/get-return-order-by-date`, data);
  }

  // get order by status
  getCrmOrdersByStatus(data) {
    delete data?.search_type;
    return this.httpRequest("POST", `/crm_order/get-order-by-status`, data);
  }
  // get order by status
  getCrmReturnOrdersByStatus(data) {
    delete data?.search_type;
    return this.httpRequest("POST", `/crm_order/get-return-order-by-status`, data);
  }

  //get order details
  getCrmOrdersByID(id) {
    return this.httpRequest("GET", `/crm_order/get-order/${id}`);
  }

  // get return order details
  getCrmOrdersReturnByID(id) {
    return this.httpRequest("GET", `/crm_order/get-return-order/${id}`);
  }
  // Update shipping address (CRM)
  updateShippingAddress(data) {
    return this.httpRequest("POST", `/crm_order/update-order-address`, data);
  }

  // order confirm (CRM)
  orderConfirm(data) {
    return this.httpRequest("POST", `/crm_order/create-order-confirm`, data);
  }
  // Orders Count (CRM)
  getOrdersCount(data) {
    return this.httpRequest("POST", `/dashboard/crm/get-order-count`, data);
  }

  // Recent Orders (CRM)
  recentOrders() {
    return this.httpRequest("GET", `/dashboard/crm/get-recent-order`);
  }

  // Chart api get-sale-summary  (CRM)
  getSaleSummary(key = "daily") {
    return this.httpRequest("GET", `/dashboard/crm/get-sale-summary/${key}`);
  }

  // Chart api top selling products (CRM)
  getTopSelling(key = "daily") {
    return this.httpRequest("GET", `/dashboard/crm/get-top-selling-product/${key}`);
  }

  // cancel request (CRM)
  orderCancelRequest(data) {
    return this.httpRequest("POST", `/crm_order/update-cancel-request-order`, data);
  }

  // order cancel items (CRM)
  orderCancelItems(data) {
    return this.httpRequest("POST", `/crm_order/update-order-cancel`, data);
  }

  // order refund recanculation
  cancelOrderRefund(data) {
    return this.httpRequest("POST", `/crm_order/recalculate-cancel-order/${data?.order_no}`, data);
  }

  // Return order refund recanculation
  returnOrderRefund(data) {
    return this.httpRequest("POST", `/crm_order/recalculate-return`, data);
  }

  // Return order item
  returnOrderItem(data) {
    return this.httpRequest("POST", `/crm_order/add-return`, data);
  }
  // Return depot order item
  returnDepotOrderItem(data) {
    return this.httpRequest("POST", `/crm_order/add-depot-return`, data);
  }
  cancelReturnDepotOrderItem(data) {
    return this.httpRequest("POST", `/crm_order/cancel-depot-return`, data);
  }
  rejectReturn(data) {
    return this.httpRequest("POST", `/crm_order/reject-depot-return`, data);
  }

  acceptReturn(data) {
    return this.httpRequest("POST", `/crm_order/accept-depot-return`, data);
  }
  markAsPickup(data) {
    return this.httpRequest("POST", `/crm_order/pickup-depot-return`, data);
  }

  /**
   * Delete Tag API Call
   * @param {*} data
   * @returns
   */
  cancelReturnItem(data) {
    return this.httpRequest("DELETE", `/crm_order/cancel-return`, data);
  }

  // Return order item
  generateOTPReturn(data) {
    return this.httpRequest("POST", `/crm_return_order/generate-return-otp`, data);
  }

  getAparajitaData(url) {
    let endpoint = "/report/get-all-Aparajita/";

    if (url?.page !== undefined && url?.pageSize !== undefined) {
      endpoint += `${url.page}/${url.pageSize}`;
    }

    return this.httpRequest("GET", endpoint);
  }

  // Return order item
  // validateOtpReturn(data) {
  //   return this.httpRequest("POST", `/crm_return_order/create-new-online-return`, data);
  // }

  createInvoiceDepot(data) {
    return this.httpRequest("POST", `/crm_order/create-invoice`, data);
  }

  getShippingChargesForDepot(data) {
    return this.httpRequest("POST", `/crm_order/shipping-charges`, data);
  }

  // Ship rocket api

  addShipRocketApi(data) {
    return this.httpRequest("POST", `/ship-rocket/create`, data);
  }
  addShipRocketReturnApi(data) {
    return this.httpRequest("POST", `/ship-rocket/create-return`, data);
  }

  UpdateDetailsShipRocketDetails(data) {
    return this.httpRequest("PUT", `/ship-rocket/update`, data);
  }

  getCourierList(id, cust_id) {
    return this.httpRequest("GET", `/ship-rocket/couriers/${id}/${cust_id}`);
  }

  shipRocketCancelOrderById(data) {
    return this.httpRequest("POST", `/ship-rocket/cancel`, data);
  }
  // Assign Awb
  AssignAwbShipRocketApi(data) {
    return this.httpRequest("POST", `/ship-rocket/generate-awb`, data);
  }

  // Ship Rocket Download Order Invoice
  shipRocketDownloadInvoice(data) {
    return this.httpRequest("POST", `/ship-rocket/order/print-invoice`, data);
  }

  // Get Pickup date schedule
  apiPickupScheduleDate(data) {
    return this.httpRequest("POST", `/ship-rocket/schedule-pickup`, data);
  }

  // Generate label
  shipRocketGenerateLabel(data) {
    return this.httpRequest("POST", `/ship-rocket/generate-label`, data);
  }

  // GET single order details (Ship rocket)
  getShipRocketSingleOrder(id) {
    return this.httpRequest("GET", `/ship-rocket/order/${id}`);
  }
  // Download manifest shiprocket
  downloadManifestShipRocket(data) {
    return this.httpRequest("POST", `/ship-rocket/order/manifest`, data);
  }

  //-----------------------------------------------crm api end----------------------------------------------------------------------

  // pincode-area-map : create single pincode area map data
  addEditPincodeAreaMapping(data, id) {
    if (id) {
      return this.httpRequest("PUT", `/pincode_area_maps/${id}`, data);
    } else {
      return this.httpRequest("POST", `/pincode_area_maps`, data);
    }
  }

  // pincode-area-map : get single pincode area map data
  getSinglePincodeAreaData(id) {
    return this.httpRequest("GET", `/pincode_area_maps/${id}`);
  }

  // pincode-area-map : delete pincode area map data
  deletePincodeAreaMapping(data) {
    return this.httpRequest("DELETE", `/pincode_area_maps`, data);
  }

  //
  getStorePincodeAreaList(val) {
    return this.httpRequest("GET", `/pincode_area_maps/all/0/200?searchTerm=${val}`);
  }

  // download-category : add/edit
  addEditDownloadCategory(data, id) {
    if (id) {
      return this.httpRequest("PUT", `/download_categories/${id}`, data);
    } else {
      return this.httpRequest("POST", `/download_categories`, data);
    }
  }

  // download-category : get single download category data
  getSingleDownloadCategory(id) {
    return this.httpRequest("GET", `/download_categories/${id}`);
  }

  // download-category : delete download-category
  deleteDownloadCategory(data) {
    return this.httpRequest("DELETE", `/download_categories`, data);
  }

  // download-language : add/edit
  addEditDownloadLanguage(data, id) {
    if (id) {
      return this.httpRequest("PUT", `/download_language/${id}`, data);
    } else {
      return this.httpRequest("POST", `/download_language`, data);
    }
  }

  // download-language  : get single download language  data
  getSingleDownloadLanguage(id) {
    return this.httpRequest("GET", `/download_language/${id}`);
  }

  // download-language  : delete download-language
  deleteDownloadLanguage(data) {
    return this.httpRequest("DELETE", `/download_language`, data);
  }

  // content-type : add/edit content-type
  addEditContentType(data, id) {
    if (id) {
      return this.httpRequest("PUT", `/content_type/${id}`, data);
    } else {
      return this.httpRequest("POST", `/content_type`, data);
    }
  }

  // content-type  : get single content-type  data
  getSingleContentType(id) {
    return this.httpRequest("GET", `/content_type/${id}`);
  }

  // content-type  : delete content-type
  deleteContentType(data) {
    return this.httpRequest("DELETE", `/content_type`, data);
  }

  // download-content : get All download categories for dropdown
  getAllDownloadCategoriesForDropDown() {
    return this.httpRequest("GET", `/downloads/download-categories/all/0/100`);
  }

  // download-content : get All download categories for dropdown
  getAllDownloadLanguagesForDropDown() {
    return this.httpRequest("GET", `/downloads/download-languages/all/0/100`);
  }

  // download-content : get All download categories for dropdown
  getAllContentTypeForDropDown() {
    return this.httpRequest("GET", `/downloads/content-type/all/0/100`);
  }

  // voucher : add/edit
  addEditVoucher(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/voucher/${id}`, data);
    } else {
      return this.httpRequest("POST", `/voucher`, data);
    }
  }

  // voucher : get single voucher details
  getSingleVoucherData(id) {
    return this.httpRequest("GET", `/voucher/${id}`);
  }

  // voucher : delete voucher
  deleteDVoucher(data) {
    return this.httpRequest("DELETE", `/voucher`, data);
  }

  // get zones list
  getZonesList() {
    return this.httpRequest("GET", `/generic/all-zones`);
  }

  // get states list
  getStatesListBasedOnZone(val) {
    return this.httpRequest("GET", `/generic/zonal-states?searchTerm=${val}`);
  }

  // get districts list
  getSDistrictListBasedOnState(val) {
    return this.httpRequest("GET", `/pincodemaps/state-wise-districts/all/?searchTerm=${val}`);
  }

  // rcm events: add/edit events
  addEditEvent(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/rcm-event/${id}`, data);
    } else {
      return this.httpRequest("POST", `/rcm-event`, data);
    }
  }

  // rcm events : get single event details
  getEventData(id) {
    return this.httpRequest("GET", `/rcm-event/${id}`);
  }

  // rcm events: delete event
  deleteEvent(data) {
    return this.httpRequest("DELETE", `/rcm-event`, data);
  }

  // add ulp targets
  addULPTargets(data) {
    return this.httpRequest("POST", `/ulp-target/add`, data);
  }
  // get ulp targets
  getTargets(data) {
    return this.httpRequest("GET", `/ulp-target/all/${data}`);
  }

  // get states list
  getStatesList() {
    return this.httpRequest("GET", `/generic/zonal-states`);
  }

  // meeting: add/edit meeting
  addEditMeeting(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/meeting/${id}`, data);
    } else {
      return this.httpRequest("POST", `/meeting`, data);
    }
  }

  // meeting : get single meeting details
  getMeetingData(id) {
    return this.httpRequest("GET", `/meeting/${id}`);
  }

  // meeting: delete meeting
  deleteMeeting(data) {
    return this.httpRequest("DELETE", `/meeting`, data);
  }

  // marketing-plan-language : add/edit
  addEditMarketingPlanLanguage(data, id, multiPart = true) {
    if (id) {
      return this.httpRequest("PUT", `/marketing_plan_language/${id}`, data, {
        multiPart
      });
    } else {
      return this.httpRequest("POST", `/marketing_plan_language`, data, {
        multiPart
      });
    }
  }

  // marketing-plan-language  : get single marketing-plan-language  data
  getSingleMarketingPlanLanguage(id) {
    return this.httpRequest("GET", `/marketing_plan_language/${id}`);
  }

  // marketing-plan-language  : delete marketing-plan-language
  deleteMarketingPlanLanguage(data) {
    return this.httpRequest("DELETE", `/marketing_plan_language`, data);
  }

  // marketing-plan-language : get marketing plan languages list
  getMarketingPlanLanguage() {
    return this.httpRequest("GET", `/marketing_plan_language/all/0/100`);
  }

  // marketing-plan : add/edit marketing-plan
  addEditMarketingPlan(data, id) {
    if (id) {
      return this.httpRequest("PUT", `/marketing_plan/${id}`, data);
    } else {
      return this.httpRequest("POST", `/marketing_plan`, data);
    }
  }

  // marketing-plan : get single marketing-plan data
  getSingleMarketingPlan(id) {
    return this.httpRequest("GET", `/marketing_plan/${id}`);
  }

  // marketing-plan : delete marketing-plan
  deleteMarketingPlan(data) {
    return this.httpRequest("DELETE", `/marketing_plan`, data);
  }

  // marketing-plan : get marketing-plan list
  getMarketingPlan() {
    return this.httpRequest("GET", `/marketing_plan/all`);
  }

  // product language : add/edit
  upudateProductLanguages(id, data) {
    return this.httpRequest("PUT", `/products/product_languages/${id}`, data);
  }

  // product language : get
  getProductLanguages(id) {
    return this.httpRequest("GET", `/products/product_languages/${id}`);
  }

  // size-chart : add/edit size-chart
  addSizeChart(data, id) {
    if (id) {
      return this.httpRequest("PUT", `/size_chart/${id}`, data);
    } else {
      return this.httpRequest("POST", `/size_chart`, data);
    }
  }

  // size-chart : get single size-chart  data
  getSingleSizeChartDetail(id) {
    return this.httpRequest("GET", `/size_chart/${id}`);
  }

  // size-chart : delete size-chart
  deleteSizeChart(data) {
    return this.httpRequest("DELETE", `/size_chart`, data);
  }

  // general-pages : add/edit general-pages
  addGeneralPage(data, id) {
    if (id) {
      return this.httpRequest("PUT", `/general_page/${id}`, data);
    } else {
      return this.httpRequest("POST", `/general_page`, data);
    }
  }

  // size-chart : get all size-chart data
  getAllSizeChartList() {
    return this.httpRequest("GET", `/size_chart/all/0/100`);
  }

  // general-pages : get all general-pages data
  getAllSizeCharts() {
    return this.httpRequest("GET", `/general_page/all/0/100`);
  }

  // general-pages : get single general-pages  data
  getSingleGeneralDetail(id) {
    return this.httpRequest("GET", `/general_page/${id}`);
  }
  // API Call to post KeySoul basic detail

  keySoulCreateBasicDetail(data, multiPart = true) {
    return this.httpRequest("POST", `/brands/brand-template/add-basic-detail`, data, {
      multiPart
    });
  }

  // API Call to post KeySoul Program Detail
  keySoulCreateProgramDetail(data, multiPart = true) {
    return this.httpRequest("POST", `/brands/brand-template/add-program-detail`, data, {
      multiPart
    });
  }

  // API Call to create or update key soul Social Link
  keySoulCreateOrUpdateSocialLink(brandId, data) {
    return this.httpRequest(
      "POST",
      `/brands/brand-template/add-update-social-links/${brandId}`,
      data
    );
  }

  // API Call to create or update key soul Social Link
  getKeySoulSocialLink(brandId, platform_type) {
    return this.httpRequest(
      "GET",
      `/brands/brand-template/get-social-links/${brandId}/${platform_type}`,
      null
    );
  }

  // API Call to post KeySoul blog Detail
  keySoulCreateBlogDetail(data, multiPart = true) {
    return this.httpRequest("POST", `/brands/brand-template/add-blog-detail`, data, {
      multiPart
    });
  }

  // API Call to fetch Key Soul Program Detail
  getKeySoulProgramDetail(id, type, platform_type) {
    return this.httpRequest(
      "GET",
      `/brands/brand-template/get-program-detail/${id}/${type}/${platform_type}`
    );
  }

  // API Call to fetch Key Soul Blog Detail
  getKeySoulBlogDetail(id, type, platform_type) {
    return this.httpRequest(
      "GET",
      `/brands/brand-template/get-blog-detail/${id}/${type}/${platform_type}`
    );
  }
  // API Call to fetch Key Soul Blog Detail
  getBrandBasicDetails(id, page, pageSize, searchTerm) {
    return this.httpRequest(
      "GET",
      `/brands/brand-template/get-all-basic-detail/${id}?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}`
    );
  }

  // API Call to fetch Key Soul all list
  getAllTemplateData(page, pageSize, searchTerm) {
    return this.httpRequest(
      "GET",
      `/brands/brand-template/get-all-brand-templates-data?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}`
    );
  }

  // API Call to fetch products by brand
  getProductsByBrand(id, searchTerm) {
    return this.httpRequest("GET", `/brands/get-all-products/${id}?searchTerm=${searchTerm}`);
  }

  // API Call to fetch best seller products by brand
  getBestSellerProductsById(id) {
    return this.httpRequest("GET", `/brand-best-seller-products/get-best-seller/${id}`);
  }

  // API Call to update basic detail
  keySoulUpdateBasicDetail(data, id, multiPart = true) {
    return this.httpRequest("PUT", `/brands/brand-template/edit-basic-detail/${id}`, data, {
      multiPart
    });
  }
  // API Call to delete basic detail
  keySoulDeleteBasicDetail(id) {
    return this.httpRequest("DELETE", `/brands/brand-template/delete-basic-detail/${id}`, null);
  }

  // Key Soul Update Program Detail
  keySoulUpdateProgramDetail(data, multiPart = true) {
    return this.httpRequest("PUT", `/brands/brand-template/edit-program-detail`, data, {
      multiPart
    });
  }
  // Key Soul Update Blog Detail
  keySoulUpdateBlogDetail(data, multiPart = true) {
    return this.httpRequest("PUT", `/brands/brand-template/edit-blog-detail`, data, {
      multiPart
    });
  }

  // Key Soul Create Testimonial
  keySoulCreateTestimonialsDetail(data, multiPart = true) {
    return this.httpRequest("POST", "/brands/brand-template/add-testimonial", data, {
      multiPart
    });
  }

  // Key Soul Update Testimonial
  keySoulUpdateTestimonialsDetail(data, id, multiPart = true) {
    return this.httpRequest("PUT", `/brands/brand-template/edit-testimonial/${id}`, data, {
      multiPart
    });
  }

  // API Call to fetch Key Soul Testimonial Detail
  getKeySoulTestimonialsDetail(id, type, platform_type) {
    return this.httpRequest(
      "GET",
      `/brands/brand-template/get-all-testimonial/${id}/${platform_type}`
    );
  }

  // API Call to Fetch Key Soul Basic detail
  getKeySoulBasicDetail(id) {
    return this.httpRequest("GET", `/brands/brand-template/get-basic-detail/${id}`);
  }
  // API Call to Fetch Key Soul Basic detail
  deleteKeySoulTestimonial(id) {
    return this.httpRequest("DELETE", `/brands/brand-template/delete-testimonial/${id}`);
  }

  // API call to create or update best seller products
  addBestSeller(data, id) {
    return this.httpRequest("POST", `/brands/add-edit/${id}`, data);
  }

  // about us - history : add/edit about us history
  addEditAboutUsHistory(id, data, multiPart = true) {
    if (id) {
      return this.httpRequest("PUT", `/about-us-history/${id}`, data, { multiPart });
    } else {
      return this.httpRequest("POST", `/about-us-history`, data, { multiPart });
    }
  }

  // about us - history : get single about us history
  getSingleAboutUsHistory(id) {
    return this.httpRequest("GET", `/about-us-history/${id}`);
  }

  // about us - history : delete about us  history
  deleteSingleAboutUsHistory(data) {
    return this.httpRequest("DELETE", `/about-us-history`, data);
  }

  // notices : add/edit notice
  addEditNotice(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/notice/${id}`, data);
    } else {
      return this.httpRequest("POST", `/notice`, data);
    }
  }

  // notices : get single notice details
  getNoticeData(id) {
    return this.httpRequest("GET", `/notice/${id}`);
  }
  // Notifications get single show on details
  getShowOnNotificationData(id) {
    return this.httpRequest("GET", `/notice/show-on/data`);
  }

  // notices : delete notice
  deleteNotice(data) {
    return this.httpRequest("DELETE", `/notice`, data);
  }

  // --------------------------------------------------------------------
  // ---------------------------- KYC Admin -----------------------------
  // --------------------------------------------------------------------

  // search Ab Details : get ab details by bank acnt no
  getAbDetailsByBankAccNo(data) {
    return this.httpRequest("POST", `/kyc-admin/search-info/bank`, data);
  }
  // search Ab Details : get ab details by mob no
  getAbDetailsByMobNo(data) {
    return this.httpRequest("POST", `/kyc-admin/search-info/mobile`, data);
  }
  // search Ab Details : get ab details by pan no
  getAbDetailsByPanNo(data) {
    return this.httpRequest("POST", `/kyc-admin/search-info/pan`, data);
  }
  // search Ab Details : get ab details by aadhar no
  getAbDetailsByAadharNo(data) {
    return this.httpRequest("POST", `/kyc-admin/search-info/aadhar`, data);
  }
  // generic : get ab details by ab no
  getAbDetailsByAbNo(data) {
    return this.httpRequest("POST", `/kyc-admin/generic/ab-details`, data);
  }
  // associate buyer : stop AB ID
  stopABID(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/ab-id-stop/`, data);
  }
  // associate buyer : get ab details by ab no
  getAssociateDetailsByAbNo(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/ab-details/get`, data);
  }
  // associate buyer : reset passwrd
  resetABPswrd(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/reset-pass`, data);
  }

  // associate buyer : assocaite buyer details - Ab Ledger
  getABLedgerData(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/ab-details/ledger`, data);
  }

  // associate buyer : assocaite buyer details - Ab Repurchase
  getABRepurchaseData(data) {
    return this.httpRequest(
      "POST",
      `/kyc-admin/associate-buyer/ab-details/repurchase/summary`,
      data
    );
  }
  // associate buyer : assocaite buyer details - AB Re-Purchase Details
  getABRepurchaseDetails(data) {
    return this.httpRequest(
      "POST",
      `/kyc-admin/associate-buyer/ab-details/repurchase/details`,
      data
    );
  }

  // associate buyer : assocaite buyer details - Ab Uptree
  getAbDetailsForUptree(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/uptree/`, data);
  }

  // associate buyer : check monthly meetings
  getMonthlyMeeting(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/monthly-meetings/get-all`, data);
  }

  // associate buyer : check monthly meeting details by id
  getMonthlyMeetingDetailsById(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/monthly-meetings/details`, data);
  }

  // associate buyer : update monthly meeting status
  meetingStatusUpdate(data) {
    return this.httpRequest(
      "POST",
      `/kyc-admin/associate-buyer/monthly-meetings/update-status`,
      data
    );
  }
  // associate buyer : assocaite buyer details - Ab Repurchase summary
  getABRepurchaseSummaryDetail(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/repurchase/summary`, data);
  }

  // associate buyer : assocaite buyer details - Ab Repurchase
  getAbRepurhaseRowDetailData(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/repurchase/details`, data);
  }

  // associate buyer : AB Not Purchase OTP - GET the AB Details For OTP Check
  getABDetailsForOtpCheck(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/not-purchase-otp/`, data);
  }

  // associate buyer : AB Not Purchase OTP - Update the AB Details For OTP Check
  updateABDetailsForOtpCheck(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/not-purchase-otp/update/`, data);
  }

  // Delete Info: get bank account details
  getBankAccountDetails(request) {
    return this.httpRequest("POST", `/kyc-admin/delete-info/bank/get-ab-for-bank-details`, request);
  }

  // Delete Info: delete bank account details
  deleteBankAccountDetails(request) {
    return this.httpRequest(
      "POST",
      `/kyc-admin/delete-info/bank/update-bank-details-check`,
      request
    );
  }

  // Delete Info: get pan number details
  getPANNumberDetails(request) {
    return this.httpRequest("POST", `/kyc-admin/delete-info/pan/get-ab-for-pan-details`, request);
  }

  deletePANNumberDetails(request) {
    return this.httpRequest("POST", `/kyc-admin/delete-info/pan/update-pan-details-check`, request);
  }

  // Delete Info: get AB profile photo
  getABProfilePhoto(request) {
    return this.httpRequest(
      "POST",
      `/kyc-admin/delete-info/ab-photo/get-ab-for-profile-photo`,
      request
    );
  }

  // Delete Info: delete AB profile photo
  deleteABProfilePhoto(request) {
    return this.httpRequest("POST", `/kyc-admin/delete-info/ab-photo/delete-ab-photo`, request);
  }

  // Report => kyc declaration report
  kycDeclarationReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/declaration-report`, data);
  }
  // Report => Kyc details report
  kycDetailsReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/detail-report`, data);
  }

  // KYC : get-identity-proof
  getIdentityProof() {
    return this.httpRequest("GET", `/kyc/get-identity-proof`);
  }

  // KYC : get-address-proof
  getAddressProof() {
    return this.httpRequest("GET", `/kyc/get-address-proof`);
  }

  // Report => Kyc Not Ok Report
  kycNotOKReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/not-ok-report`, data);
  }

  // Report => Kyc  Current business
  kycCurrentBusiness(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/current-business/self-bus`, data);
  }
  //  Report => Kyc  Current business => down line
  kycCurrentBusinessDownLine(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/current-business/down-bus`, data);
  }

  // Report => Kyc feeding user
  getKycFeeding(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/feed-user/get-details`, data);
  }

  // Declaration => mobile declaration
  mobileDeclaration(data) {
    return this.httpRequest("POST", `/kyc-admin/declaration/mobile/update-mobile`, data);
  }
  // generic : financial years list
  getFinancialYearsList() {
    return this.httpRequest("GET", `/kyc-admin/generic/available-fiscal-years`);
  }

  // associate buyer : ab stop payment details
  getAbStopPaymentDetails(data, page, pageSize, searchTerm) {
    let url = `/kyc-admin/associate-buyer/payment-details/${page}/${pageSize}`;

    // Append the searchTerm if provided
    if (searchTerm) {
      url += `?searchTerm=${searchTerm}`;
    }

    return this.httpRequest("POST", url, data);
  }

  //  Reports => terminate repurchase report
  listTerminateRepurchase(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/terminate-repurchase`, data);
  }

  // List => monthly meeting Report
  listMonthlyMeetingReport(data) {
    return this.httpRequest("POST", `/kyc-admin/lists/download-monthly-meetings/get-all`, data);
  }
  // KYC - Get Simialar Entities
  getKycSimilarEntities(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/similar-kyc`, data);
  }

  // KYC - Get KYC New Entry
  getKycNewEntryDetails(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/new-entry/get-details`, data);
  }

  // KYC - Get KYC Todays Users
  getKycTodaysUsersDetails(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/todays-users/get-details`, data);
  }

  // KYC - Get KYC Old Entry
  getKycOldEntryDetails(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/old-entry/get-details`, data);
  }

  // KYC - Get KYC Rejection Reasons
  getKYCRejectionReasons() {
    return this.httpRequest("GET", `/kyc-admin/generic/reject-reason`);
  }

  // KYC - Update New Entry KYC Status
  updateNewKycStatus(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/new-entry/update-status`, data);
  }

  // KYC - Update Old Entry KYC Status
  updateOldKycStatus(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/old-entry/update-details`, data);
  }

  // compliance documents : add/edit compliance documents
  addUpdateComplianceDocuments(id, data, multiPart = true) {
    if (id) {
      return this.httpRequest("PUT", `/compliance_documents/${id}`, data, { multiPart });
    } else {
      return this.httpRequest("POST", `/compliance_documents`, data, { multiPart });
    }
  }

  // compliance documents : get single  compliance documents data
  getSingleComplianceDocumentsData(id) {
    return this.httpRequest("GET", `/compliance_documents/${id}`);
  }

  // compliance documents : delete compliance documents
  deleteSingleComplianceDocuments(data) {
    return this.httpRequest("DELETE", `/compliance_documents`, data);
  }

  // faqs : add/edit faqs
  addUpdateFaqs(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/faqs/${id}`, data);
    } else {
      return this.httpRequest("POST", `/faqs`, data);
    }
  }

  // employee : add/edit employee
  addUpdateEmployee(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/employee/update`, data);
    } else {
      return this.httpRequest("POST", `/employee/add`, data);
    }
  }

  // employees : delete employees
  deleteEmployee(data) {
    return this.httpRequest("POST", `/employee/delete`, data);
  }

  // faqs : get single faqs data
  getSingleFaqsData(id) {
    return this.httpRequest("GET", `/faqs/${id}`);
  }

  // employee : get single employee data
  getSingleEmployeeData(id) {
    return this.httpRequest("GET", `/employee/by-id/${id}`);
  }

  // bank : get all bank list
  getBankList(apiUrl, payload) {
    return this.httpRequest("POST", `${apiUrl}`, payload);
  }

  // bank : get single bank data
  getSingleBankData(id) {
    return this.httpRequest("GET", `/bank/by-id/${id}`);
  }

  // bank : add/edit bank
  addUpdateBank(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/bank/update`, data);
    } else {
      return this.httpRequest("POST", `/bank/add`, data);
    }
  }

  // branches : get all branches list
  getBranchList(apiUrl, payload) {
    return this.httpRequest("POST", `${apiUrl}`, payload);
  }

  // branches : get single branches data
  getSingleBranchData(id) {
    return this.httpRequest("GET", `/branches/by-id/${id}`);
  }

  // branches : add/edit branches
  addUpdateBranch(id, data) {
    if (id) {
      return this.httpRequest("PUT", `/branches/update`, data);
    } else {
      return this.httpRequest("POST", `/branches/add`, data);
    }
  }

  // faqs : delete faqs
  deleteSingleFaqs(data) {
    return this.httpRequest("DELETE", `/faqs`, data);
  }

  // lists : get technical leader details by ab no
  getTechnicalLeaderDetails(data) {
    return this.httpRequest("POST", `/kyc-admin/lists/leader-tree`, data);
  }
  // lists : get technical leader downline
  getTechnicalLeaderDownlineDetails(data) {
    return this.httpRequest("POST", `/kyc-admin/lists/leader-tree/downline`, data);
  }

  //  List => technical core leaders
  getTechnicalCoreLeaders(data) {
    return this.httpRequest("POST", `/kyc-admin/lists/technical-core-list/get-core-list`, data);
  }

  //  List => Get E-Kyc List Options
  getEkycListDropdown() {
    return this.httpRequest("GET", `/kyc-admin/generic/ekyc-list-dropdown`);
  }

  //  List => Get E-Kyc List Options
  getEkycListByType(data) {
    return this.httpRequest("POST", `/kyc-admin/lists/ekyc-list/get-details`, data);
  }

  // Associate Buyer => Get the available years
  getPurchaseDownloadAvailableYears() {
    return this.httpRequest(
      "GET",
      `/kyc-admin/associate-buyer/ab-purchase-download/available-years`
    );
  }

  // Associate Buyer => Get the available months
  getPurchaseDownloadAvailableMonths() {
    return this.httpRequest(
      "GET",
      `/kyc-admin/associate-buyer/ab-purchase-download/available-months`
    );
  }

  // Associate Buyer => Get the AB Purchase Download Report
  getPurchaseDownloadReport(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/ab-purchase-download/`, data);
  }
  // Associate Buyer => Sms Diamond Club
  getSmsDiamondClub(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/sms-diamond-club/send`, data);
  }

  // Terminate : get ab details
  getAbDetailsForTermination(data) {
    return this.httpRequest("POST", `/kyc-admin/terminate-mod/insert/get-details`, data);
  }

  // Terminate : update termination status of AB
  updateABTerminationStatus(data) {
    return this.httpRequest("POST", `/kyc-admin/terminate-mod/insert/update-status`, data);
  }

  // soft terminate : soft terminate associate buyer
  getUserForSoftTermination(data) {
    return this.httpRequest("POST", `/kyc-admin/terminate-mod/executive-feed/get-details`, data);
  }

  // soft terminate : soft terminate associate buyer
  softTerminateUser(data) {
    return this.httpRequest("POST", `/kyc-admin/terminate-mod/executive-feed/update-status`, data);
  }

  // document update => Ab photo update
  getABPhotoUpdate(data) {
    return this.httpRequest("POST", `/kyc-admin/doc-update/ab-photo-update/check-ab-photo`, data);
  }
  // document update => Ab photo update
  getABPhotoUpload(data, multiPart = true) {
    const distNo = data instanceof FormData ? data.get("dist_no") : data?.dist_no;
    return this.httpRequest(
      "POST",
      `/kyc-admin/doc-update/ab-photo-update?dist_no=${distNo}`,
      data,
      {
        multiPart
      }
    );
  }
  // document update : get ab details by ab no
  getDocUpdateAbDetailsByAbNo(data) {
    return this.httpRequest("POST", `/kyc-admin/doc-update/pan-update/ab-details`, data);
  }
  // document update : add pan details
  addPanDetails(data, multiPart = true) {
    const distNo = data instanceof FormData ? data.get("dist_no") : data?.dist_no;
    return this.httpRequest("POST", `/kyc-admin/doc-update/pan-update?dist_no=${distNo}`, data, {
      multiPart
    });
  }

  // generic: API call to get identity proof list
  getGenericIdentityProofList() {
    return this.httpRequest("GET", `/kyc-admin/generic/get-identity-proof`);
  }

  // generic : API call to get address proof list
  getGnenericAddressProofList() {
    return this.httpRequest("GET", `/kyc-admin/generic/get-address-proof`);
  }

  // document update : add pan details
  updateAbAddressAndIdProof(data, multiPart = true) {
    const distNo = data instanceof FormData ? data.get("dist_no") : data?.dist_no;
    return this.httpRequest(
      "POST",
      `/kyc-admin/doc-update/address-id-proof?dist_no=${distNo}`,
      data,
      { multiPart }
    );
  }

  // bank update requests : get all bank update requests
  getAllBankUpdateRequests(data) {
    return this.httpRequest("POST", `/kyc-admin/update-req/bank/get-all`, data);
  }

  // bank update requests : get all bank update requests
  getSingleBankRequestDetails(data) {
    return this.httpRequest("POST", `/kyc-admin/update-req/bank/get-details`, data);
  }

  // bank update requests : bank update request
  updatebankUpdateRequest(data) {
    return this.httpRequest("POST", `/kyc-admin/update-req/bank/update-request`, data);
  }

  // pan update requests : get all pan update requests
  getAllPANUpdateRequests(data) {
    return this.httpRequest("POST", `/kyc-admin/update-req/pan/get-all`, data);
  }

  // pan update requests : get all pan update requests
  getSinglePANRequestDetails(data) {
    return this.httpRequest("POST", `/kyc-admin/update-req/pan/get-details`, data);
  }

  // pan update requests :  pan update request
  updatePANUpdateRequest(data) {
    return this.httpRequest("POST", `/kyc-admin/update-req/pan/update-request`, data);
  }

  // pan update requests :  pan update request
  getBankRejectionReasons() {
    return this.httpRequest("GET", `/kyc-admin/generic/bank-rejection-reasons`);
  }

  // enable info : get ab details for re fill kyc
  getKycRefillABDetails(request) {
    return this.httpRequest("POST", `/kyc-admin/delete-info/refill-kyc/get-ab-details`, request);
  }

  // enable info : enable re fill kyc
  enableRefillKyc(request) {
    return this.httpRequest(
      "POST",
      `/kyc-admin/delete-info/refill-kyc/enable-refill-check`,
      request
    );
  }

  //API call to add the batches
  addBatchUdaan(data) {
    return this.httpRequest("POST", `/udaan/add`, data);
  }

  //API call to update the batches
  updateBatchUdaan(data, id) {
    return this.httpRequest("PATCH", `/udaan/update/${id}`, data);
  }
  //API call to get the batch data
  getBatchUdaan(id) {
    return this.httpRequest("GET", `/udaan/get-batch/${id}`, null);
  }

  // API Call to fetch all batches
  getAllBatchesData(page = 0, pageSize = 10, searchTerm = "") {
    let url = `/udaan/all/${page}/${pageSize}`;
    if (searchTerm) {
      url += `?searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    return this.httpRequest("GET", url);
  }
  // stop AB ID : Get AB Details
  getAbDetailsForABIDStop(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/ab-id-stop/get-details`, data);
  }

  // ab reset pswrd : Get AB Details
  getAbDetailsForABResetPswrd(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/reset-pass/get-details`, data);
  }

  // mobile declaration : Get AB Details
  getAbDetailsForMobileDeclarartion(data) {
    return this.httpRequest("POST", `/kyc-admin/declaration/mobile/get-ab`, data);
  }

  //  manage executive : create executive
  createExecutive(data) {
    return this.httpRequest("POST", `/executives/create-new-executive`, data);
  }

  // manage executive : API To Make Get Request for Common API
  getExecutiveListForManageExecutives(apiUrl, payload) {
    return this.httpRequest("POST", `${apiUrl}`, payload);
  }

  // manage employees : API To Make Get Request for Common API
  getEmployeeListForManageEmployees(apiUrl, payload) {
    return this.httpRequest("POST", `${apiUrl}`, payload);
  }

  // manage executive : get single executive data
  getSingleExecutiveData(id) {
    return this.httpRequest("GET", `/executives/get-single-executive/${id}`);
  }
  // manage executive : update single executive data
  updateSingleExecutiveData(data, id) {
    return this.httpRequest("PUT", `/executives/update-executive/${id}`, data);
  }

  // manage executive : delete executive(s)
  deleteExecutive(data) {
    return this.httpRequest("POST", `/executives/delete-multiple-executives`, data);
  }

  // assign kyc lead : get total number of kyc leads
  getNumberofKYCLeads(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/assign-kyc/get-kyc-leads`, data);
  }

  // assign kyc lead : get all execuitives list for assigning  kyc leads
  getExecutivesList() {
    return this.httpRequest("GET", `/executives/get-executives-lists`);
  }

  // assign kyc lead : get total number of kyc leads
  assignKycLeads(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/assign-kyc/assign-leads`, data);
  }
  // executive feedback report : Get User wise details
  getExecutivesForFeedbacks(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/executive-feed/get-details`, data);
  }

  // executive feedback report : Get Approved Rejected kycs by user
  getApprovedRejectedKYCs(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/executive-feed/report`, data);
  }

  // executive feedback report : Get the AB Details for the Head Executive
  getABDetailsForHeadExecutive(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/executive-feed/ab-details`, data);
  }

  // executive feedback report : Update the final status for the KYC by Head Executive
  updateFinalKYCStatusByHeadExecutive(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/executive-feed/update-kyc-status`, data);
  }

  getAllBrandsList() {
    return this.httpRequest("GET", `/brands/brandList/all`);
  }

  // Reports: get self PV report - fetch data
  getSelfPVReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/self-pv-report`, data);
  }

  // API call to get Diamond Club
  getDiamondClubData(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/diamond-club-purchase`, data);
  }

  // Generic: get all brands for KYC
  KYC_getAllBrandList() {
    return this.httpRequest("GET", `/kyc-admin/generic/all-brands`);
  }

  // miscellanous : get died ab details
  getDiedABDetails(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-extra/death-case/get-old-details`, data);
  }

  // miscellanous : get new ab details
  getNewABDetailsForDeathCase(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-extra/death-case/get-new-details`, data);
  }

  // API Call to fetch all Registered Users
  getRegisteredUsersUdaan(page = 1, pageSize = 10, searchTerm = "", filterTerm, batchType) {
    let url = `/udaan/all-registered-udaan-users/${page}/${pageSize}?`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (filterTerm) {
      url += `&filterTerm=${filterTerm}`;
    }
    if (batchType) {
      url += `&batchType=${encodeURIComponent(batchType)}`;
    }
    return this.httpRequest("GET", url);
  }

  // API Call to fetch all Registered Users and download
  downloadRegisteredUsers(searchTerm = "", filterTerm, batchType) {
    let url = `/udaan/download-registered-users?`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (filterTerm) {
      url += `&filterTerm=${filterTerm}`;
    }
    if (batchType) {
      url += `&batchType=${encodeURIComponent(batchType)}`;
    }
    return this.httpRequest("GET", url);
  }

  // API Call to fetch all Eligible Users and download
  downloadEligibleUsers(searchTerm = "", filterTerm, batchType) {
    let url = `/udaan/download-eligible-users?`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (filterTerm) {
      url += `&filterTerm=${filterTerm}`;
    }
    if (batchType) {
      url += `&batchType=${encodeURIComponent(batchType)}`;
    }
    return this.httpRequest("GET", url);
  }

  // API Call to fetch all summary of Users and download
  downloadSummaryOfUsers(searchTerm = "", filterTerm, batchType) {
    let url = `/udaan/download-summary?`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (filterTerm) {
      url += `&filterTerm=${filterTerm}`;
    }
    if (batchType) {
      url += `&batchType=${encodeURIComponent(batchType)}`;
    }
    return this.httpRequest("GET", url);
  }

  // API Call to fetch all Eligible Users
  getEligibleUsersUdaan(page = 1, pageSize = 10, searchTerm = "", filterTerm, batchType) {
    let url = `/udaan/all-eligible/${page}/${pageSize}?`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (filterTerm) {
      url += `&filterTerm=${filterTerm}`;
    }
    if (batchType) {
      url += `&batchType=${encodeURIComponent(batchType)}`;
    }
    return this.httpRequest("GET", url);
  }
  // API Call to fetch all Registered Summary
  getAllSummary(page = 1, pageSize = 10, searchTerm = "", filterTerm, batchType) {
    let url = `/udaan/all-summary/${page}/${pageSize}?`;
    if (searchTerm) {
      url += `searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (filterTerm) {
      url += `&filterTerm=${filterTerm}`;
    }
    if (batchType) {
      url += `&batchType=${encodeURIComponent(batchType)}`;
    }
    return this.httpRequest("GET", url);
  }

  // reports: Non Purchasing AB Report
  getNonPurchasingABReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/terminate-list`, data);
  }

  // miscellanous :  update deat case
  updateDeathCase(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-extra/death-case/update-details`, data);
  }

  // Get All Bank List for Branches
  getAllBanksList() {
    return this.httpRequest("GET", `/branches/get-all-banks`);
  }

  // Search AB Details By State - Get All States
  getStatesForSearchABByName(data) {
    return this.httpRequest("GET", `/kyc-admin/generic/get-state`, data);
  }

  // Search AB Details By State - Get All Districts
  getDistrictForSearchABByName(data) {
    return this.httpRequest("GET", `/kyc-admin/generic/get-district?state_code=${data}`);
  }

  // Search AB Details By State - Get All Associate Buyers by state and district
  searchABByStateDistrictName(page, pageSize, data) {
    return this.httpRequest("POST", `/kyc-admin/search-info/ab-by-name/${page}/${pageSize}`, data);
  }

  // Reports : amount wise ab count report
  getABCountByAmountWiseReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/amount-wise-ab-count`, data);
  }

  // Reports : Pin Achiever Report
  getPinAchieverReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/pin-achiever-report`, data);
  }

  // Search AB Details : get ab details by reference number
  fetchAbDetailsByReferenceNo(data) {
    return this.httpRequest("POST", `/kyc-admin/search-info/reference`, data);
  }

  // Generic => Get the available years
  getAvailableYearsforKYC() {
    return this.httpRequest("GET", `/kyc-admin/generic/available-years`);
  }

  // Associate Buyer => Get the available months
  getAvailableMonthsforKYC() {
    return this.httpRequest("GET", `/kyc-admin/generic/available-months`);
  }

  // Ab Name Update : get ab details
  getABDetailsForNameUpdate(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/name-update/get`, data);
  }

  // Ab Name Update : update ab details
  updateABName(data) {
    return this.httpRequest("POST", `/kyc-admin/associate-buyer/name-update/update`, data);
  }

  // Associate Buyer => Get the AB Purchase Download Report
  getLastSixMonthsPurchaseReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/ab-last-6-months/`, data);
  }

  // ab bank accnt update : get ab details
  getAbDetailsForBankDetailsUpdate(data) {
    return this.httpRequest("POST", `/kyc-admin/doc-update/ab-bank-update/get-details`, data);
  }

  //ab bank accnt update : API call to get banks list
  getBanksList() {
    return this.httpRequest("GET", `/kyc-admin/generic/all-banks`);
  }

  // ab bank accnt update : : API call to get bank branches list
  getBankBranchesList(data) {
    return this.httpRequest("POST", `/kyc-admin/generic/all-branches`, data);
  }

  // ab bank accnt update : get states list for bank update
  getStatesListForBankUpdate() {
    return this.httpRequest("GET", `/kyc-admin/generic/get-state`);
  }

  // ab bank accnt update : update ban accnt details api
  updateABBankAccntDetails(data, multiPart = true) {
    const distNo = data instanceof FormData ? data.get("dist_no") : data?.dist_no;
    return this.httpRequest(
      "POST",
      `/kyc-admin/doc-update/ab-bank-update/update-bank-details?dist_no=${distNo}`,
      data,
      { multiPart }
    );
  }

  // finance: get generated business - to get the generated business ( Commission )
  getGeneratedBusiness(data) {
    const { page, pageSize, searchTerm } = data || {};
    let queryParams = new URLSearchParams();

    if (page !== undefined && page !== null) queryParams.append("page", page);
    if (pageSize !== undefined && pageSize !== null) queryParams.append("pageSize", pageSize);
    if (searchTerm !== undefined && searchTerm !== null)
      queryParams.append("searchTerm", searchTerm);

    let url = `/business-generation/fetch-business${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;
    return this.httpRequest("GET", url);
  }

  // finance: generate business - this will get all the generated business of all the users
  generateBusiness() {
    return this.httpRequest("POST", `/business-generation/generate-business`, {});
  }

  // finance: download business - this will download the excel report
  async downloadBusiness() {
    const path = "/business-generation/download-business";
    try {
      let token = localStorage.getItem("Authorization");
      return await fetch(`${this.basePath}${path}`, {
        method: "GET",
        headers: {
          ...{ Authorization: `Bearer ${token}` }
        }
      });
    } catch (e) {
      return new Promise((_, reject) => reject);
    }
  }

  // KYC - Verification - Get all assigned kycs to the executive
  getAssignedKYCToExecutive(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/verification/get-exec-current-leads`, data);
  }

  // KYC - Verification - Get ab details for executive revirew
  getAbDetailsForExecutiveReview(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/verification/review-ab-details`, data);
  }

  // KYC - Verification - Assign a new kyc lead to the executive
  assignNewKYCToExecutive() {
    return this.httpRequest("GET", `/kyc-admin/kyc-mod/verification/assign-new-kyc-lead`);
  }

  // KYC - Verification - Update the kyc status by executive
  updateKYCStatusByExecutive(data) {
    return this.httpRequest("POST", `/kyc-admin/kyc-mod/verification/update-kyc-status`, data);
  }

  // AB Photo - Get AB Photo By Number
  getABPhotoByDistNumber(data) {
    return this.httpRequest("POST", `/kyc-admin/generic/get-ab-photo`, data);
  }

  // get Ecom users for permission
  getAllEcomUserForPermission(url) {
    return this.httpRequest("GET", `/ecom-user-permission/all` + url);
  }
  // get single Ecom users for permission
  getSingleEcomUserForPermission(data) {
    return this.httpRequest("GET", `/ecom-user-permission/` + data);
  }
  // update Ecom users for permission
  updateEcomUserPermission(id, data) {
    return this.httpRequest("PUT", `/ecom-user-permission/` + id, data);
  }

  // GET Ecom Permission
  getAllPermission() {
    return this.httpRequest("GET", `/ecom-user-permission/permission`);
  }
  // ADMIN REPORTS => Death Case Report
  getDeathCaseReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/death-case`, data);
  }

  // ADMIN REPORTS => Stopped AB Report
  getStoppedABReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/stop-ab`, data);
  }

  // ADMIN REPORTS => Terminate AB Report
  getTerminateABReport(data) {
    return this.httpRequest("POST", `/kyc-admin/reports/terminate-ab`, data);
  }

  pvBulkUpload(data, randomId, multiPart = false) {
    return this.httpRequest("POST", `/utility/bulk-upload/${randomId}`, data, { multiPart });
  }

  bulkUploadUpdatePrice(data, randomId, multiPart = false) {
    return this.httpRequest("POST", `/update-price/bulk-upload/${randomId}`, data, { multiPart });
  }

  // Get All Depots
  getAllDepots({ page = 0, pageSize = 10, searchTerm }) {
    let url = `/public-depots/get-all/${page}/${pageSize}`;

    // Append the searchTerm if provided
    if (searchTerm) {
      url += `?searchTerm=${searchTerm}`;
    }
    return this.httpRequest("GET", url);
  }

  // Get Single Depot
  getSingleDepot(id) {
    return this.httpRequest("GET", `/public-depots/get-by-id/${id}`);
  }

  // Add New Depot
  addNewDepot(data) {
    return this.httpRequest("POST", `/public-depots/add-depot`, data);
  }

  // Update Depot
  updateDepot(id, data) {
    return this.httpRequest("PUT", `/public-depots/update-depot/${id}`, data);
  }

  // Get All Country States
  getAllStatesForDepot() {
    return this.httpRequest("GET", `/generic/get-all-country-states-for-depot`);
  }

  // Profile Menu Management - Get All Ecom Profile Menu
  getAllEcomProfileMenu() {
    return this.httpRequest("GET", `/ecom-modules/get-all-modules`);
  }

  // Profile Menu Management - Get Single Ecom Profile Menu
  getSingleEcomProfileMenu(id) {
    return this.httpRequest("GET", `/ecom-modules/get-module-by-id/${id}`);
  }

  // Profile Menu Management - Add New Ecom Profile Menu
  addNewEcomProfileMenu(data) {
    return this.httpRequest("POST", `/ecom-modules/add-module`, data, { multiPart: true });
  }

  // Profile Menu Management - Update Ecom Profile Menu
  updateEcomProfileMenu(id, data) {
    return this.httpRequest("PUT", `/ecom-modules/update-module/${id}`, data, { multiPart: true });
  }
  // API call to get state list
  getStatesGeneric() {
    return this.httpRequest("GET", `/generic/state-list`);
  }
  //API call to get all the parent categories
  getAllParentCategories() {
    return this.httpRequest("GET", "/categories/get-all/parent-categories");
  }

  /**
   * Create AB Scheduled Message API Call
   * @param {*} data
   * @returns
   */
  createAbScheduledMessageData(data) {
    return this.httpRequest("POST", `/ab-schedule-messages`, data, { multiPart: true });
  }

  /**
   * Update AB Scheduled Message API Call
   * @param {*} data
   * @param {*} id
   * @returns
   */
  updateAbScheduledMessageData(data, id) {
    return this.httpRequest("PUT", `/ab-schedule-messages/${id}`, data, { multiPart: true });
  }

  /**
   * Delete AB Scheduled Messages API Call
   * @param {*} data
   * @returns
   */
  deleteAbScheduledMessages(data) {
    return this.httpRequest("DELETE", `/ab-schedule-messages`, data);
  }

  /**
   * Get Single AB Scheduled Message API Call
   * @param {*} id
   * @returns
   */
  getSingleAbScheduledMessageData(id) {
    return this.httpRequest("GET", `/ab-schedule-messages/${id}`);
  }

  /**
   * Get brand related categories
   * @param {*} brand_id
   * @returns
   */
  getBrandRelatedCategories(brand_id) {
    return this.httpRequest("GET", `/products/categories/0/1000?brand_id=${brand_id}`);
  }
}
