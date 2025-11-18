/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { Button, Form, Input, Checkbox, Flex, Space, Typography, theme, Card } from "antd";

import { LockOutlined, UserOutlined } from "@ant-design/icons";

import { NavLink, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { useSnackbar } from "notistack";
import { MESSAGES, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import Loader from "Components/Shared/Loader";
import mainLogo from "../../Static/img/logo.svg";
import loginBg from "../../Static/img/login_bg.svg";
import { extractTokenDetails, validationNumber } from "Helpers/ats.helper";
import { Content } from "antd/es/layout/layout";
import { SentryCaptureException } from "sentry";

const Login = () => {
  const navigate = useNavigate();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [clientReady, setClientReady] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { loggedIn, setLoggedIn, setuserDetails, setAuthErr } = useUserContext();

  const { mutate, isLoading } = useMutation((data) => apiService.adminLogin(data), {
    onSuccess: (data) => {
      //show success message
      if (data) {
        enqueueSnackbar(MESSAGES.SUCCESS_LOGIN, snackBarSuccessConf);
        // Login Properties

        localStorage.setItem("Authorization", data?.data);
        // Set is crm user true or false
        localStorage.setItem("crmUser", data?.isCrmUser || false);

        setuserDetails(extractTokenDetails(data?.data));

        setLoggedIn(true);
        // check user are crm or not
        if (data?.isCrmUser) {
          // navigate to crm dashboard
          navigate(Paths.Crm);
        } else {
          // navigate to  dashboard
          navigate(Paths.users);
        }
      }
    },
    onError: (error) => {
      // if (error) {
      //   enqueueSnackbar(error.message, snackBarErrorConf);
      // }

      /* ------------------------------------------------------------------ */
      /* ----------------- Sentry - LOGIN ERROR ------------------- */
      /* ------------------------------------------------------------------ */

      let newError = error;
      if (error?.errors?.length > 0) {
        newError = error?.errors?.map((err) => err.message).join(", ");
      }
      SentryCaptureException(
        "MDM Login Error - [API Failed] " +
          (error?.message ? `- ${error?.message}` : "") +
          (error?.type ? `- ${error?.type}` : ""),
        new Error(newError),
        {
          tags: {
            error_source: "Authentication/Login.js"
          }
        }
      );
    }
  });

  if (loggedIn) {
    return <Loader />;
  }
  const onFinish = (values) => {
    mutate(values);
  };

  const {
    token: { colorBgContainer, colorBorder, colorBgLayout }
  } = theme.useToken();

  const StyleSheet = {
    contentSubStyle: {
      padding: "24px",
      background: colorBgLayout,
      border: `1px solid ${colorBorder}`,
      borderRadius: "10px"
    },
    boxStyle: {
      minHeight: "calc(100vh - 40px)",
      borderRadius: 6
    },
    logoStyle: {
      width: "110px",
      height: "60px"
    },
    contentStyle: {
      padding: "20px",
      margin: "0 -10px",
      backgroundImage: "url(" + loginBg + ")",
      backgroundSize: "cover"
    },
    formStyle: {
      width: 350
    },
    logoHeadingstyle: {
      marginTop: 5
    },
    loginBoxStyle: {
      border: `1px solid ${colorBorder}`,
      background: colorBgContainer,
      borderRadius: 10,
      padding: "30px"
    },
    logo_text_box: {
      textAlign: "center",
      marginBottom: "10px"
    },
    bottomMargin: {
      marginBottom: "12px"
    },
    ResetButtonStyle: {
      padding: 0,
      height: "23px",
      borderBottom: "1px dashed",
      borderRadius: 0,
      marginBottom: "12px"
    }
  };

  React.useEffect(() => {
    setAuthErr(false);
  }, []);
  useEffect(() => {
    setClientReady(true);
  }, []);
  const mobilenumberRegex = /^[0-9_]+$/; // Add your username regex pattern

  const validateMobile = (_, value) => {
    if (value && (value.length < 10 || value.length > 10)) {
      return Promise.reject("Mobile number must be of 10 digit.");
    }

    if (value && !mobilenumberRegex.test(value)) {
      return Promise.reject("Invalid mobile number.");
    }

    return Promise.resolve();
  };
  return (
    <Content style={StyleSheet.contentStyle}>
      <Flex style={StyleSheet.boxStyle} justify={"center"} align={"center"} vertical>
        <div style={StyleSheet.loginBoxStyle}>
          <div style={StyleSheet.logo_text_box}>
            <img style={StyleSheet.logoStyle} src={mainLogo} />
            {/* <Typography.Title style={StyleSheet.logoHeadingstyle} level={4}>
              RCM Business
            </Typography.Title> */}
          </div>
          <Form
            form={form}
            name="normal_login"
            layout={"vertical"}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            validationSchema={true}
            style={StyleSheet.formStyle}>
            <Form.Item
              label={"Mobile Number"}
              name="userInput"
              className="astricksPosition"
              style={StyleSheet.bottomMargin}
              rules={[
                { required: true, whitespace: true, message: "Mobile number is required" },

                {
                  validator: validateMobile
                }
              ]}>
              <Input
                prefix={<UserOutlined />}
                placeholder="Mobile number"
                size="large"
                onInput={validationNumber}
                maxLength={10}
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="user_password"
              style={StyleSheet.bottomMargin}
              rules={[{ required: true, whitespace: true, message: "Password is required" }]}>
              <Input.Password
                prefix={<LockOutlined />}
                type="password"
                placeholder="Password"
                size="large"
              />
            </Form.Item>
            <Typography.Text type="secondary">
              {"Forgot Password ? "}
              <NavLink to={`/${Paths.forgot}/sendotp`}>
                <Button type="link" style={StyleSheet.ResetButtonStyle}>
                  {"Reset Here"}
                </Button>
              </NavLink>
            </Typography.Text>

            <Form.Item shouldUpdate>
              {() => (
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="login-form-button"
                  disabled={
                    isLoading ||
                    !clientReady ||
                    !form.isFieldsTouched(true) ||
                    !!form.getFieldsError().filter(({ errors }) => errors.length).length
                  }>
                  Submit
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>
      </Flex>
    </Content>
  );
};

export default Login;
