import { Col, Form, Select } from "antd";
import { userDownloadGroup } from "Helpers/ats.constants";
import React from "react";

const POSResourceType = (props) => {
  const handleSelectChange = (value) => {
    try {
      if (value === "all") {
        props.form.setFieldValue(
          "to_puc_type",
          userDownloadGroup.filter((item) => item.value !== "all").map((option) => option.value)
        );
      }
    } catch (error) {}
  };

  const handeleDeSelectChange = () => {
    try {
      const otherUserVal = props.form.getFieldValue("to_puc_type");
      props.form.setFieldValue(
        "to_puc_type",
        otherUserVal?.filter((item) => item !== "all")
      );
    } catch (error) {}
  };

  return (
    <>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="to_puc_type"
          label="User Type"
          rules={[{ required: true, message: "User type is required" }]}>
          <Select
            placeholder="Select User Type"
            size="large"
            allowClear
            mode="multiple"
            options={userDownloadGroup}
            onSelect={handleSelectChange}
            onDeselect={handeleDeSelectChange}
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Col>
    </>
  );
};

export default POSResourceType;
