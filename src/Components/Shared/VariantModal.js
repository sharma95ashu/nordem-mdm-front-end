import React, { useEffect, useRef, useState } from "react";
import { Modal, Table, Checkbox, Input, Form, Button } from "antd";
import { negativeValueValiation, validationFloatNumber } from "Helpers/ats.helper";

const VariantModal = (props) => {
  const { allstate, setRenderModal, index, handleStateValues, closeSwitchStatus, dataForm } = props;
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const commonSalesValue = useRef(null);
  const commonPVvalue = useRef(null);
  const commonShippingValue = useRef(null);

  useEffect(() => {
    try {
      let tempData = dataForm.getFieldValue(["attrs", index, "state_values"]);
      if (allstate && tempData) {
        allstate.forEach((state, index) => {
          tempData?.forEach((item) => {
            if (state?.state_code_old == item?.state_code) {
              form.setFieldValue(["state_values", index, "sale_price"], item?.sale_price);
              form.setFieldValue(["state_values", index, `purchase_volume`], item?.purchase_volume);
              form.setFieldValue(["state_values", index, `shipping_price`], item?.shipping_price);
            }
          });
        });
      }
    } catch (error) {}
  }, []);
  const handleSalePrice = (value) => {
    try {
      if (value?.target?.checked) {
        allstate.length > 0 &&
          allstate.map((item, index) => {
            form.setFieldValue(
              ["state_values", index, "sale_price"],
              commonSalesValue.current.input.value
            );
            form.setFields([{ name: ["state_values", index, `sale_price`], errors: [] }]);
          });
      } else {
        allstate.length > 0 &&
          allstate.map((item, index) => {
            form.setFieldValue(["state_values", index, `sale_price`], "");
          });
      }
    } catch (error) {}
  };

  const handlePVPrice = (value) => {
    try {
      if (value?.target?.checked) {
        allstate.length > 0 &&
          allstate.map((item, index) => {
            form.setFieldValue(
              ["state_values", index, `purchase_volume`],
              commonPVvalue.current.input.value
            );
            form.setFields([{ name: ["state_values", index, `purchase_volume`], errors: [] }]);
          });
      } else {
        allstate.length > 0 &&
          allstate.map((item, index) => {
            form.setFieldValue(["state_values", index, `purchase_volume`], "");
          });
      }
    } catch (error) {}
  };

  /**
   * Copy to all value pv price
   */

  const handleShippingPrice = (value) => {
    try {
      if (value?.target?.checked) {
        allstate.length > 0 &&
          allstate.map((item, index) => {
            form.setFieldValue(
              ["state_values", index, `shipping_price`],
              commonShippingValue.current.input.value
            );
            form.setFields([{ name: ["state_values", index, `shipping_price`], errors: [] }]);
          });
      } else {
        allstate.length > 0 &&
          allstate.map((item, index) => {
            form.setFieldValue(["state_values", index, `shipping_price`], "");
          });
      }
    } catch (error) {}
  };

  /**
   * Columns for table
   */
  const columns = [
    // {
    //   title: "State Code",
    //   dataIndex: "state_id",
    //   key: "state_id",
    //   render: (number) => <>{number}</>
    // },
    {
      title: "State Code",
      dataIndex: "state_code_old",
      // width: "10%",
      key: "state_code_old",
      render: (text) => <>{text}</>
    },
    {
      title: "State Name",
      dataIndex: "state_name",
      key: "state_name"
    },
    {
      title: (
        <div>
          <p>Sale Price</p>
          <Input placeholder="Sale Price" ref={commonSalesValue} />
          <label>
            <Checkbox
              onChange={(e) => {
                handleSalePrice(e);
              }}
            />
          </label>
          <span style={{ marginLeft: "5px" }}>Copy to all</span>
        </div>
      ),
      dataIndex: "sale_price",
      key: "sale_price",
      render: (text, record, index) => (
        <>
          {form.setFieldValue(["state_values", index, "state_id"], record?.state_id)}
          <Form.Item
            name={["state_values", index, "state_id"]}
            className="margin_Remove"
            style={{ display: "none" }}>
            <Input placeholder="state_id" />
          </Form.Item>
          {form.setFieldValue(["state_values", index, "state_code"], record?.state_code_old)}
          <Form.Item
            name={["state_values", index, "state_code"]}
            className="margin_Remove"
            style={{ display: "none" }}>
            <Input placeholder="state_code" />
          </Form.Item>
          <Form.Item
            name={["state_values", index, "sale_price"]}
            className="margin_Remove"
            rules={[
              { required: true, message: "Sale Price is required" },
              { pattern: /^\d+(\.\d+)?$/, message: "Negative value is not allowed" },
              { validator: negativeValueValiation }
            ]}>
            <Input placeholder="Sale Price" />
          </Form.Item>
        </>
      )
    },
    {
      title: (
        <div>
          <p>PV Price</p>
          <Input onInput={validationFloatNumber} placeholder="PV Price" ref={commonPVvalue} />
          <label>
            <Checkbox
              onChange={(e) => {
                handlePVPrice(e);
              }}
            />
          </label>
          <span style={{ marginLeft: "5px" }}>Copy to all</span>
        </div>
      ),
      dataIndex: "pv",
      key: "pv",
      render: (text, record, index) => (
        <Form.Item
          name={["state_values", index, "purchase_volume"]}
          className="margin_Remove"
          rules={[
            { required: true, message: "Purchase volume is required" },
            {
              pattern: /^.{1,8}$/,
              message: "The value must be between 1 and 8 digits long."
            },
            {
              pattern: /^[1-9]\d*(\.\d{1,2})?$/,
              message: "Value must be greater than 0 and decimal value is not allowed"
            }
          ]}>
          <Input onInput={validationFloatNumber} placeholder="Purchase Volume" />
        </Form.Item>
      )
    },
    {
      title: (
        <div>
          <p>Shipping Price</p>
          <Input placeholder="Sale Price" ref={commonShippingValue} />
          <label>
            <Checkbox
              onChange={(e) => {
                handleShippingPrice(e);
              }}
            />
          </label>
          <span style={{ marginLeft: "5px" }}>Copy to all</span>
        </div>
      ),
      key: "shipping_price",
      dataIndex: "shipping_price",
      render: (text, record, index) => (
        <Form.Item
          name={["state_values", index, "shipping_price"]}
          className="margin_Remove"
          rules={[
            { required: true, message: "Shipping price is required" },
            { pattern: /^\d+(\.\d+)?$/, message: "Negative value is not allowed" }
          ]}>
          <Input placeholder="Shipping Price" />
        </Form.Item>
      )
    }
  ];

  const handleOK = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setRenderModal(false);

    closeSwitchStatus();
  };

  const onFinish = (values) => {
    setIsModalOpen(false);
    handleStateValues(values);
  };

  return (
    <>
      <Modal
        title="Pricing Details"
        okText="Add"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        open={isModalOpen}
        // onOk={handleOK}
        onCancel={handleCancel}
        width={1000}
        height={600}
        footer={[
          <Button key="back" onClick={() => handleOK()}>
            Save & Close
          </Button>
        ]}>
        {/* initialValues={{ attrs: allstate[index].state_prices }} */}
        <Form form={form} onFinish={onFinish}>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table columns={columns} dataSource={allstate} pagination={false} />
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default VariantModal;
