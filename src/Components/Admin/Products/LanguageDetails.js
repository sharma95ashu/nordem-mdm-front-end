import React, { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
// import RichEditor from "Components/Shared/richEditor";
import { RULES_MESSAGES } from "Helpers/ats.constants";
import { Card, Col, Form, Input, Row, theme } from "antd";
import ProductSections from "./ProoductSection/ProductSections";
import RichEditor from "Components/Shared/richEditor";

//product's language details component
const LanguageDetails = (props) => {
  const { index, languagesList, updateLanguageList, setFieldsValue, product_id } = props;
  const [productSectionData, setProductSectionData] = useState(
    languagesList?.[index]?.product_detail_data || []
  );

  const {
    token: { colorBgLayout, paddingSM, paddingLG }
  } = theme.useToken();

  const StyleSheet = {
    style: {
      background: colorBgLayout,
      paddingTop: paddingLG,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      borderRadius: "8px"
    }
  };

  // const [minDescription, setMinDescription] = useState("");
  const [maxDescription, setMaxDescription] = useState("");

  // handle shohrt description change
  // const minHandleDescription = (value) => {
  //   const updatedList = [...languagesList];
  //   updatedList[index].short_desc = value;
  //   setMinDescription(value);

  //   setFieldsValue({ languages: updatedList });
  //   updateLanguageList(updatedList);
  // };

  // handle full description change
  const maxHandleDescription = (value) => {
    const updatedList = [...languagesList];
    updatedList[index].long_desc = value;
    setMaxDescription(value);

    setFieldsValue({ languages: updatedList });
    updateLanguageList(updatedList);
  };

  useEffect(() => {
    // setMinDescription(languagesList[index].short_desc);
    setMaxDescription(languagesList[index].long_desc);

    setFieldsValue({ languages: languagesList }); // updating form data
  }, [languagesList]);

  const sectionDataHandle = (e) => {
    try {
      const updatedList = [...languagesList];
      updatedList[index]["product_detail_data"] = e;

      setFieldsValue({ languages: updatedList });
      setProductSectionData(e);
    } catch (error) {}
  };

  return (
    <div style={StyleSheet.style}>
      <Row gutter={[12, 0]}>
        <Col span={24}>
          <Form.Item
            name={["languages", index, "product_name"]}
            label="Product Name"
            rules={[
              {
                pattern: /^\S(.*\S)?$/,
                message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
              },
              {
                pattern: /^(?!.*\s{2,}).*$/,
                message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
              },
              {
                min: 2,
                message: "Product name must be at least 2 characters long"
              },
              {
                max: 150,
                message: "Product name must be at max. 150 characters long"
              }
            ]}>
            <Input
              size="large"
              placeholder="Enter Product Name"
              onChange={(e) => {
                const updatedList = [...languagesList];
                updatedList[index].product_name = e.target.value;
                updateLanguageList(updatedList);
              }}
            />
          </Form.Item>
        </Col>
        {/* <Col span={24}>
          <Form.Item name={["languages", index, "short_desc"]} label="Short Description">
            <RichEditor
              name="short_description"
              placeholder="Enter Short Description Here"
              description={minDescription}
              handleDescription={minHandleDescription}
              image={"image"}
            />
          </Form.Item>
        </Col> */}
        <Col span={24} className="background-white">
          <Form.Item name={["languages", index, "long_desc"]} label="Full Description">
            <RichEditor
              name="full_description"
              placeholder="Enter Full Description Here"
              description={maxDescription}
              handleDescription={maxHandleDescription}
              image={"image"}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name={["languages", index, "meta_title"]}
            label="Meta Title"
            rules={[
              {
                pattern: /^.{2,100}$/,
                message: "The value must be between 2 and 100 characters long."
              },
              {
                pattern: /^\S(.*\S)?$/,
                message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
              },
              {
                pattern: /^(?!.*\s{2,}).*$/,
                message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
              }
            ]}>
            <Input
              size="large"
              placeholder="Enter Meta Title"
              onChange={(e) => {
                const updatedList = [...languagesList];
                updatedList[index].meta_title = e.target.value;
                updateLanguageList(updatedList);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["languages", index, "meta_keyword"]}
            label="Meta keywords"
            rules={[
              {
                pattern: /^.{2,300}$/,
                message: "The value must be between 2 and 300 characters long."
              },
              {
                pattern: /^\S(.*\S)?$/,
                message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
              },
              {
                pattern: /^(?!.*\s{2,}).*$/,
                message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
              }
            ]}>
            <TextArea
              rows={4}
              placeholder="Enter Meta Keyword"
              onChange={(e) => {
                const updatedList = [...languagesList];
                updatedList[index].meta_keyword = e.target.value;
                updateLanguageList(updatedList);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["languages", index, "meta_desc"]}
            label="Meta Description"
            rules={[
              {
                pattern: /^.{2,300}$/,
                message: "The value must be between 2 and 300 characters long."
              },
              {
                pattern: /^\S(.*\S)?$/,
                message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
              },
              {
                pattern: /^(?!.*\s{2,}).*$/,
                message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
              }
            ]}>
            <TextArea
              rows={4}
              placeholder="Enter Meta Description"
              onChange={(e) => {
                const updatedList = [...languagesList];
                updatedList[index].meta_desc = e.target.value;
                updateLanguageList(updatedList);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Card className="mb-20">
            <ProductSections
              getSectionData={sectionDataHandle}
              productSectionData={productSectionData}
              type="language"
              language_code={languagesList[index].language_code}
              product_id={product_id}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LanguageDetails;
