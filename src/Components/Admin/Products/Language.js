import { DeleteOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Popconfirm,
  Row,
  Select,
  Spin,
  theme,
  Typography
} from "antd";

import React, { useEffect, useState } from "react";
import LanguageDetails from "./LanguageDetails";
import { useServices } from "Hooks/ServicesContext";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import { snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import productLangImage from "Static/img/prod_lang_img.svg";
import { concat } from "lodash";

// Product language Component
const Language = (props) => {
  const { productLanguageForm } = props;
  const [toggledFields, setToggledFields] = useState({}); // state for managing accordion toggle
  const [languagesList, setLanguagesList] = useState([{}]); // state for managing language name and its details
  const [langList, setlangList] = useState([]); // state for dropdown lang list
  // const [productLanguageForm] = Form.useForm();

  const { setFieldsValue } = productLanguageForm; // de-structuring form methods
  const {
    token: { colorBorder, colorBgLayout, colorBgContainer, paddingSM, paddingLG, colorError }
  } = theme.useToken();
  const { apiService } = useServices();
  const params = useParams();

  const StyleSheet = {
    variantsBoxOpen: {
      transition: "ease all 0.5s",
      padding: "20px 20px 0",
      //   background: colorBgLayout,
      borderRadius: "8px",
      marginBottom: 10
    },
    verDividerStyle: {
      borderColor: colorBorder,
      height: "30px"
    },
    variantsBoxClose: {
      transition: "ease all 0.5s",
      padding: "20px 20px 0",
      borderRadius: "8px 8px 0 0"
    },
    marginBottomCustom: {
      marginTop: "-16px"
    },
    marginBottomCustomButton: {
      marginTop: "18px"
    },
    flexStyle: {
      flexWrap: "wrap"
    },
    flexInnerStyle: {
      flexGrow: "1",
      width: "25%"
    },
    variantIdStyle: {
      marginTop: "25px",
      display: "block"
    },
    uploadBtnStyle: {
      backgroundColor: "unset",
      border: "0"
    },
    cloudIconStyle: {
      fontSize: "25px",
      marginBottom: "10px"
    },
    noHover: {
      transition: "none",
      background: "inherit"
    },
    sapCodeStyle: {
      width: "100%",
      minWidth: "120px",
      maxWidth: "120px"
    },
    mainContainer: {
      paddingTop: paddingLG,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      marginRight: -paddingLG,
      marginLeft: -paddingLG,
      marginBottom: paddingSM,
      marginTop: -16,
      background: colorBgLayout,
      minHeight: "calc(100vh - 195px)"
    },
    contentSubStyle: {
      paddingTop: paddingSM,
      paddingBottom: paddingLG,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      background: colorBgContainer,
      border: `1px solid ${colorBorder}`,

      borderRadius: "10px",
      margin: "0 0 20px",
      width: "100%"
    },
    uploadBoxStyle: {
      position: "relative",
      maxWidth: "105px"
    }
  };

  // hook for fetching languages list
  const { refetch: fetchLanguages, isLoading: loadingLanguages } = useQuery(
    "fetchLanguageData",
    () => apiService.getMarketingPlanLanguage(),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.data) {
            const tempLanguagesData = data?.data?.data
              ?.filter(
                (item) =>
                  item?.status === "active" &&
                  item?.mp_language_code.toLowerCase() !== "en" &&
                  item?.mp_language_name.toLowerCase() !== "english"
              )
              ?.map((item) => ({
                label: item.mp_language_name + " - " + item?.mp_language_code,
                value: item?.mp_language_code
              }));
            setlangList(tempLanguagesData || []); // updating lang list for drop down
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // // useQuery hook for gettiing product language details
  const { refetch: fetchLanguageDetails, isLoading: prodLangDetailsLoading } = useQuery(
    "getProductLanguageDetails",
    () => apiService.getProductLanguages(params?.id),
    {
      enabled: false, //Disable the query by default
      onSuccess: (data) => {
        if (data.data) {
          setLanguagesList(data.data); // updating local state
          setFieldsValue({ languages: data.data }); // updating form data
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for creating/updating product languages via API
  const { mutate, isLoading: loadingProdLangUpdation } = useMutation(
    (data) => apiService.upudateProductLanguages(params?.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          enqueueSnackbar(data.message, snackBarSuccessConf); // Display a success Snackbar notification with the API response message
          fetchLanguageDetails(); // api call for getting product langage's details
          setToggledFields({}); // resetting toggled accordion
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // function to update language and its data
  const updateLanguageList = (val) => {
    setLanguagesList(val);
  };

  // hanlde accordion toggle
  const toggleLanguage = (index) => {
    setToggledFields((prevState) => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  // handle remove language
  const remove = (k, index) => {
    try {
      const tempData = languagesList?.filter((item, i) => i !== index);
      setFieldsValue({ languages: tempData });
      setLanguagesList(tempData);
    } catch (error) {}
  };

  // handle additon of new language
  const add = () => {
    ///updating form-data
    setFieldsValue({
      languages: [
        ...languagesList,
        {
          // id: null,
          language_code: null,
          product_name: null,
          short_desc: null,
          long_desc: null,
          meta_title: null,
          meta_keyword: null,
          meta_desc: null,
          product_detail_data: []
        }
      ]
    });
    // updating local state
    setLanguagesList([
      ...languagesList,
      {
        // id: null,
        language_code: null,
        product_name: null,
        short_desc: null,
        long_desc: null,
        meta_title: null,
        meta_keyword: null,
        meta_desc: null,
        product_detail_data: []
      }
    ]);
  };

  // handle  form submission
  const onFinish = (val) => {
    try {
      let product_arr = [];
      const data = languagesList?.map((item) => {
        product_arr = concat(product_arr, item?.product_detail_data);
        return {
          product_id: params?.id,
          language_code: item?.language_code || null,
          product_name: item?.product_name || null,
          short_desc: item?.short_desc || null,
          long_desc: item?.long_desc || null,
          meta_title: item?.meta_title || null,
          meta_keyword: item?.meta_keyword || null,
          meta_desc: item?.meta_keyword || null
          // product_detail_data: product_arr
        };
      });

      mutate({ data, product_detail_data: product_arr }); // api call to update
    } catch (error) {}
  };

  // handle langugage change from drop down
  const handleLanguageChange = (value, index) => {
    try {
      // Create a Set of existing language codes while ignoring the current index
      const seenLanguageCodes = new Set(
        languagesList.map((item, i) => (i !== index ? item.language_code : null)).filter(Boolean)
      );

      if (seenLanguageCodes.has(value)) {
        // If the value already exists, set the current language code to null
        const updatedList = [...languagesList];
        updatedList[index] = { ...updatedList[index], language_code: null };
        setLanguagesList(updatedList);
        setFieldsValue({ languages: updatedList });
        enqueueSnackbar("Duplicate language cannot be selected", snackBarErrorConf);
      } else {
        // Otherwise, update the language code at the current index
        const updatedList = languagesList.map((item, i) =>
          i === index ? { ...item, language_code: value } : item
        );
        setLanguagesList(updatedList);
        setFieldsValue({ languages: updatedList });
      }
    } catch (error) {}
  };

  // JSX for langauge details
  const formItems = languagesList?.map((k, index) => (
    <>
      <Col className="gutter-row" span={16}>
        <Form.Item
          label={"Language"}
          name={["languages", index, "language_code"]}
          rules={[{ required: true, message: "Language is required" }]}
          className="removeMargin">
          <Select
            size="large"
            placeholder="Select Language Type"
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
            options={langList}
            onChange={(val) => handleLanguageChange(val, index)}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item label={" "} className="removeMargin">
          <Popconfirm
            title="Delete"
            icon={
              <DeleteOutlined
                style={{
                  color: colorError
                }}
              />
            }
            okButtonProps={{ danger: true }}
            description="Are you sure to delete this ?"
            onConfirm={() => {
              remove(k, index);
            }}
            // onCancel={() => {}}
            okText="Yes"
            placement="left"
            cancelText="No">
            <Button type="default" danger>
              Delete
            </Button>
          </Popconfirm>
        </Form.Item>
      </Col>

      <Col span={4} key={index}>
        <Form.Item label={" "} className="removeMargin">
          <Button
            onClick={() => {
              toggleLanguage(index);
            }}
            block
            type="text">
            Update Details
            <DownOutlined />
          </Button>
        </Form.Item>
      </Col>
      {toggledFields[index] && (
        <>
          <LanguageDetails
            index={index}
            languagesList={languagesList}
            updateLanguageList={updateLanguageList}
            setFieldsValue={setFieldsValue}
            product_id={params.id}
          />
        </>
      )}
    </>
  ));

  useEffect(() => {
    fetchLanguageDetails(); // fetching product's langauge details
    fetchLanguages(); // fetching languages list
  }, []);

  return (
    <>
      <Spin fullscreen spinning={loadingLanguages || prodLangDetailsLoading} />
      <Form name="form_language" form={productLanguageForm} layout="vertical" onFinish={onFinish}>
        <div style={StyleSheet.mainContainer}>
          <div style={StyleSheet.contentSubStyle}>
            <div style={StyleSheet.variantsBoxClose}>
              <Row gutter={[24, 20]}>
                <Col className="gutter-row" span={24}>
                  <Row gutter={[24, 0]}>
                    <Col className="gutter-row" span={24}>
                      <Typography.Title level={5}>
                        Product Detail in Multiple Language
                      </Typography.Title>
                    </Col>
                  </Row>
                </Col>

                {languagesList?.length > 0 ? (
                  <>
                    {formItems}
                    <Col span={24}>
                      <Divider style={{ margin: "10px" }} />
                    </Col>
                  </>
                ) : (
                  <Col span={24}>
                    <Row align={"middle"} justify={"center"}>
                      <Col span={14}>
                        <Flex justify="center" align="center" vertical={true}>
                          <img
                            src={productLangImage}
                            alt="img"
                            style={{ width: "350px", height: "232px" }}
                          />
                          <Typography.Text className="text-center ">
                            Expand your product’s reach by adding details in multiple languages.
                            Make sure your customers can access product information in their
                            preferred language
                          </Typography.Text>
                        </Flex>
                      </Col>
                    </Row>
                  </Col>
                )}

                <Col className="gutter-row" span={24}>
                  <Flex justify="center" gap="middle">
                    <Button
                      size="large"
                      type="primary"
                      className="wrapButton"
                      onClick={() => {
                        add();
                      }}>
                      <PlusOutlined />
                      Add Language
                    </Button>
                  </Flex>
                </Col>
              </Row>
            </div>
          </div>
          {languagesList?.length > 0 && (
            <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={loadingProdLangUpdation}
                loading={loadingProdLangUpdation}>
                Save
              </Button>
            </Flex>
          )}
        </div>
      </Form>
    </>
  );
};

export default Language;
