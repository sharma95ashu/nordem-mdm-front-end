import React, { useState } from "react";
// import { useUserContext } from "Hooks/UserContext";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
  Upload,
  Popconfirm,
  Skeleton,
  Switch,
  theme,
  Flex,
  message
} from "antd";

import { DeleteOutlined, DownOutlined, UpOutlined, CloudUploadOutlined } from "@ant-design/icons";
import {
  ALLOWED_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_UPLOAD_FILES,
  snackBarErrorConf
} from "Helpers/ats.constants";
// eslint-disable-next-line no-unused-vars
import { validateFileSize, validateImage, validationNumber } from "Helpers/ats.helper";
import { useSortable } from "@dnd-kit/sortable";
import VariantModal from "./VariantModal";
import { useQuery } from "react-query";
// import { tabletWidth } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { useServices } from "Hooks/ServicesContext";
import { CSS } from "@dnd-kit/utilities";
// import { PointerSensor, useSensor } from "@dnd-kit/core";

const CommonVariant = (props) => {
  const {
    toggledFields,
    index,
    item,
    variantDetailForm,
    attributeData,
    handleAttributeValueChange,
    handleDelete,
    colorError,
    toggleVariant,
    getBase64,
    switchIndexesValue,
    setSwitchIndexesValue,
    onVarFinish,
    combinationError,
    setGalleryImages,
    setMainImages,
    mainImages,
    galleryImages
  } = props;
  // const { TextArea } = Input;
  // eslint-disable-next-line no-unused-vars
  const [bannerImage, setBannerImage] = useState();
  const [loadingBanner, setLoadingBanner] = useState(false);
  // const { setWindowWidth, windowWidth, } = useUserContext();
  // eslint-disable-next-line no-unused-vars
  const [fileList, setFileList] = useState([]);
  const [renderModal, setRenderModal] = useState(false);
  const { apiService } = useServices();
  // const buttonRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [activeImagePrevUrl, setActiveImagePrevUrl] = useState(null);

  // check window inner width
  // const checkInnerWidth = () => {
  //   try {
  //     return windowWidth < tabletWidth;
  //   } catch (error) { }

  //   // check window width and set inner width
  //   React.useEffect(() => {
  //     try {
  //       const handleResize = () => setWindowWidth(window.innerWidth);
  //       window.addEventListener("resize", handleResize);
  //       return () => window.removeEventListener("resize", handleResize);
  //     } catch (error) { }
  //   }, [windowWidth]);
  // };

  /**
   * Banner style css
   */
  // const bannerStyle = {
  //   width: "100%",
  //   height: "100%",
  //   objectFit: "cover"
  // };

  const {
    token: { colorBorder, colorBgLayout }
  } = theme.useToken();

  const StyleSheet = {
    marginTopStyle: {
      marginTop: "22px"
    },
    variantsBoxOpen: {
      transition: "ease all 0.5s",
      padding: "20px 20px 0",
      background: colorBgLayout,
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
      borderRadius: "8px 8px 0 0",
      borderBottom: "1px solid",
      borderColor: colorBorder
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
    }
  };

  const [allstate, setAllState] = useState([]);
  // UseQuery hook for fetching data of a all state Details from the API
  useQuery(
    "getAllStateDetails",

    // Function to fetch data of a all state Details using apiService.getSeoDetails
    () => apiService.getAllState(),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        setAllState(data?.data?.data);
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const handleChange = (info, type) => {
    // Varify the size of file
    if (!validateImage(info.file)) {
      return false;
    }

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        if (type === "banner") {
          setLoadingBanner(false);
          setMainImages((prev) => {
            let tempArr = [...prev];
            tempArr[index] = url;
            return tempArr;
          });
          setBannerImage(url);
        }
      });
    }
  };

  const uploadBannerButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      {loadingBanner ? (
        <Skeleton.Image active={loadingBanner} />
      ) : (
        <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      )}
      {!loadingBanner && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
    </button>
  );

  const handleSwitchChange = (val, cuurentIndex) => {
    try {
      let tempArr = [...switchIndexesValue];
      tempArr[cuurentIndex] = val;

      if (val) {
        setRenderModal(false);
        // variantDetailForm.setFieldValue(["attrs", index, "state_values"], []);
        variantDetailForm.setFieldValue(["attrs", index, "is_price_same_in_all_states"], true);
      } else {
        setRenderModal(true);
        variantDetailForm.setFieldValue(["attrs", index, "is_price_same_in_all_states"], false);
      }
      setSwitchIndexesValue([...tempArr]);
    } catch (error) {}
  };

  const handleStateValues = (values) => {
    try {
      if (values.state_values?.length > 0) {
        variantDetailForm.setFieldValue(["attrs", index, "state_values"], values.state_values);
        let tempArr = [...switchIndexesValue];
        tempArr[index] = false;
        setSwitchIndexesValue([...tempArr]);
        setRenderModal(false);
      }
    } catch (error) {}
  };

  //Function to submit the from for individual variant of a product
  const handleSubmit = async (index) => {
    try {
      // Define fields to validate for the given index
      // Define all fields to validate for the first index
      const fieldNames = [
        ["attrs", index, "state_values"],
        ["attrs", index, "variant_id"],
        ["attrs", index, "sap_code"],
        ["attrs", index, "display_order"],
        ["attrs", index, "long_desc"]
      ];

      attributeData?.length > 0 &&
        attributeData.map((_, mainindex) => {
          fieldNames.push([`attrs`, index, `variants_attrs`, mainindex, `attr_value`]);
        });

      // Validate the fields
      await variantDetailForm.validateFields(fieldNames);

      // If validation passes, get form values and submit
      const values = variantDetailForm.getFieldsValue();

      onVarFinish(values, index);
    } catch (error) {
      console.log("Validation failed. Fix errors before submitting.", error);
    }
  };
  // const checkStateValues = (array) => {
  //   for (let i = 0; i < array.length; i++) {
  //     const obj = array[i];
  //     const keys = Object.keys(obj);
  //     for (const key of keys) {
  //       if (obj[key] === undefined || !obj[key]) {
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // };

  // function to upload drag list for media
  const DraggableUploadListItem = ({ originNode, file }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: file.uid
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: "move"
    };

    // Handle Preview of Files
    // const handleFilePreview = (file) => {
    //   // Make values null by default
    //   setActiveImagePrevUrl(null);
    //   // handle preview for existing and new files
    //   if (file && file.originFileObj instanceof File) {
    //     let fileObj = file.originFileObj;
    //     if (
    //       fileObj.type == "image/jpeg" ||
    //       fileObj.type == "image/png" ||
    //       fileObj.type == "image/jpg"
    //     ) {
    //       let url = URL.createObjectURL(fileObj);
    //       setActiveImagePrevUrl(url);
    //     } else if (fileObj.type == "video/mp4") {
    //       // eslint-disable-next-line no-unused-vars
    //       let url = URL.createObjectURL(fileObj);
    //     }
    //   } else if (file && file.thumbUrl) {
    //     // file uploaded already case
    //     if (
    //       (file.origin_type == "remote" && !file.thumbUrl.includes(".mp4")) ||
    //       file.mime_type == "image/jpeg" ||
    //       file.mime_type == "image/png"
    //     ) {
    //       setActiveImagePrevUrl(file.thumbUrl);
    //     } else if (
    //       (file.origin_type == "remote" && file.thumbUrl.includes(".mp4")) ||
    //       file.mime_type == "video/mp4"
    //     ) {
    //     }
    //   }
    // };

    return (
      <>
        <div
          ref={setNodeRef}
          style={style}
          // prevent preview event when drag end
          className={isDragging ? "is-dragging" : ""}
          {...attributes}
          {...listeners}>
          {/* hide error tooltip when dragging */}
          {file.status === "error" && isDragging ? originNode.props.children : originNode}
        </div>
        {/* <Button
          type="link"
          ref={buttonRef}
          key={file.uid}
          block
          onClick={() => {
            handleFilePreview(file);
          }}>
          {file.mime_type?.includes("video") || file.type?.includes("video") ? (
            <PlayCircleOutlined />
          ) : (
            <FileImageOutlined />
          )}
          Preview
        </Button> */}
      </>
    );
  };

  const closeSwitchStatus = () => {
    try {
      if (variantDetailForm.getFieldValue(["attrs", index, "state_values"])?.length > 0) {
        // let statesValuesStatus = checkStateValues(
        //   variantDetailForm.getFieldValue(["attrs", index, "state_values"])
        // );
      } else {
        let tempArr = [...switchIndexesValue];
        tempArr[index] = true;
        setSwitchIndexesValue([...tempArr]);
        variantDetailForm.setFieldValue(["attrs", index, "is_price_same_in_all_states"], true);
      }
    } catch (error) {}
  };

  // Define a 2MB size limit in bytes
  const MAX_FILE_SIZE = ALLOWED_FILE_SIZE * 1024 * 1024;

  // Function to filter out files exceeding 2MB
  const filterLargeFiles = (fileList, file) => {
    try {
      if (file.size > MAX_FILE_SIZE) {
        // basicDetailForm.setFieldValue("product_gallery", null)

        message.error(`Image must be smaller than ${ALLOWED_FILE_SIZE}MB!`);

        return false; // Exclude this file from the list
      } else {
        const filteredList = fileList.filter((file) => {
          if (file.size > MAX_FILE_SIZE) {
            return false; // Exclude this file from the list
          }
          return true; // Keep this file in the list
        });

        return filteredList;
      }
    } catch (error) {}
  };

  //Function to run when the user uploads an Image
  const onChange = ({ fileList: newFileList, file }, index) => {
    // Validate file type
    const isJpgOrPngOrPdf =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg" ||
      file.origin_type === "remote";

    if (file.status === "removed") {
      setGalleryImages((prevGalleryImages) => {
        const updatedGalleryImages = [...prevGalleryImages];
        updatedGalleryImages[index] = newFileList;
        return updatedGalleryImages;
      });
    } else {
      if (!isJpgOrPngOrPdf) {
        message.error("You can only upload JPG/PNG/JPEG files!");
        return false;
      }
    }

    setLoadingBanner(false);

    // Filter out large files (existing logic)
    const filteredFileList = filterLargeFiles(newFileList, file);

    if (filteredFileList) {
      // Prevent more than 10 files
      if (filteredFileList.length === 10 && filteredFileList[9].uid === file.uid) {
        message.error("Only 10 files are allowed");
      }

      // Update galleryImages state
      setGalleryImages((prevGalleryImages) => {
        const updatedGalleryImages = [...prevGalleryImages];
        updatedGalleryImages[index] = filteredFileList;

        return updatedGalleryImages;
      });

      let arrayGalleryBody = [];
      // Update form field for gallery_images_body
      for (let i = 0; i < filteredFileList.length; i++) {
        if (isNaN(+filteredFileList[i].uid)) {
          continue;
        } else {
          arrayGalleryBody.push(filteredFileList[i].uid);
        }
      }
      variantDetailForm.setFieldValue(
        ["attrs", index, "gallery_images_body"],

        JSON.stringify(arrayGalleryBody)
      );
    }
  };

  //Function to delete the variant

  const handleDeleteVariant = (index) => {
    handleDelete(index);
  };

  /**
   * function to drag and drop of images
   * @param {*} param0
   */
  // const onDragEnd = ({ active, over }) => {
  //   if (active.id !== over?.id) {
  //     setFileList((prev) => {
  //       const activeIndex = prev.findIndex((i) => i.uid === active.id);
  //       const overIndex = prev.findIndex((i) => i.uid === over?.id);
  //       return arrayMove(prev, activeIndex, overIndex);
  //     });
  //   }
  // };

  // upload drag list for media tab

  // const sensor = useSensor(PointerSensor, {
  //   activationConstraint: {
  //     distance: 10
  //   }
  // });

  return (
    <div style={toggledFields[index] ? StyleSheet.variantsBoxOpen : StyleSheet.variantsBoxClose}>
      {combinationError[index] && (
        <Typography.Text type="danger">{combinationError[index]}</Typography.Text>
      )}
      <Row gutter={18} style={StyleSheet.AlignMiddle}>
        <>
          <Form.Item name={["attrs", index, "state_values"]} style={{ display: "none" }}>
            <Input />
          </Form.Item>
        </>

        <Col
          xs={{ flex: "100%" }}
          sm={{ flex: "100%" }}
          md={{ flex: "100%" }}
          lg={{ flex: "100%" }}
          xl={{ flex: "auto" }}>
          <Flex gap={18} style={StyleSheet.flexStyle} className="textCapitalize">
            {item?.mainid ? (
              <>
                {variantDetailForm.setFieldValue(["attrs", index, "variant_id"], item?.mainid)}
                <Form.Item name={["attrs", index, "variant_id"]} style={{ display: "none" }}>
                  <Input />
                </Form.Item>

                {/* <Col> */}
                <Typography.Text style={StyleSheet.variantIdStyle}>#{item?.mainid}</Typography.Text>
                {/* </Col> */}
              </>
            ) : (
              <>
                {/* <Col span={"2"}></Col> */}
                {switchIndexesValue[index]
                  ? variantDetailForm.setFieldValue(["attrs", index, "state_values"], [])
                  : ""}
              </>
            )}

            {attributeData.map((mainitem, mainindex) => (
              <>
                <div style={StyleSheet.flexInnerStyle} key={mainindex}>
                  {/* <Typography.Text className="textCapitalize">
                      {mainitem[0]?.attribute?.attr_name}
                    </Typography.Text> */}
                  <Form.Item
                    name={["attrs", index, "variants_attrs", mainindex, "product_variant_attr_id"]}
                    style={{ display: "none" }}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={["attrs", index, "variants_attrs", mainindex, "attr_id"]}
                    style={{ display: "none" }}>
                    <Input />
                  </Form.Item>
                  {variantDetailForm.setFieldValue(
                    ["attrs", index, "variants_attrs", mainindex, "attr_id"],
                    mainitem[0]?.attribute?.attr_id
                  )}
                  <Form.Item
                    label={mainitem[0]?.attribute?.attr_name}
                    style={StyleSheet.StyleBottom}
                    name={["attrs", index, "variants_attrs", mainindex, "attr_value"]}
                    rules={[
                      {
                        required: true,
                        message: "Attributes value is required"
                      }
                    ]}>
                    <Select
                      placeholder="Attributes Value"
                      options={mainitem[0]?.attribute_values}
                      onChange={(value) => handleAttributeValueChange(value, index, mainindex)}
                    />
                  </Form.Item>
                </div>
              </>
            ))}
          </Flex>
        </Col>
        <Col
          xs={{ flex: "100%" }}
          sm={{ flex: "100%" }}
          md={{ flex: "100%" }}
          lg={{ flex: "100%" }}
          xl={{ flex: "300px" }}>
          <Flex gap="middle" justify="end" align="center">
            <Form.Item
              name={["attrs", index, "sap_code"]}
              style={StyleSheet.sapCodeStyle}
              label="SAP Code"
              rules={[
                { required: true, message: "SAP code is required" },
                {
                  pattern: /^(?:[0-9]{3,12})(?:\.[0-9])?$/,
                  message: "The value must be between 3 and 12 characters long."
                },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Please enter valid number"
                }
              ]}>
              <Input
                placeholder="Enter SAP Code"
                type="number"
                onInput={validationNumber}
                onWheel={(e) => e.target.blur()}
              />
            </Form.Item>

            <Flex gap="middle" align="center">
              <Form.Item
                className="removeBottomPadding"
                style={StyleSheet.marginTopStyle}
                label={""}>
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
                  description="Are you sure to delete this variant ?"
                  onConfirm={() => {
                    handleDeleteVariant(index);
                  }}
                  // onCancel={() => { }}
                  okText="Yes"
                  cancelText="No"
                  placement="left">
                  <Button type="text" danger size="large" icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </Form.Item>
              <Form.Item
                className="removeBottomPadding"
                style={StyleSheet.marginTopStyle}
                label={""}>
                <Button
                  style={StyleSheet.noHover}
                  onClick={() => {
                    toggleVariant(index);
                  }}
                  block
                  type="text">
                  Update Details {toggledFields[index] ? <UpOutlined /> : <DownOutlined />}{" "}
                </Button>
              </Form.Item>

              <Form.Item
                className="removeBottomPadding"
                style={StyleSheet.marginTopStyle}
                label={""}>
                <Button
                  type="primary"
                  onClick={() => {
                    handleSubmit(index);
                  }}
                  disabled={!!combinationError[index]}>
                  Save
                </Button>
              </Form.Item>
            </Flex>
          </Flex>
        </Col>
      </Row>

      {
        <>
          <Row
            className={`toggle-content ${toggledFields[index] ? "visible" : "hidden"}`}
            gutter={18}>
            <Col span="24">
              <Form.Item name={["attrs", index, "display_order"]} label="Display Order">
                <Input placeholder="Enter Display Order" onInput={validationNumber} />
              </Form.Item>
            </Col>

            {/* <Col span="24">
              <Form.Item name={["attrs", index, "long_desc"]} label="Full Description">
                <TextArea rows={4} placeholder="Enter Full Description Here" />
              </Form.Item>
            </Col> */}
            <Row align="middle" className="fullWidth paddingNine">
              <Col span={6}>
                <Flex align="center">
                  {mainImages[index] ? (
                    <img
                      src={mainImages[index]}
                      alt="Banner"
                      className="br-4"
                      style={{
                        height: "100%",
                        width: "auto",
                        objectFit: "contain",
                        maxHeight: "104px" // Matches Ant Design picture-card default size
                      }}
                    />
                  ) : null}
                </Flex>
              </Col>
              <Col span={18}>
                <Form.Item
                  name={["attrs", index, "product_gallery"]}
                  label="Product Image"
                  extra={`Allowed formats: JPEG, PNG (Max size: ${ALLOWED_FILE_SIZE}MB)`}
                  style={{ marginBottom: "0px" }}>
                  <Upload
                    name="banner_logo"
                    listType="picture-card"
                    className="avatar-uploader"
                    accept={ALLOWED_FILE_TYPES}
                    showUploadList={false}
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={(e) => {
                      handleChange(e, "banner");
                    }}>
                    {uploadBannerButton}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Col span="24">
              {/* <DndContext sensors={[sensor]} onDragEnd={onDragEnd}> */}
              {/* <SortableContext
                  items={galleryImages[index].map((i) => i.uid)}
                  strategy={verticalListSortingStrategy}> */}
              <div className="product_gallery_cover marginInlineEndZero">
                <Form.Item
                  name={["attrs", index, "gallery_images"]}
                  label="Gallery Images"
                  extra={`Allowed formats : JPEG, PNG, JPG, Max size : ${ALLOWED_FILE_SIZE}MB, Image Resolution : 1080 x 1080 px, Max allowed images : 10`}>
                  <Upload
                    fileList={galleryImages[index] || []} // Load existing images
                    name="product_gallery"
                    className="avatar-uploader"
                    multiple={true}
                    maxCount={10}
                    onChange={(info) => onChange(info, index)} // Pass index
                    listType="picture-card"
                    accept={[ALLOWED_UPLOAD_FILES]}
                    beforeUpload={() => false}
                    itemRender={(originNode, file, fileList) => {
                      return (
                        <>
                          <DraggableUploadListItem
                            originNode={originNode}
                            file={file}
                            fileList={fileList}
                          />
                        </>
                      );
                    }}>
                    {uploadBannerButton}
                  </Upload>
                </Form.Item>
              </div>
              {/* </SortableContext>
              </DndContext> */}
            </Col>
            <Form.Item hidden name={["attrs", index, "gallery_images_body"]}></Form.Item>
            <Form.Item hidden name={["attrs", index, "main_image_id"]}></Form.Item>
            <Col span="24" style={{ marginBottom: "10px" }}>
              <Form.Item name={["attrs", index, "is_price_same_in_all_states"]}>
                <span>Is price of this variant is same for all states ?</span>
                <Switch
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                  // disabled={checkIndexExist(index)}
                  style={{ margin: "0px 10px " }}
                  value={switchIndexesValue[index]}
                  onChange={(e) => handleSwitchChange(e, index)}
                />
                {!switchIndexesValue[index] &&
                  //  !renderModal &&
                  variantDetailForm.getFieldValue(["attrs", index, "state_values"])?.length > 0 && (
                    <Button
                      type="primary"
                      onClick={() => {
                        setRenderModal(true);
                      }}>
                      View Pricing
                    </Button>
                  )}
              </Form.Item>
            </Col>
          </Row>
          {renderModal && (
            <VariantModal
              allstate={allstate}
              renderModal={renderModal}
              setRenderModal={setRenderModal}
              handleStateValues={handleStateValues}
              index={index}
              closeSwitchStatus={closeSwitchStatus}
              dataForm={variantDetailForm}
            />
          )}
        </>
      }
    </div>
  );
};

export default CommonVariant;
