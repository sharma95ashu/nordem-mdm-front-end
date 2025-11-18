// offer payload function
export const offerPayload = (offerType, value, productNameToBuy, productNameToGetFree) => {
  try {
    const {
      offer_name,
      offer_type,
      select_start_date_expiry_date: [start_date, expiry_date] = [],
      quantity_to_buy,
      product_to_buy,
      quantity_to_get_free,
      product_to_get_free,
      offer_status,
      supported_stores,
      specific_stores,
      amount,
      offer_description,
      supported_types,
      discount_type,
      discount_value,
      free_shipping_type,
      minimum_purchase_amount,
      applicable_users,
      type_ids,
      reduce_pv,
      applicable_buyer_type
    } = value || {}; // Destructure the relevant properties from `value`

    const commonPayload = {
      offer_name,
      offer_type,
      start_date,
      expiry_date,
      offer_status: offer_status ? "active" : "inactive",
      offer_description,
      specific_stores: specific_stores?.length > 0 ? specific_stores : null,
      supported_stores: supported_stores?.length > 0 ? supported_stores : null,
      supported_types,
      reduce_pv,
      applicable_buyer_type
    }; // common fields for each offer type

    // offer type : buy_x_get_y_free
    if (offerType == "buy_x_get_y_free") {
      let obj = {
        ...commonPayload,
        offer_options: {
          quantity_to_buy,
          product_to_buy,
          quantity_to_get_free,
          product_to_get_free,
          product_name_to_buy: productNameToBuy || null,
          product_name_to_get_free: productNameToGetFree || null
        }
      };
      return obj;
    }
    // offerType : "buy_x_amount_of_products_and_get_a_product_free"
    if (offerType == "buy_x_amount_of_products_and_get_a_product_free") {
      let obj = {
        ...commonPayload,
        offer_options: {
          amount,
          product_to_buy,
          quantity_to_get_free,
          product_to_get_free,
          product_name_to_buy: productNameToBuy || null,
          product_name_to_get_free: productNameToGetFree || null
        }
      };
      return obj;
    }
    // offerType : "buy_x_amount_of_products_and_get_a_product_on_y_prices_or_get_y%_discount"
    if (offerType == "buy_x_amount_of_products_and_get_a_product_on_y_prices_or_get_y%_discount") {
      let obj = {
        ...commonPayload,
        discount_type,
        discount_value,
        offer_options: {
          amount,
          product_to_buy,
          quantity_to_get_free,
          product_to_get_free,
          product_name_to_buy: productNameToBuy || null,
          product_name_to_get_free: productNameToGetFree || null
        }
      };
      return obj;
    }

    // offerType :  "bundle_deal"
    if (offerType == "bundle_deal") {
      let obj = {
        ...commonPayload,
        discount_type,
        discount_value,
        offer_options: {
          product_to_buy,
          quantity_to_buy,
          product_name_to_buy: productNameToBuy || null
        }
      };
      return obj;
    }

    // offerType : "free_shipping"
    if (offerType == "free_shipping") {
      let obj = {
        ...commonPayload,
        offer_options: {
          free_shipping_type,
          amount: amount,
          product_to_buy: product_to_buy,
          product_name_to_buy: productNameToBuy || null
        }
      };
      return obj;
    }

    // offerType : "default_offer"
    if (offerType == "default_offer") {
      let tempApplicableUser = [];
      if (applicable_users && typeof applicable_users[0] == "object") {
        applicable_users?.forEach((item) => {
          tempApplicableUser.push(String(item?.value));
        });
      } else if (applicable_users && applicable_users?.length > 0) {
        tempApplicableUser = applicable_users?.toString().split(",");
      } else {
        tempApplicableUser = null;
      }

      let tempTypeIds = [];
      if (type_ids && typeof type_ids[0] == "object") {
        type_ids?.forEach((item) => {
          tempTypeIds.push(String(item?.value));
        });
      } else {
        tempTypeIds = type_ids?.length > 0 ? type_ids?.toString().split(",") : null;
      }
      let obj = {
        ...commonPayload,
        discount_type,
        discount_value,
        minimum_purchase_amount: minimum_purchase_amount || 0,
        applicable_on:
          value?.applicable_on == "categories" || value?.applicable_on == "category"
            ? "category"
            : value?.applicable_on == "brands"
              ? "brand"
              : "all",
        applicable_users: tempApplicableUser,
        type_ids: tempTypeIds
      };
      return obj;
    }

    if (offerType == "buy_x_get_y_eligible") {
      let obj = {
        ...commonPayload,
        offer_options: {
          quantity_to_buy,
          product_to_buy,
          quantity_to_get_free: quantity_to_get_free,
          product_to_get_free,
          product_name_to_buy: productNameToBuy || null,
          product_name_to_get_free: productNameToGetFree || null
        }
      };
      return obj;
    }
  } catch (error) {}
};
