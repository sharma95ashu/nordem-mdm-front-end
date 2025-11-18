import React, { useEffect, useState } from "react";
import { Button, Form, Input, Flex, Typography, theme, Tooltip } from "antd";
import { InfoCircleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { InputOTP } from "antd-input-otp";

import {
  LoginModuleError,
  MESSAGES,
  passwordMatchedValidator,
  snackBarErrorConf,
  snackBarSuccessConf,
  validateMobile,
  validateOTP
} from "Helpers/ats.constants";
import { Paths } from "Router/Paths";
import mainLogo from "../../Static/img/logo.svg";
import loginBg from "../../Static/img/login_bg.svg";
import { Content } from "antd/es/layout/layout";
import successLogo from "../../Static/img/success.svg";
import { enqueueSnackbar } from "notistack";

const ForgotPasword = () => {
  /**
   * theme color token
   */
  const {
    token: { colorBgContainer, colorBorder, colorBgLayout, padding }
  } = theme.useToken();

  /**
   * style sheet color parameter
   */
  const StyleSheet = {
    contentSubStyle: {
      padding: "24px",
      background: colorBgLayout,
      border: `1px solid ${colorBorder}`,
      borderRadius: "10px",
      width: "100%",
      maxWidth: "390px"
    },
    boxStyle: {
      minHeight: "calc(100vh - 40px)",
      borderRadius: 6
    },
    FormItem: {
      marginBottom: 14
    },
    FormItemButton: {
      marginBottom: 4,
      textAlign: "center"
    },
    FormItemResend: {
      marginBottom: 14,
      textAlign: "center"
    },
    logoStyle: {
      width: "100px",
      height: "64px"
    },
    successStyle: {
      width: "80px",
      height: "80px"
    },
    successTextStyle: {
      margin: 10
    },
    contentStyle: {
      padding: "20px",
      margin: "0 -10px",
      backgroundImage: "url(" + loginBg + ")",
      backgroundSize: "cover"
    },
    formStyle: {
      // width: 390,
      marginTop: 8
    },
    logoHeadingstyle: {
      marginTop: 5,
      marginBottom: 0
    },
    logoBottomstyle: {
      marginBottom: 8
    },
    loginBoxStyle: {
      border: `1px solid ${colorBorder}`,
      background: colorBgContainer,
      borderRadius: 10,
      padding: "30px",
      width: "100%",
      maxWidth: "390px",
      boxSizing: "border-box"
    },
    logo_text_box: {
      textAlign: "center",
      padding: padding
    },
    AlignForget: {
      textAlign: "center"
    },
    ResetButtonStyle: {
      padding: 0,
      height: "23px",
      borderBottom: "1px dashed",
      borderRadius: 0
    },
    tooltipStyle: {
      maxWidth: '500px'
    },
    ulStyle: {
      padding: '0 10px 0 20px'
    }
  };

  const tooltipContent = (
    <div>
      <ul style={StyleSheet.ulStyle}>
        <li>At least one uppercase letter</li>
        <li>At least one lowercase letter</li>
        <li>At least one digit (number)</li>
        <li>At least one special character (such as !@#$%^&*)</li>
        <li>A minimum length (e.g., 8 characters or more)</li>
      </ul>
    </div>
  );


  const navigate = useNavigate();
  const { apiService } = useServices();
  const [sendOtpForm] = Form.useForm();
  const [validateOtpForm] = Form.useForm();
  const [changePasswordForm] = Form.useForm();
  const [otp, setOtp] = useState([]);
  const [clientReady, setClientReady] = useState(false);
  const params = useParams();

  // State to hold the current time
  const [time, setTime] = useState(30);


  /**
   * useEffect hook to handle time inerval for resend otp
   */
  useEffect(() => {
    try {
      const interval = setInterval(() => {
        setTime((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);

      // Cleanup function to clear interval
      return () => clearInterval(interval);
    } catch (error) { }
  }, []); // Empty dependency array to run only once when the component mounts

  // Function to reset the timer to 30 seconds
  const resetTimer = () => {
    try {
      // Reset time to 30
      setTime(30);
    } catch (error) { }
  };

  /**
   * function to send forgot otp request using forgotPassword module
   */
  const { mutate: sendOtpSubmit, isLoading: sendOtpLoading } = useMutation(
    (data) => apiService.sendOTP(data),
    {
      onSuccess: (data) => {
        //show success message
        if (data) {
          enqueueSnackbar(MESSAGES.OTP_SUCCESS, snackBarSuccessConf);
          //   enqueueSnackbar(error.message, snackBarErrorConf);
          if (params?.type === "sendotp") {
            localStorage.setItem("forgotNumber", sendOtpForm.getFieldValue("user_phone_number"));
            validateOtpForm.setFieldValue("otp", "");
            resetTimer();
            navigate(`/${Paths.forgot}/validateotp`);
          } else if (params?.type === "validateotp") {
            navigate(`/${Paths.forgot}/changePassword`);
          } else if (params?.type === "changePassword") {
            navigate(`/${Paths.forgot}/sucessPassword`);
          }
        }
      },
      onError: (error) => {
        if (error) {
          // posNotify(error.message, posNotificationErrorConf);
        }
      }
    }
  );

  /**
   * function to validate otp request using validateOTP module
   */
  const { mutate: validateOtpSubmit, isLoading: validateOtpLoading } = useMutation(
    (data) => apiService.validateOTP(data),
    {
      onSuccess: (data) => {
        //show success message
        if (data) {
          enqueueSnackbar(MESSAGES.OTP_VALID, snackBarSuccessConf);
          localStorage.setItem("forgotKey", data?.data);
          if (params?.type === "sendotp") {
            localStorage.setItem("forgotNumber", sendOtpForm.getFieldValue("user_phone_number"));
            validateOtpForm.setFieldValue("otp", "");
            resetTimer();
            navigate(`/${Paths.forgot}/validateotp`);
          } else if (params?.type === "validateotp") {
            navigate(`/${Paths.forgot}/changePassword`);
          } else if (params?.type === "changePassword") {
            navigate(`/${Paths.forgot}/sucessPassword`);
          }
        }
      },
      onError: (error) => {
        if (error) {
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    }
  );

  /**
   * fucntion to resend otp request
   */
  const handleResend = () => {
    try {
      const data = {
        user_phone_number: localStorage.getItem("forgotNumber")
      };
      resendOtpSubmit(data);
    } catch (error) { }
  };

  /**
   * function to resend otp request using resendOTP module
   */
  const { mutate: resendOtpSubmit } = useMutation((data) => apiService.resendOTP(data), {
    onSuccess: (data) => {
      //show success message
      if (data) {
        enqueueSnackbar(MESSAGES.RESEND_OTP, snackBarSuccessConf);
        validateOtpForm.setFieldValue("otp", "");
        resetTimer();
      }
    },
    onError: (error) => {
      if (error) {
        // posNotify(error.message, posNotificationErrorConf);
      }
    }
  });

  /**
   * function to send forgot otp request using forgotPassword module
   */
  const { mutate: passwordSubmit, isLoading: passwordLoading } = useMutation(
    (data) => apiService.confirmPassword(data.load, data.id),
    {
      onSuccess: (data) => {
        //show success message
        if (data) {
          enqueueSnackbar(MESSAGES.PASSOWRD_CHANGED, snackBarSuccessConf);

          if (params?.type === "sendotp") {
            localStorage.setItem("forgotNumber", sendOtpForm.getFieldValue("user_phone_number"));
            validateOtpForm.setFieldValue("otp", "");
            resetTimer();
            navigate(`/${Paths.forgot}/validateotp`);
          } else if (params?.type === "validateotp") {
            navigate(`/${Paths.forgot}/changePassword`);
          } else if (params?.type === "changePassword") {
            navigate(`/${Paths.forgot}/sucessPassword`);
          }
        }
      },
      onError: (error) => {
        if (error) {
          // posNotify(error.message, posNotificationErrorConf);
        }
      }
    }
  );

  /**
   * reset Form
   */
  useEffect(() => {
    try {
      sendOtpForm.setFieldValue("user_phone_number", "");
      validateOtpForm.setFieldValue("otp", "");
      setOtp([]);
      changePasswordForm.setFieldValue("password", "");
      changePasswordForm.setFieldValue("confirm_password", "");
    } catch (error) { }
  }, [params]);

  /**
   * function to submit request forgot  request
   * @param {*} values
   */
  const onSubmit = (values) => {
    try {
      if (params?.type === "sendotp") {
        sendOtpSubmit(values);
      } else if (params?.type === "validateotp") {
        if (validateOtpForm.getFieldValue("otp").length === 6) {
          const data = {
            user_phone_number: localStorage.getItem("forgotNumber"),
            otp: Number(values?.otp.join(""))
          };
          validateOtpSubmit(data);
        } else {
          enqueueSnackbar(MESSAGES.OTP_NOT_VALID, snackBarErrorConf);
        }
      } else if (params?.type === "changePassword") {
        const data = {
          load: values,
          id: localStorage.getItem("forgotKey")
        };
        passwordSubmit(data);
      }
    } catch (error) {
      // return on submit error
    }
  };

  /**
   * function to handle otp
   * @param {*} value
   */
  const handleOtp = (value) => {
    try {
      if (value) {
        setOtp((prev) => [...prev, value]);
      }
    } catch (error) { }
  };
  /**
   * function to make submit button enabled
   */
  useEffect(() => {
    try {
      setClientReady(true);
    } catch (error) { }
  }, []);

  return (
    <Content style={StyleSheet.contentStyle}>
      <Flex style={StyleSheet.boxStyle} justify={"center"} align={"center"} vertical>
        {params.type === "sendotp" ? (
          <div style={StyleSheet.loginBoxStyle}>
            <div style={StyleSheet.logo_text_box}>
              <img style={StyleSheet.logoStyle} src={mainLogo} />
              <Typography.Title style={StyleSheet.logoHeadingstyle} level={5}>
                {"Forgot Password ?"}
              </Typography.Title>
              <Typography.Text style={StyleSheet.logoBottomstyle} type="secondary">
                {"Enter your registered mobile no."}
              </Typography.Text>
            </div>
            <Form
              form={sendOtpForm}
              name="normal_login"
              layout={"vertical"}
              initialValues={{ remember: true }}
              onFinish={onSubmit}
              validationSchema={true}
              style={StyleSheet.formStyle}>
              <Form.Item
                style={StyleSheet.FormItem}
                name="user_phone_number"
                className="astricksPosition"
                rules={[
                  { required: true, message: LoginModuleError.MOBILENUMBEREQUIRED },
                  {
                    validator: validateMobile
                  }
                ]}>
                <Input
                  prefix={<UserOutlined />}
                  placeholder={"Enter mobile number"}
                  size="large"
                  maxLength={10}
                />
              </Form.Item>

              <Form.Item shouldUpdate style={StyleSheet.FormItem}>
                {() => (
                  <Button
                    block
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="login-form-button"
                    disabled={
                      sendOtpLoading ||
                      !clientReady ||
                      !sendOtpForm.isFieldsTouched(true) ||
                      !!sendOtpForm.getFieldsError().filter(({ errors }) => errors.length).length
                    }>
                    {"Continue"}
                  </Button>
                )}
              </Form.Item>
              <Form.Item style={StyleSheet.FormItemButton}>
                <NavLink to={`${Paths.base}`}>
                  <Button
                    block
                    type="text"
                    htmlType="submit"
                    size="large"
                    className="login-form-button">
                    {"Back"}
                  </Button>
                </NavLink>
              </Form.Item>
            </Form>
          </div>
        ) : (
          ""
        )}
        {params.type === "validateotp" ? (
          <div style={StyleSheet.loginBoxStyle}>
            <div style={StyleSheet.logo_text_box}>
              <img style={StyleSheet.logoStyle} src={mainLogo} />
              <Typography.Title style={StyleSheet.logoHeadingstyle} level={5}>
                {"Enter OTP"}
              </Typography.Title>
              <Typography.Text style={StyleSheet.logoBottomstyle} type="secondary">
                {"We have sent OTP to "}
                {localStorage.getItem("forgotNumber")}
              </Typography.Text>
            </div>
            <Form
              form={validateOtpForm}
              name="normal_login"
              layout={"vertical"}
              initialValues={{ remember: true }}
              onFinish={onSubmit}
              validationSchema={true}
              style={StyleSheet.formStyle}>
              <Form.Item
                name="otp"
                className="astricksPosition"
                style={StyleSheet.FormItemResend}
                rules={[
                  {
                    required: true,
                    message: LoginModuleError.OTPREQUIRED
                  },
                  {
                    validator: validateOTP
                  }
                ]}>
                <InputOTP
                  length={6}
                  size="small"
                  autoSubmit={false}
                  value={otp}
                  onChange={handleOtp}
                />
              </Form.Item>
              <Form.Item style={StyleSheet.FormItemResend}>
                <Typography.Text type="secondary">
                  {time > 0 ? (
                    <>
                      {" "}
                      {"Resend OTP in"} {time} {"sec"}
                    </>
                  ) : (
                    <>
                      {"Not received OTP ?"} &nbsp;
                      <Button
                        type="link"
                        style={StyleSheet.ResetButtonStyle}
                        onClick={() => {
                          handleResend();
                        }}>
                        {"Resend OTP"}
                      </Button>
                    </>
                  )}
                </Typography.Text>
              </Form.Item>

              <Form.Item shouldUpdate style={StyleSheet.FormItem}>
                {() => (
                  <Button
                    block
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="login-form-button"
                    disabled={
                      validateOtpLoading ||
                      !clientReady ||
                      otp.length < 6 ||
                      !validateOtpForm.isFieldsTouched(true) ||
                      !!validateOtpForm.getFieldsError().filter(({ errors }) => errors.length)
                        .length
                    }>
                    {"Continue"}
                  </Button>
                )}
              </Form.Item>
              <Form.Item style={StyleSheet.FormItemButton}>
                <NavLink to={`/${Paths.forgot}/sendotp`}>
                  <Button
                    block
                    type="text"
                    htmlType="submit"
                    size="large"
                    className="login-form-button">
                    {"Back"}
                  </Button>
                </NavLink>
              </Form.Item>
            </Form>
          </div>
        ) : (
          ""
        )}
        {params.type === "changePassword" ? (
          <div style={StyleSheet.loginBoxStyle}>
            <div style={StyleSheet.logo_text_box}>
              <img style={StyleSheet.logoStyle} src={mainLogo} />
              <Typography.Title style={StyleSheet.logoHeadingstyle} level={5}>
                {"Set New Password"}
              </Typography.Title>
            </div>
            <Form
              form={changePasswordForm}
              name="normal_login"
              layout={"vertical"}
              initialValues={{ remember: true }}
              onFinish={onSubmit}
              validationSchema={true}
              style={StyleSheet.formStyle}>

              <Form.Item
                label={
                  <Tooltip overlayStyle={StyleSheet.tooltipStyle} title={tooltipContent} >
                    New Password <InfoCircleOutlined />
                  </Tooltip>
                }
                style={StyleSheet.FormItem}
                name="password"
                rules={[{ required: true, message: LoginModuleError.PASSWORDREQUIRED }, {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[A-Za-z\d\S]{8,}$/,
                  message: "The password is not strong enough."
                }]}>
                <Input.Password
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder={"Enter new password"}
                  size="large"
                />
              </Form.Item>

              <Form.Item

                label='Confirm Password'

                style={StyleSheet.FormItem}
                name="confirm_password"
                rules={[
                  { required: true, message: LoginModuleError.CONFIRMPASSWORDREQUIRED },
                  passwordMatchedValidator
                ]}>
                <Input.Password
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder={"Enter confirm password"}
                  size="large"

                />
              </Form.Item>
              <Form.Item shouldUpdate style={StyleSheet.FormItem}>
                {() => (
                  <Button
                    block
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="login-form-button"
                    disabled={
                      passwordLoading ||
                      !clientReady ||
                      !changePasswordForm.isFieldsTouched(true) ||
                      !!changePasswordForm.getFieldsError().filter(({ errors }) => errors.length)
                        .length
                    }>
                    {"Submit"}
                  </Button>
                )}
              </Form.Item>
              <Form.Item style={StyleSheet.FormItemButton}>
                <NavLink to={`/${Paths.forgot}/sendotp`}>
                  <Button
                    block
                    type="text"
                    htmlType="submit"
                    size="large"
                    className="login-form-button">
                    {"Back"}
                  </Button>
                </NavLink>
              </Form.Item>
            </Form>
          </div>
        ) : (
          ""
        )}
        {params.type === "sucessPassword" ? (
          <div style={StyleSheet.loginBoxStyle}>
            <div style={StyleSheet.logo_text_box}>
              <img style={StyleSheet.successStyle} src={successLogo} />
              <Typography.Title level={4} style={StyleSheet.successTextStyle}>
                {"Password sucessfully updated"}
              </Typography.Title>
            </div>
            <Flex justify={"center"} align={"center"} vertical>
              <Flex>
                <NavLink to={Paths.base}>
                  {" "}
                  <Button
                    block
                    type="primary"
                    htmlType="button"
                    size="large"
                    className="login-form-button">
                    {"Go to Sign In"}
                  </Button>
                </NavLink>
              </Flex>
            </Flex>
          </div>
        ) : (
          ""
        )}
      </Flex>
    </Content>
  );
};

export default ForgotPasword;
