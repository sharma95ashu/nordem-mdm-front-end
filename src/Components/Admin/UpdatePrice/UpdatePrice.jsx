/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Flex,
  Image,
  Modal,
  Pagination,
  Row,
  Spin,
  Table,
  Tag,
  Tooltip
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import {
  DownloadOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  UploadOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import {
  instructionsUpdatePrice,
  snackBarErrorConf,
  snackBarSuccessConf,
  statePriceBulkUpload,
  updatePriceBulkUpload
} from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { findIndex, isEmpty, set } from "lodash";
import { TextTruncate } from "Helpers/ats.helper";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import ProgressCount from "Components/Shared/ProgressCount";
import { validateHierarchy } from "./UpdatePriceHelper";
import { useNavigate } from "react-router-dom";

const UpdatePrice = (props) => {
  const { setBreadCrumb } = useUserContext();
  const [showBulkUploadModel, setshowBulkUploadModel] = useState(true);
  const [showType, setShowType] = useState("bulk_upload");
  const [dataSource, setDataSource] = useState([]);
  const [columns, setcolumns] = useState([]);
  const [recordFile, setrecordFile] = useState(null);
  const { apiService } = useServices();
  const [validFile, setvalidFile] = useState(false);
  const [showSpin, setshowSpin] = useState(false);
  const [percentageCountLoading, setPercentageCountLoading] = useState(false);
  const [current, setCurrent] = useState(1);

  const [pagination, setPagination] = useState({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50", "100"],
    total: dataSource.length,
    current: 1
  });

  const [statePrice, setStatePrice] = useState([]);
  const [showStateModel, setshowStateModel] = useState(false);
  const navigate = useNavigate();

  const stateColumn = [
    {
      title: "SAP Code",
      dataIndex: "SAP Code",
      key: "SAP Code",
      render: (value, record) => renderDataState(record, "SAP Code")
    },

    {
      title: "State",
      dataIndex: "State",
      key: "State",
      render: (value, record) => renderDataState(record, "State")
    },
    {
      title: "PV",
      dataIndex: "PV",
      key: "PV",
      render: (value, record) => renderDataState(record, "PV")
    },
    {
      title: "SP",
      dataIndex: "SP",
      key: "SP",
      render: (value, record) => renderDataState(record, "SP")
    }
  ];

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Update Price",
      icon: "category",
      path: Paths.updatePrice
    });
  }, []);

  const config = {
    name: "file",
    accept: ".xlsx, .csv, .xls",
    maxCount: 1,
    // onChange(info) {
    // },
    beforeUpload(file, fileList) {
      handlefile(file);
    }
  };

  // this method used to handel file after choose
  const handlefile = (file) => {
    try {
      if (
        checkFileExtension(file.name, "csv") ||
        checkFileExtension(file.name, "xlsx") ||
        checkFileExtension(file.name, "xls")
      ) {
        fileReader(file);
      } else {
        enqueueSnackbar("Invalid file. Accept only xlsx, xls, CSV", snackBarErrorConf);
      }
    } catch (error) {}
  };

  // This method used to check file extension
  const checkFileExtension = (filename, extension) => {
    const regex = new RegExp("\\." + extension + "$", "i");
    return regex.test(filename);
  };
  // This method used to parse file data
  const fileReader = (eFile) => {
    try {
      const file = eFile;
      if (file) {
        setshowSpin(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = e.target.result;
          const workbook = XLSX.read(data, {
            type: "binary"
            // cellDates: true
          });

          const masterSheetName = workbook.SheetNames[0]; // Data in Master sheet
          const statePriceName = workbook.SheetNames[1]; // Data in
          // Assuming the data starts from A2 (skip the header)

          const masterSheet = workbook.Sheets[masterSheetName];
          const stateSheet = workbook.Sheets[statePriceName];
          const records = XLSX.utils.sheet_to_json(masterSheet, { raw: false, defval: "" }); //{  header: 1, range: 1 }
          const recordsState = XLSX.utils.sheet_to_json(stateSheet, { raw: false, defval: "" }); //{  header: 1, range: 1 }

          // Assuming the data starts from A2 (skip the header)
          // eslint-disable-next-line no-unused-vars
          const rLength = records.length;
          const maxSize = 4 * 1024 * 1024; // 4MB in bytes
          if (rLength === 0) {
            setshowSpin(false);
            return enqueueSnackbar("No records found in sheet", snackBarErrorConf);
          } else if (rLength > 4000) {
            setshowSpin(false);
            return enqueueSnackbar("Allow only 4000 records at once", snackBarErrorConf);
          } else if (file.size > maxSize) {
            setshowSpin(false);
            return enqueueSnackbar("Allow only max 4MB file", snackBarErrorConf);
          } else {
            setrecordFile(file);

            const columns = await generateColumn(records);
            setcolumns(columns);

            const recData = await dataValidation(records, recordsState);

            setShowType("show_list");
            setvalidFile(!recData.isValid);
            setDataSource(recData.nodes);
            setPagination((prev) => ({
              ...prev,
              total: recData.nodes.length
            }));

            setshowSpin(false);
          }
        };
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      console.log(error);
      setshowSpin(false);
    }
  };

  // This function is used to generate column dynamically
  const generateColumn = (records) => {
    let column = [];
    return new Promise((resolve, reject) => {
      try {
        if (records?.length) {
          let keys = Object.keys(records[0]);
          keys.forEach((i, k) => {
            if (i == "SAP Code") {
              column.push({
                title: i,
                dataIndex: i,
                key: i,
                render: (value, record) => renderData(record, i),
                fixed: "left"
              });
            } else {
              column.push({
                title: i,
                dataIndex: i,
                //sorter: (a, b) => a["Type"].localeCompare(b["Type"]),
                key: i,
                render: (value, record) => renderData(record, i)
              });
            }

            if (k == keys.length - 1) {
              column.push({
                title: "Action",
                dataIndex: "Action",
                key: "Action",
                render: (value, record) => renderData(record, "Action"),
                fixed: "right"
              });
              resolve(column);
            }
          });
        }
      } catch (error) {
        resolve(column);
      }
    });
  };

  // this method used to check file validation
  const dataValidation = (records, recordsState) => {
    return new Promise((resolve, reject) => {
      try {
        const result = validateHierarchy(records, recordsState);
        resolve(result); // { nodes, isValid }
      } catch (error) {
        console.error("Validation error:", error);
        resolve({ nodes: [], isValid: false });
      }
    });
  };

  //Function to handle click event on state Price list Tag
  const handleStateClicked = (item) => {
    setStatePrice(item?.statePrice || []);
    setshowStateModel(true);
  };

  // This method used to manupulate item data in loop and sho the error
  const itemdata = (item, value) => {
    return (
      <>
        {value == "Action" && item["statePrice"]?.length > 0 ? (
          <span className="cursorPointer" onClick={() => handleStateClicked(item)}>
            {item?.errors && Object.keys(item.errors).length > 0 && item?.errors?.["statePrice"] ? (
              <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                <Tag color="#BB0A1E" key={"statePrice"}>
                  {"Check State Price"}
                </Tag>
                &nbsp;
                <Tooltip placement="bottom" title={item?.errors?.["statePrice"]} color={"#BB0A1E"}>
                  <InfoCircleOutlined color={"#BB0A1E"} className="colorBB0A1E" />
                </Tooltip>
              </div>
            ) : (
              <Tag color={"default"} key={"statePrice"}>
                {"Check State Price"}
              </Tag>
            )}
          </span>
        ) : value == "Action" &&
          item?.errors &&
          Object.keys(item.errors).length > 0 &&
          item?.errors?.["statePrice"] ? (
          <Tooltip placement="bottom" title={item?.errors?.["statePrice"]} color={"#BB0A1E"}>
            <InfoCircleOutlined color={"#BB0A1E"} className="colorBB0A1E" />
          </Tooltip>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            {item?.errors && Object?.keys(item.errors)?.length > 0 && item?.errors?.[value] ? (
              <>
                <span style={{ color: "#BB0A1E" }}>
                  {item[value] && TextTruncate(item[value], 30, true)}
                </span>
              </>
            ) : (
              <>
                <span>{item[value] && TextTruncate(item[value], 30, true)}</span>
              </>
            )}
            {item?.errors && Object?.keys(item.errors)?.length > 0 && item?.errors?.[value] && (
              <>
                <Tooltip placement="bottom" title={item?.errors?.[value]} color={"#BB0A1E"}>
                  <span>
                    <InfoCircleOutlined />
                  </span>
                </Tooltip>
              </>
            )}
          </div>
        )}
      </>
    );
  };

  // This method is used to manupulate item data in loop and sho the error
  const itemdataState = (item, value) => {
    return (
      <>
        {value == "Action" && item["statePrice"]?.length > 0 ? (
          <> </>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            {item?.errorsState &&
            Object?.keys(item.errorsState)?.length > 0 &&
            item?.errorsState?.[value] ? (
              <>
                <span style={{ color: "#BB0A1E" }}>
                  {item[value] && TextTruncate(item[value], 30, true)}
                </span>
              </>
            ) : (
              <>
                <span>{item[value] && TextTruncate(item[value], 30, true)}</span>
              </>
            )}

            {item?.errorsState &&
              Object?.keys(item.errorsState)?.length > 0 &&
              item?.errorsState?.[value] && (
                <>
                  <Tooltip placement="bottom" title={item?.errorsState?.[value]} color={"#BB0A1E"}>
                    <span>
                      <InfoCircleOutlined />
                    </span>
                  </Tooltip>
                </>
              )}
          </div>
        )}
      </>
    );
  };
  // this method used to replace render function in column
  const renderData = (record, value) => ({
    props: {
      style:
        record?.errors && Object.keys(record.errors).length > 0 && record?.errors?.[value]
          ? { background: "#fcf3f4", color: "#BB0A1E", fontSize: "16px" }
          : {}
    },
    children: itemdata(record, value)
  });

  // This method is used to replace render function in column
  const renderDataState = (record, value) => ({
    props: {
      style:
        record?.errorsState &&
        Object.keys(record.errorsState).length > 0 &&
        record?.errorsState?.[value]
          ? { background: "#fcf3f4", color: "#BB0A1E", fontSize: "16px" }
          : {}
    },
    children: itemdataState(record, value)
  });

  // Function to determine row class name based on age
  const getRowClassName = (record, index) => {
    return record["Type"] == "Master" ? "parent-row" : "";
  };

  // this method used to download sample file
  const downloadSheet = () => {
    try {
      const data = updatePriceBulkUpload;
      const data2 = statePriceBulkUpload;

      const ws = XLSX.utils.json_to_sheet(data);
      const ws2 = XLSX.utils.json_to_sheet(data2);
      // Freeze the first row
      ws["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: "A2",
        activePane: "bottomRight",
        state: "frozen"
      };

      const ws3 = XLSX.utils.json_to_sheet(instructionsUpdatePrice);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, "Price List");
      XLSX.utils.book_append_sheet(workbook, ws2, "State Price List");
      XLSX.utils.book_append_sheet(workbook, ws3, "Instructions");
      XLSX.writeFile(workbook, "UpdatePrice-Sample-sheet.xlsx");
    } catch (error) {}
  };

  //Function to generate the randomIds for eventId
  function generateRandomID() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomID = "";

    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomID += characters.charAt(randomIndex);
    }

    return randomID;
  }

  // This method is used to trigger upload file function
  const sendFile = () => {
    try {
      setPercentageCountLoading(true);
      const randomId = generateRandomID();
      localStorage.setItem("randomId", randomId);
      let formData = new FormData();
      formData.append("bulk_file", recordFile);

      const deepList = JSON.parse(JSON.stringify(dataSource));

      formData.append("sheet_data", JSON.stringify(deepList));
      // setDataSource([]);
      let obj = { load: formData, deepList: deepList, randomId: randomId };

      mutate(obj);
    } catch (error) {}
  };

  // UseMutation hook for creating a new Category via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Category
    (data) => apiService.bulkUploadUpdatePrice(data.load, data.randomId, data, true),
    {
      // Configuration options for the mutation
      onSuccess: (res, variables) => {
        if (res.success) {
          setPercentageCountLoading(false);
          navigate(`/${Paths.productList}`);
          enqueueSnackbar(res.message, snackBarSuccessConf);
        }
      },
      onError: (error, variables) => {
        if (error) {
          setPercentageCountLoading(false);
        }
        if (error?.data?.length > 0) {
          setDataSource(error.data);

          setPagination((prev) => ({
            ...prev,
            total: error?.data?.length,
            current: 1,
            pageSize: 10
          }));
          setCurrent(1);
        }
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const bulkUpload = (flag) => {
    setshowBulkUploadModel(flag);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrent(page);
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }));
  };

  // Paginate data manually
  const paginatedData = dataSource.slice(
    (current - 1) * pagination.pageSize,
    current * pagination.pageSize
  );

  return (
    <>
      {/* <Flex>
        <Alert
          message="Please provide SAP Codes only for main and simple products. SAP Codes will not be updated for variant products."
          banner
        />
      </Flex> */}
      <div
        style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
        className="tableBorder mt-30">
        {showType == "show_list" && (
          <>
            <Table
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
              bordered={true}
              scroll={{ x: "max-content" }}
              rowClassName={getRowClassName}
            />
          </>
        )}

        {showType == "bulk_upload" && (
          <>
            <Row gutter={[0, 20]}>
              <Col span={24}>
                <Flex justify={"space-between"} width="100%">
                  <span>
                    <InfoCircleOutlined /> Allow only .xlsx, .xls & .csv file type
                  </span>
                  <Button type="primary" onClick={downloadSheet} icon={<DownloadOutlined />}>
                    Download Sample Sheet
                  </Button>
                </Flex>
              </Col>
              {showSpin ? (
                <>
                  <Col span={24}>
                    <Flex
                      style={{ margin: 20 }}
                      justify={"center"}
                      width="100%"
                      vertical={true}
                      gap={5}
                      align="center">
                      <Spin />
                      <p className="ant-upload-text">Please wait. File is processing ...</p>
                    </Flex>
                  </Col>
                </>
              ) : (
                <Col span={24}>
                  <Dragger {...config}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>

                    <p className="ant-upload-hint">
                      Support for a single upload. Strictly prohibited from uploading company data
                      or other banned files.
                    </p>
                  </Dragger>
                </Col>
              )}
            </Row>
          </>
        )}
      </div>

      {showType == "show_list" && (
        <>
          <div style={{ padding: "16px", background: "#fff", borderTop: "1px solid #f0f0f0" }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger={pagination.showSizeChanger}
              pageSizeOptions={pagination.pageSizeOptions}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
            />
          </div>
          <Button
            key="back"
            onClick={() => {
              setShowType("bulk_upload");
              setshowSpin(false);
              setPagination((prev) => ({
                ...prev,
                current: 1,
                pageSize: 10
              }));
              setCurrent(1);
            }}
            disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="ml-8"
            key="submit"
            type="primary"
            onClick={sendFile}
            loading={isLoading}
            disabled={isLoading || validFile}>
            <UploadOutlined /> Import
          </Button>
        </>
      )}
      <>
        {percentageCountLoading ? (
          <Modal
            title="Upload Progress"
            centered
            open={true}
            closable={false}
            width={700}
            footer={false}>
            <>
              <Flex justify="center" align="middle" style={{ height: "100%" }}>
                <ProgressCount setPercentageCountLoading={setPercentageCountLoading} />
              </Flex>
            </>
          </Modal>
        ) : (
          <></>
        )}
      </>

      <Modal
        title={`Product State List - SAP Code ` + statePrice?.[0]?.["SAP Code"]}
        centered
        open={showStateModel}
        onOk={() => setshowStateModel(false)}
        onCancel={() => setshowStateModel(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setshowStateModel(false)}
            loading={isLoading}
            disabled={isLoading}>
            Close
          </Button>
        ]}
        width={800}>
        <>
          <Table
            columns={stateColumn}
            dataSource={statePrice}
            pagination={false}
            bordered={true}
            scroll={{ x: "max-content" }}
          />
        </>
      </Modal>
    </>
  );
};

export default UpdatePrice;
