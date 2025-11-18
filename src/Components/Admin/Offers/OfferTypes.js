import React from "react";
import { Col, Form, Input, Select, Spin } from "antd"; // Ensure you import necessary components
import { APPLICABLE_ON_TYPES, snackBarErrorConf } from "Helpers/ats.constants";
import { isArray } from "lodash";
import { enqueueSnackbar } from "notistack";

// Offer Types Component
const OfferTypes = (props) => {
  const {
    offerType,
    bundleDealType,
    freeShippingType,
    newProductList,
    eligibleProduct,
    form,
    userGroupList,
    productLoading,
    listBasedOnApplicableOn,
    applicableOn,
    checkDiscountValue,
    disableMinPurchaseAmount,
    searchProduct,
    handleBundleDealTypeChange,
    handleFreeShippingTypeChange,
    handleDiscountType,
    handleApplicableOn,
    checkMinimumPriceValue,
    updateProductNameToBuy,
    updateProductNameToGetFree,
    setIsPriceSame
  } = props;

  const discountValueValidator = () => ({
    validator(_, val) {
      return new Promise((resolve, reject) => {
        let value = Number(val);
        if (val && !/^.{0,5}$/.test(val)) {
          reject("Value should not exceed 5 characters");
        } else if (value && bundleDealType && bundleDealType === "percentage" && value > 100) {
          reject("Discount value must be less than or equal to 100");
        } else {
          resolve();
        }
      });
    }
  });

  // handle product to buy select change
  const handleProductToBuyChange = (val, rec, bundle) => {
    try {
      setIsPriceSame(true);

      if (isArray(val) && val.length > 0) {
        if (bundle) {
          const allSame = rec.every((item) => item.sale_price === rec[0].sale_price);
          setIsPriceSame(allSame);
          if (!allSame) {
            form.setFieldValue("discount_type", null);
            return enqueueSnackbar(
              "All products must have the same MRP for bundle deals with fixed discount.",
              snackBarErrorConf
            );
          }
        }
        form.setFieldValue("product_to_buy", val);
      } else {
        const { label, value } = rec;
        updateProductNameToBuy(label);
        form.setFieldValue("product_to_buy", value);
      }
    } catch (error) {}
  };

  // handle product to get free select change
  const handleProductToGetFreeChange = (val, rec) => {
    try {
      const { label, value } = rec;
      form.setFieldValue("product_to_get_free", value);
      updateProductNameToGetFree(label);
    } catch (error) {}
  };

  // buy_x_get_y_free fields
  const renderBuyXgetYFields = () => {
    return (
      <>
        <Col className="gutter-row" span={4}>
          <Form.Item
            name="quantity_to_buy"
            label="Quantity to Buy"
            rules={[
              { required: true, message: "Quantity is required" },
              { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
              { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
              {
                min: 1,
                message: "Min Value is 1"
              }
            ]}>
            <Input placeholder="Quantity to Buy" size="large" type="number" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="product_to_buy"
            label="Product to Buy"
            rules={[{ required: true, message: "Product is required" }]}>
            <Select
              placeholder={`Select Product to Buy`}
              allowClear
              showSearch
              mode="multiple"
              disabled={newProductList?.length === 0}
              onSearch={searchProduct}
              loading={productLoading}
              notFoundContent={productLoading ? <Spin size="small" /> : null}
              size="large"
              options={newProductList || []}
              onChange={(val, rec) => handleProductToBuyChange(val, rec)}
              filterOption={(input, option) => {
                return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
              }}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={4}>
          <Form.Item
            name="quantity_to_get_free"
            label="Quantity to Get Free"
            rules={[
              { required: true, message: "Quantity is required" },
              { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
              { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
              {
                min: 1,
                message: "Min Value is 1"
              }
            ]}>
            <Input placeholder="Quantity to Get Free" size="large" type="number" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="product_to_get_free"
            label="Product to Get Free"
            rules={[{ required: true, message: "Product is required" }]}>
            <Select
              placeholder={`Select Product to Get Free`}
              allowClear
              showSearch
              disabled={newProductList?.length === 0}
              onSearch={searchProduct}
              loading={productLoading}
              notFoundContent={productLoading ? <Spin size="small" /> : null}
              size="large"
              options={newProductList || []}
              onChange={(val, rec) => handleProductToGetFreeChange(val, rec)}
              filterOption={(input, option) => (option?.label ?? "").includes(input)}
            />
          </Form.Item>
        </Col>
      </>
    );
  };

  //buy_x_amount_of_products_and_get_a_product_free fields
  const renderBuy_x_amount_of_products_and_get_a_product_free = () => {
    return (
      <>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="product_to_buy"
            label="Product to Buy"
            rules={[{ required: true, message: "Product is required" }]}>
            <Select
              placeholder={`Select Product to Buy`}
              allowClear
              showSearch
              disabled={newProductList?.length === 0}
              onSearch={searchProduct}
              loading={productLoading}
              notFoundContent={productLoading ? <Spin size="small" /> : null}
              size="large"
              options={newProductList || []}
              onChange={(val, rec) => handleProductToBuyChange(val, rec)}
              filterOption={(input, option) => {
                return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
              }}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: "Amuount is required" },
              { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
              { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
              {
                min: 1,
                message: "Min Value is 1"
              }
            ]}>
            <Input placeholder="Enter Amount" size="large" type="number" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="product_to_get_free"
            label="Product to Get Free"
            rules={[{ required: true, message: "Product is required" }]}>
            <Select
              placeholder={`Select Product to Get Free`}
              allowClear
              showSearch
              disabled={newProductList?.length === 0}
              onSearch={searchProduct}
              loading={productLoading}
              notFoundContent={productLoading ? <Spin size="small" /> : null}
              size="large"
              options={newProductList || []}
              onChange={(val, rec) => handleProductToGetFreeChange(val, rec)}
              filterOption={(input, option) => (option?.label ?? "").includes(input)}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="quantity_to_get_free"
            label="Quantity to Get Free"
            rules={[
              { required: true, message: "Quantity is required" },
              { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
              { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
              {
                min: 1,
                message: "Min Value is 1"
              }
            ]}>
            <Input placeholder="Quantity to Get Free" size="large" type="number" />
          </Form.Item>
        </Col>
      </>
    );
  };

  // buy_x_amount_of_products_and_get_a_product_on_y_prices_or_get_y fields
  const renderBuy_x_amount_of_products_and_get_a_product_on_y_prices_or_get_y_percent_discount =
    () => {
      return (
        <>
          <Col className="gutter-row" span={4}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[
                { required: true, message: "Amuount is required" },
                { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
                { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
                {
                  min: 1,
                  message: "Min Value is 1"
                }
              ]}>
              <Input placeholder="Enter Amount" size="large" type="number" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4}>
            <Form.Item
              name="product_to_buy"
              label="Product to Buy "
              rules={[{ required: true, message: "Product is required" }]}>
              <Select
                placeholder={`Select Product to Buy`}
                allowClear
                showSearch
                disabled={newProductList?.length === 0}
                onSearch={searchProduct}
                loading={productLoading}
                notFoundContent={productLoading ? <Spin size="small" /> : null}
                size="large"
                options={newProductList || []}
                onChange={(val, rec) => handleProductToBuyChange(val, rec)}
                filterOption={(input, option) => {
                  return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
                }}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4}>
            <Form.Item
              name="product_to_get_free"
              label="Product to Get Discount"
              rules={[{ required: true, message: "Product is required" }]}>
              <Select
                placeholder={`Select Product to Get Free`}
                allowClear
                showSearch
                disabled={newProductList?.length === 0}
                onSearch={searchProduct}
                loading={productLoading}
                notFoundContent={productLoading ? <Spin size="small" /> : null}
                size="large"
                options={newProductList || []}
                onChange={(val, rec) => handleProductToGetFreeChange(val, rec)}
                filterOption={(input, option) => (option?.label ?? "").includes(input)}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4}>
            <Form.Item
              name="quantity_to_get_free"
              label="Quantity to Get Discount"
              rules={[
                { required: true, message: "Quantity is required" },
                { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
                { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
                {
                  min: 1,
                  message: "Min Value is 1"
                }
              ]}>
              <Input placeholder="Quantity to Get Free" size="large" type="number" />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={4}>
            <Form.Item
              name="discount_type"
              label="Discount Type"
              rules={[{ required: true, message: "Field is required" }]}>
              <Select
                block
                size="large"
                placeholder="Select Discount Type"
                onChange={(val, e) => handleBundleDealTypeChange(val, e)}
                options={[
                  {
                    value: "fixed",
                    label: "Fixed Discount"
                  },
                  {
                    value: "percentage",
                    label: "Percentage Discount"
                  }
                ]}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4}>
            <Form.Item
              name="discount_value"
              label={bundleDealType === "fixed" ? "Fixed Discount" : "Percentage Discount"}
              rules={[{ required: true, message: "Field is required" }, discountValueValidator]}>
              <Input
                placeholder={bundleDealType === "fixed" ? "Fixed Discount" : "Percentage Discount"}
                type="number"
                size="large"
                disabled={!bundleDealType}
              />
            </Form.Item>
          </Col>
        </>
      );
    };

  // bundle_deal fields
  const renderBundleDealFields = () => (
    <>
      <Col className="gutter-row" span={6}>
        <Form.Item
          name="product_to_buy"
          label="Product to Buy"
          // rules={[{ required: true, message: "Product is required" }]}
        >
          <Select
            placeholder={`Select Product to Buy`}
            allowClear
            showSearch
            mode="multiple"
            disabled={newProductList?.length === 0}
            onSearch={searchProduct}
            loading={productLoading}
            notFoundContent={productLoading ? <Spin size="small" /> : null}
            size="large"
            options={newProductList || []}
            onChange={(val, rec) => handleProductToBuyChange(val, rec, true)}
            filterOption={(input, option) => {
              return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
            }}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={6}>
        <Form.Item
          name="quantity_to_buy"
          label="Quantity to Buy"
          rules={[
            { required: true, message: "Quantity is required" },
            { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
            { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
            {
              min: 1,
              message: "Min Value is 1"
            }
          ]}>
          <Input placeholder="Quantity to Buy" size="large" type="number" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={6}>
        <Form.Item
          name="discount_type"
          label="Discount Type"
          rules={[{ required: true, message: "Field is required" }]}>
          <Select
            block
            size="large"
            placeholder="Select Discount Type"
            onChange={(val, e) => handleBundleDealTypeChange(val, e)}
            options={[
              {
                value: "fixed",
                label: "Fixed Discount"
              },
              {
                value: "percentage",
                label: "Percentage Discount"
              }
            ]}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={6}>
        <Form.Item
          name="discount_value"
          label={bundleDealType === "fixed" ? "Fixed Discount" : "Percentage Discount"}
          rules={[{ required: true, message: "Field is required" }, discountValueValidator]}>
          <Input
            placeholder={bundleDealType === "fixed" ? "Fixed Discount" : "Percentage Discount"}
            type="number"
            size="large"
            disabled={!bundleDealType}
          />
        </Form.Item>
      </Col>
    </>
  );

  // free_shipping fields
  const renderFreeShippingFields = () => (
    <>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="free_shipping_type"
          label="Free Shipping Type"
          rules={[{ required: true, message: "Free Shipping Type is required" }]}>
          <Select
            block
            size="large"
            placeholder="Select Free Shipping Type"
            onChange={handleFreeShippingTypeChange}
            options={[
              { value: "minimum_order_amount", label: "Minimum Order Amount" },
              { value: "products", label: "Specific Products" }
            ]}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={6}>
        <Form.Item
          name="amount"
          label="Amount"
          rules={
            freeShippingType == "minimum_order_amount"
              ? [
                  { required: true, message: "Amuount is required" },
                  { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
                  { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
                  {
                    min: 1,
                    message: "Min Value is 1"
                  }
                ]
              : []
          }>
          <Input
            placeholder="Enter Amount"
            size="large"
            disabled={freeShippingType !== "minimum_order_amount"}
            type="number"
            onChange={(e) => {
              form.setFieldValue("product_to_buy", null);
            }}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={6}>
        <Form.Item
          name="product_to_buy"
          label="Product to Buy"
          rules={
            freeShippingType !== "minimum_order_amount" && [
              { required: true, message: "Product is required" }
            ]
          }>
          <Select
            placeholder={`Select Product to Buy`}
            allowClear
            showSearch
            disabled={freeShippingType == "minimum_order_amount"}
            onSearch={searchProduct}
            loading={productLoading}
            notFoundContent={productLoading ? <Spin size="small" /> : null}
            size="large"
            onChange={(val, rec) => {
              handleProductToBuyChange(val, rec);
              form.setFieldValue("amount", null);
            }}
            options={newProductList || []}
            filterOption={(input, option) => {
              return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
            }}
          />
        </Form.Item>
      </Col>
    </>
  );

  // default offer type fields
  const renderDefaultOfferFields = () => (
    <>
      <Col className="gutter-row" span={6}>
        <Form.Item
          name="discount_type"
          label="Discount Type"
          rules={[{ required: true, whitespace: true, message: "Discount type is required" }]}>
          <Select
            block
            size="large"
            placeholder="Select Discount Type"
            onChange={handleDiscountType}
            options={[
              { value: "percentage", label: "Percentage" },
              { value: "fixed", label: "Fixed" }
            ]}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={6}>
        <Form.Item
          name="discount_value"
          label={disableMinPurchaseAmount ? "Percentage Discount" : "Fixed Discount"}
          rules={[
            { required: true, message: "Field is required" },
            { pattern: /^[1-9]\d*$/, message: "Please enter a valid number" },
            { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
            checkDiscountValue(form)
          ]}>
          <Input type="number" placeholder="Enter Discount Value" size="large" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="minimum_purchase_amount"
          label="Minimum Purchase Amount"
          rules={
            disableMinPurchaseAmount
              ? []
              : [
                  { required: true, message: "Minimum purchase amount is required" },
                  {
                    pattern: /^(?:0|[1-9]\d{0,9}(?:\.\d+)?|1000000(?:\.0+)?)$/,
                    message: "Please enter a number up to 1,000,000,000"
                  },
                  { validator: (_, value) => checkMinimumPriceValue(_, value, form) }
                ]
          }>
          <Input
            type="number"
            placeholder="Enter Minimum Purchase Amount"
            disabled={disableMinPurchaseAmount}
            size="large"
          />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={12}>
        <Form.Item
          name="applicable_on"
          label="Applicable On"
          rules={[{ required: true, message: "Applicable on is required" }]}>
          <Select
            block
            placeholder="Select"
            size="large"
            onChange={handleApplicableOn}
            options={APPLICABLE_ON_TYPES}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="type_ids"
          label={`Select ${applicableOn}`}
          rules={applicableOn !== "all" && [{ required: true, message: `Field is required` }]}>
          <Select
            placeholder={`Select ${applicableOn}`}
            allowClear
            showSearch
            mode="multiple"
            disabled={listBasedOnApplicableOn?.length === 0}
            loading={productLoading}
            notFoundContent={productLoading ? <Spin size="small" /> : null}
            size="large"
            options={listBasedOnApplicableOn}
            filterOption={(input, option) =>
              (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase())
            }
          />
        </Form.Item>
      </Col>

      <Col
        className="gutter-row"
        xs={{ span: 24 }}
        sm={{ span: 24 }}
        md={{ span: 24 }}
        lg={{ span: 12 }}>
        <Form.Item name="applicable_users" label="User Group">
          <Select
            allowClear
            showSearch
            size="large"
            mode="multiple"
            placeholder="Select User Group"
            options={userGroupList}
            disabled={userGroupList?.length === 0}
            filterOption={(input, option) => (option?.label ?? "").includes(input)}
          />
        </Form.Item>
      </Col>
    </>
  );

  const renderBuyXgetYEligible = () => {
    return (
      <>
        <Col className="gutter-row" span={4}>
          <Form.Item
            name="quantity_to_buy"
            label="Min. Quantity to Buy"
            rules={[
              { required: true, message: "Quantity is required" },
              { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
              { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
              {
                min: 1,
                message: "Min Value is 1"
              }
            ]}>
            <Input placeholder="Quantity to Buy" size="large" type="number" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="product_to_buy"
            label="Product to Buy"
            rules={[{ required: true, message: "Product is required" }]}>
            <Select
              placeholder={`Select Product to Buy`}
              allowClear
              showSearch
              mode="multiple"
              disabled={newProductList?.length === 0}
              onSearch={searchProduct}
              loading={productLoading}
              notFoundContent={productLoading ? <Spin size="small" /> : null}
              size="large"
              options={newProductList || []}
              onChange={(val, rec) => handleProductToBuyChange(val, rec)}
              filterOption={(input, option) => {
                return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
              }}
            />
          </Form.Item>
        </Col>
        {/* <Col className="gutter-row" span={4}>
          <Form.Item
            name="quantity_to_get_free"
            label="Quantity to Get Eligible"
            rules={[
              { required: true, message: "Quantity is required" },
              { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
              { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
              {
                min: 1,
                message: "Min Value is 1"
              }
            ]}>
            <Input placeholder="Quantity to Get Free" size="large" type="number" />
          </Form.Item>
        </Col> */}
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="product_to_get_free"
            label="Select Eligible Product"
            rules={[{ required: true, message: "Product is required" }]}>
            <Select
              placeholder={`Select Product`}
              allowClear
              showSearch
              disabled={eligibleProduct?.length === 0}
              onSearch={(e) => {
                searchProduct(e, true);
              }}
              loading={productLoading}
              notFoundContent={productLoading ? <Spin size="small" /> : null}
              size="large"
              options={eligibleProduct || []}
              onChange={(val, rec) => handleProductToGetFreeChange(val, rec)}
              filterOption={(input, option) => (option?.label ?? "").includes(input)}
            />
          </Form.Item>
        </Col>
      </>
    );
  };

  switch (offerType) {
    case "buy_x_get_y_free":
      return renderBuyXgetYFields();
    case "buy_x_amount_of_products_and_get_a_product_free":
      return renderBuy_x_amount_of_products_and_get_a_product_free();
    case "buy_x_amount_of_products_and_get_a_product_on_y_prices_or_get_y%_discount":
      return renderBuy_x_amount_of_products_and_get_a_product_on_y_prices_or_get_y_percent_discount();
    case "bundle_deal":
      return renderBundleDealFields();
    case "buy_x_get_y_eligible":
      return renderBuyXgetYEligible();
    case "free_shipping":
      return renderFreeShippingFields();
    default:
      return renderDefaultOfferFields();
  }
};

export default React.memo(OfferTypes);
