import {
  Button,
  Col,
  // DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  // Switch,
  theme
} from "antd";
// import RichEditor from "Components/Shared/richEditor";

import {
  languageOption,
  PermissionAction,
  RULES_MESSAGES,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";

// Ab Messgae Add/Edit Component
const FaqsAddEdit = (props) => {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  // const [description, setDescription] = useState(""); // text editor state
  // const [loading, setLoading] = useState(false);

  const {
    token: { colorText }
  } = theme.useToken();

  // UseMutation hook for  fetching single ab message data
  const { mutate: fetchFaqsData, isLoading: loadingFaqsData } = useMutation(
    (data) => apiService.getSingleFaqsData(params?.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          const { status } = data.data;
          form.setFieldsValue(data.data);
          form.setFieldValue("status", status == "active");
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // handle description change
  // const handleDescription = (value) => {
  //   try {
  //     setDescription(value);
  //     form.setFieldsValue({ description: value });
  //   } catch (error) {}
  // };

  const onFinish = (value) => {
    try {
      let data = { ...value };
      data.status = value.status ? "active" : "inactive";
      // data.display_order = 1;
      data.language_name = value?.language_id == 1 ? "english" : "hindi";

      mutate(data); // Make the API call
    } catch (error) {
      console.log("error", error);
    }
  };

  // UseMutation hook for add/edit ab message via API
  const { mutate, isLoading } = useMutation((data) => apiService.addUpdateFaqs(params?.id, data), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data) {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);
        navigate(`/${Paths.faqsList}`);
      }
    },
    onError: (error) => {
      //
    }
  });

  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    uploadBtnStyle: {
      border: 0,
      background: "none"
    },
    cloudIconStyle: {
      fontSize: "1.5rem",
      color: colorText
    },
    uploadLoadingStyle: {
      marginTop: 8,
      color: colorText
    },
    categoryStyle: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    }
  };

  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Faqs",
      icon: "faqs",
      titlePath: Paths.FaqsList,
      subtitle: params?.id ? "Edit" : "Add New",
      path: Paths.users
    });

    if (params?.id) {
      fetchFaqsData(); // api call for fetching single AB messgae data
    } else {
      //initializing default values
      form.setFieldValue("status", true);
    }
  }, []);

  // handle description change
  // const handleDescription = (value) => {
  //   try {
  //     setDescription(value);
  //     form.setFieldsValue({ answer: value });
  //   } catch (error) {}
  // };

  // const handleLanguageType = () =>{
  //   try {
  //   } catch (error) {

  //   }
  // }

  return (
    <>
      <Spin spinning={loadingFaqsData} fullscreen />
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[20, 10]}>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="question"
              label="Question"
              rules={[
                { required: true, message: `Message Title is required` },
                { pattern: /^.{0,150}$/, message: "Value should not exceed 150 characters" },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Question" size="large" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="language_id"
              label="Language"
              rules={[{ required: true, message: "Language is required" }]}>
              <Select
                placeholder="Select Language"
                block
                size="large"
                // onChange={(e) => handleLanguageType(e)}
                options={languageOption}
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 20 }}>
            <Form.Item
              name="answer"
              label="Description"
              rules={[{ required: true, message: "Description is required" }]}>
              {/* <RichEditor
                name="description"
                placeholder="Enter Description Here"
                description={description}
                handleDescription={handleDescription}
              /> */}

              <Input.TextArea
                rows={10}
                name="description"
                placeholder="Enter Description Here"
                size="large"
              />
            </Form.Item>
          </Col>
          {/* <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="display_order"
              label="Display Order"
              rules={[
                { required: true, message: `Display Order is required` },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Please enter valid number"
                },
                { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" }
              ]}>
              <Input placeholder="Enter Display Order" size="large" type="number" />
            </Form.Item>
          </Col> */}

          {/* 
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              label="Start & End Date"
              name="dateRange"
              rules={[
                {
                  required: true,
                  message: "Please select dates"
                }
              ]}>
              <DatePicker.RangePicker
                block
                placeholder="Select Date"
                format={DATEFORMAT.RANGE_FORMAT}
                size={"large"}
                disabledDate={disabledDate}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
*/}
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 6 }}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
            <Flex align="start" justify={"flex-end"}>
              <NavLink to={"/" + Paths.faqsList}>
                <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
                  Cancel
                </Button>
              </NavLink>
              {actionsPermissionValidator(
                window.location.pathname,
                params?.id ? PermissionAction.EDIT : PermissionAction.ADD
              ) && (
                <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
                  {params?.id ? "Update" : "Add"}
                </Button>
              )}
            </Flex>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default FaqsAddEdit;
