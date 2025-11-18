import React, { useRef, useState } from "react";
import AddMoreSection from "./AddMoreSection";
import CollapsableSection from "./CollapsableSection";
import { Button, Flex, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

function ProductSections(props) {
  const addRef = useRef();
  const [productSectionData, setProductSectionData] = useState(props?.productSectionData || []);
  const [formData, setFormData] = useState(null);
  const [editId, setEditId] = useState(null);

  //Function to handle the section data
  const handleSectionData = (data) => {
    data["type"] = props?.type || null;

    if (props.language_code) {
      data["language_code"] = props?.language_code || null;
    }
    if (props.product_id) {
      data["product_id"] = props.product_id || null;
    }
    if (!data["collapse"]) {
      data["collapse"] = false;
    }
    let d = [...productSectionData];

    if (editId !== null && editId >= 0) {
      d[editId] = data;
    } else {
      d = [...productSectionData, data];
    }
    setProductSectionData(d);
    props.getSectionData(d);
    resetFormData();
  };

  //Function to reset the form data
  const resetFormData = () => {
    setEditId(null);
    setFormData(null);
  };

  //Function to set the product section data
  const getUpdatedSection = (data) => {
    try {
      setProductSectionData(data);
      props.getSectionData(data);
    } catch (error) { }
  };

  //Function to set the index of the edited data and set the form data
  const getEditData = (data, i) => {
    try {
      setEditId(i);
      setFormData(data);
    } catch (error) { }
  };

  return (
    <>
      {productSectionData.length > 0 ? (
        <>
          <Flex justify="space-between" align="center">
            <Typography.Title level={5} className="removeMargin">
              Product Detail Sections
            </Typography.Title>
            <Button
              type="primary"
              onClick={() => {
                addRef.current?.openModal();
              }}
              icon={<PlusOutlined />}>
              Add Section
            </Button>
          </Flex>
        </>
      ) : (
        <>
          <Typography.Title level={5} className="removeMargin">
            Product Detail Sections
          </Typography.Title>
          <Flex justify="center" align="center">
            <Button
              type="primary"
              onClick={() => {
                addRef.current?.openModal();
              }}
              className="mt-24"
              icon={<PlusOutlined />}>
              Add Section
            </Button>
          </Flex>
        </>
      )}
      <AddMoreSection
        ref={addRef}
        handleSectionData={handleSectionData}
        formData={formData}
        resetFormData={resetFormData}
      />
      <CollapsableSection
        productSection={productSectionData}
        getUpdatedSection={getUpdatedSection}
        getEditData={getEditData}
      />
    </>
  );
}

export default ProductSections;
