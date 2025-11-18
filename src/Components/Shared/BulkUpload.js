/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Button, Col, Flex, Image, Modal, Row, Spin, Table, Tag, Tooltip } from "antd";
import Dragger from "antd/es/upload/Dragger";
import {
  DownloadOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  UploadOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import {
  productSampleSheetData,
  snackBarErrorConf,
  snackBarSuccessConf,
  URL_VALIDATION_REGEX
} from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { findIndex, isEmpty } from "lodash";
import { TextTruncate } from "Helpers/ats.helper";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import ProgressCount from "./ProgressCount";

const BulkUpload = (props) => {
  const [showType, setShowType] = useState("bulk_upload");
  const [dataSource, setDataSource] = useState([]);
  const [stateDataSource, setStateDataSource] = useState([]);
  const [columns, setcolumns] = useState([]);
  const [recordFile, setrecordFile] = useState(null);
  const { apiService } = useServices();
  const [showStateModel, setshowStateModel] = useState(false);
  const [validFile, setvalidFile] = useState(false);
  const [showSpin, setshowSpin] = useState(false);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100", "500"],
    onShowSizeChange: (current, size) => {
      setPagination((prevPagination) => ({ ...prevPagination, pageSize: size }));
    }
  });

  const stateColumn = [
    {
      title: "SAP Code",
      dataIndex: "SAP Code",
      key: "SAP Code",
      render: (value, record) => renderData(record, "SAP Code")
    },
    {
      title: "State",
      dataIndex: "State",
      key: "State",
      render: (value, record) => renderData(record, "State")
    },
    {
      title: "Sale Price",
      dataIndex: "Sale Price",
      key: "Sale Price",
      render: (value, record) => renderData(record, "Sale Price")
    },
    // {
    //   title: "Offer Price",
    //   dataIndex: "Offer Price",
    //   key: "Offer Price",
    //   render: (value, record) => renderData(record, "Offer Price")
    // },
    {
      title: "PV Price",
      dataIndex: "PV Price",
      key: "PV Price",
      render: (value, record) => renderData(record, "PV Price")
    },
    {
      title: "Shipping Price",
      dataIndex: "Shipping Price",
      key: "Shipping Price",
      render: (value, record) => renderData(record, "Shipping Price")
    }
  ];

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

  // This method used to handel model
  const handelModel = (flag) => {
    try {
      props.setshowBulkUploadModel(flag);
    } catch (error) {}
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

          const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
          const worksheet = workbook.Sheets[sheetName];
          // Assuming the data starts from A2 (skip the header)
          const records = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" }); //{  header: 1, range: 1 }

          // For Second sheet
          const sheetName2 = workbook.SheetNames[1]; // Assuming the data is in the first sheet
          const stateSheet = workbook.Sheets[sheetName2];
          // Assuming the data starts from A2 (skip the header)
          // eslint-disable-next-line no-unused-vars
          const statePrice = XLSX.utils.sheet_to_json(stateSheet, { raw: false, defval: "" });

          const rLength = records.length;
          const maxSize = 4 * 1024 * 1024; // 4MB in bytes
          if (rLength === 0) {
            return enqueueSnackbar("No records found in sheet", snackBarErrorConf);
          } else if (rLength > 4000) {
            setshowSpin(false);
            return enqueueSnackbar("Allow only 4000 records at once", snackBarErrorConf);
          } else if (file.size > maxSize) {
            return enqueueSnackbar("Allow only max 4MB file", snackBarErrorConf);
          } else {
            setrecordFile(file);
            const columns = await generateColumn(records);
            setcolumns(columns);

            const parentMap = await getParentData(records);

            const res = await dataValidation(records, parentMap);
            setShowType("show_list");
            const recData = await convertDataToTree(res.records, true, statePrice);

            setvalidFile(!recData.isValid);
            setDataSource(recData.nodes);
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

  // this function used to generate column dynamically
  const generateColumn = (records) => {
    let column = [];
    return new Promise((resolve, reject) => {
      try {
        if (records?.length) {
          let keys = Object.keys(records[0]);
          keys.forEach((i, k) => {
            if (i == "Images") {
              column.push({
                title: "Images",
                dataIndex: "Images",
                key: "Images",
                render: (Images) => (
                  <div>
                    {Images.split(",").map((i, index) => (
                      <Image
                        key={index}
                        src={i.trim()}
                        alt={`avatar${index}`}
                        style={{ width: 50, height: 50, marginRight: 5 }}
                      />
                    ))}
                  </div>
                )
              });
            } else if (i == "SAP Code") {
              column.push({
                title: i,
                dataIndex: i,
                key: i,
                render: (value, record) => renderData(record, i),
                fixed: "left"
              });
              column.push(Table.EXPAND_COLUMN);
            }
            // else if (i == "Type") {
            //   column.push({
            //     title: i,
            //     dataIndex: i,
            //     key: i,
            //     render: (value, record) => renderData(record, i),
            //     fixed: "left"
            //   });
            //   column.push(Table.EXPAND_COLUMN);
            // }
            else {
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

  // this method used to get parent data from record based on master key
  const getParentData = (records) => {
    return new Promise((resolve, reject) => {
      try {
        let parentMap = {};
        records.forEach((obj, k) => {
          if (obj.Type === "Master" || obj.Type === "master") {
            parentMap[obj["SAP Code"]] = obj;
          }

          if (k == records.length - 1) {
            resolve(parentMap);
          }
        });
      } catch (error) {
        resolve({});
      }
    });
  };

  // this method used to check file validation
  const dataValidation = (records, parentMap) => {
    return new Promise((resolve, reject) => {
      try {
        if (records?.length > 0) {
          dataValidationFn(records, 0, true, parentMap, (res) => {
            resolve(res);
          });
        } else {
          resolve(records);
        }
      } catch (error) {}
    });
  };

  //this method used to handle file validation in recusrion
  const dataValidationFn = (records, i, isValid, parentMap, fn) => {
    try {
      if (records?.[i]) {
        const rec = records?.[i];
        records[i]["errors"] = {};
        let parent = rec.Parent; //rec.Parent ? parseInt(rec.Parent) : null;
        if (parent !== null && parentMap[parent]) {
          // Copy missing fields from parent to variation
          Object.keys(parentMap[parent]).forEach((key) => {
            // eslint-disable-next-line no-prototype-builtins
            if ((key !== "Parent" && !rec.hasOwnProperty(key)) || isEmpty(rec[key])) {
              records[i][key] = parentMap[parent][key];
            }
          });
        }

        i++;
        dataValidationFn(records, i, isValid, parentMap, fn);
      } else {
        fn({ records, isValid: isValid });
      }
    } catch (error) {
      fn({ records, isValid: isValid });
    }
  };

  // this method used to get all attribute name from record
  const getAllAtrributeName = (obj) => {
    try {
      let concatenatedValues = "";
      // let length = Object.keys(obj);
      Object.keys(obj).forEach((key, i) => {
        // Check if key starts with "attribut"
        if (key.startsWith("Attribut") && key.endsWith("value(s)")) {
          concatenatedValues += obj[key].replace(", ", " ") + " ";
        }
      });

      // Remove trailing space
      concatenatedValues = concatenatedValues.trim();

      return concatenatedValues;
    } catch (error) {
      return "";
    }
  };

  // Iterate through data to find top-level nodes
  const convertDataToTree = async (data, isValid, statePrice) => {
    try {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        let nodes = [];
        for (let i = 0; i < data.length; i++) {
          let d = data[i];
          let errors = {};
          if (isEmpty(d["Parent"])) {
            if (
              (!d["Type"] || isEmpty(d["Type"])) &&
              ["Master", "Variation", "master", "variation"].includes(d["Type"]) == false
            ) {
              isValid = false;
              errors["Type"] = "Field cannot be empty";
            }
            if (!d["Name"] || isEmpty(d["Name"])) {
              isValid = false;
              errors["Name"] = "Field cannot be empty";
            }
            if (!d["Brand"] || isEmpty(d["Brand"])) {
              isValid = false;
              errors["Brand"] = "Field cannot be empty";
            }
            if (!d["Dispatch By"] || isEmpty(d["Dispatch By"])) {
              isValid = false;
              errors["Dispatch By"] = "Field cannot be empty";
            }

            // if (!d["Short Description"] || isEmpty(d["Short Description"])) {
            //   isValid = false;
            //   errors["Short Description"] = "Field cannot be empty";
            // }

            if (!d["Full Description"] || isEmpty(d["Full Description"])) {
              isValid = false;
              errors["Full Description"] = "Field cannot be empty";
            }

            // if (
            //   !d["Display Order"] ||
            //   (d["Display Order"] && ["0", "1"].includes(d["Display Order"]) == false)
            // ) {
            //   isValid = false;
            //   errors["Display Order"] = "Invalid value";
            // }

            if (!d["Weight"] || (d["Weight"] && parseFloat(d["Weight"]) <= 0)) {
              isValid = false;
              errors["Weight"] = "Field cannot be empty or zero";
            }

            // if (
            //   !d["Is Trending"] ||
            //   (d["Is Trending"] && ["0", "1"].includes(d["Is Trending"]) == false)
            // ) {
            //   isValid = false;
            //   errors["Is Trending"] = "Invalid value";
            // }

            if (
              !d["New Arrival"] ||
              (d["New Arrival"] && ["0", "1"].includes(d["New Arrival"]) == false)
            ) {
              isValid = false;
              errors["New Arrival"] = "Invalid value";
            }

            if (!d["Net Content"] || (d["Net Content"] && parseFloat(d["Net Content"]) <= 0)) {
              isValid = false;
              errors["Net Content"] = "Field cannot be empty or zero";
            }

            // if (
            //   !d["Show Stock"] ||
            //   (d["Show Stock"] && ["0", "1"].includes(d["Show Stock"]) == false)
            // ) {
            //   isValid = false;
            //   errors["Show Stock"] = "Invalid value";
            // }

            if (!d["Category"] || isEmpty(d["Category"])) {
              isValid = false;
              errors["Category"] = "Field cannot be empty";
            }

            if (
              !d["Min Cart Quantity"] ||
              (d["Min Cart Quantity"] && parseInt(d["Min Cart Quantity"]) < 0)
            ) {
              isValid = false;
              errors["Min Cart Quantity"] = "Field cannot be empty or zero";
            }
            if (
              !d["Max Cart Quantity"] ||
              (d["Max Cart Quantity"] && parseInt(d["Max Cart Quantity"]) < 0) ||
              (d["Max Cart Quantity"] && parseInt(d["Max Cart Quantity"]) > 101)
            ) {
              isValid = false;
              errors["Max Cart Quantity"] = "Field cannot be empty or zero & should less than 100";
            }

            // if (
            //   !d["Multiple Cart Quantity"] ||
            //   (d["Multiple Cart Quantity"] &&
            //     ["0", "1"].includes(d["Multiple Cart Quantity"]) == false)
            // ) {
            //   isValid = false;
            //   errors["Multiple Cart Quantity"] = "Invalid value";
            // }

            if (!d["HSN Number"] || (d["HSN Number"] && parseInt(d["HSN Number"]) < 0)) {
              isValid = false;
              errors["HSN Number"] = "Field cannot be empty or zero";
            }

            if (
              !d["GST Exempted"] ||
              (d["GST Exempted"] && ["0", "1"].includes(d["GST Exempted"]) == false)
            ) {
              isValid = false;
              errors["GST Exempted"] = "Invalid value";
            }

            if (d?.["GST Exempted"] && (d["GST Exempted"] == 0 || d["GST Exempted"] == "0")) {
              if (!d["GST"] || (d["GST"] && parseFloat(d["GST"]) <= 0)) {
                isValid = false;
                errors["GST"] = "Field cannot be empty or zero";
              }
            }

            if (!d["MRP"] || (d["MRP"] && parseFloat(d["MRP"]) <= 0)) {
              isValid = false;
              errors["MRP"] = "Field cannot be empty or zero";
            }
            if (d["Shipping Price"] && parseInt(d["Shipping Price"]) < 0) {
              isValid = false;
              errors["Shipping Price"] = "Invalid value";
            }
            if (!d["Sale Price"] || (d["Sale Price"] && parseFloat(d["Sale Price"]) < 0)) {
              isValid = false;
              errors["Sale Price"] = "Field cannot be empty or zero";
            }
            // if (!d["Offer Price"] || (d["Offer Price"] && parseInt(d["Offer Price"]) < 0)) {
            //   isValid = false;
            //   errors["Offer Price"] = "Invalid value";
            // }

            if (
              !d["Purchase Volume"] ||
              (d["Purchase Volume"] && parseFloat(d["Purchase Volume"]) < 0)
            ) {
              isValid = false;
              errors["Purchase Volume"] = "Invalid value";
            }

            if (d?.["Purchase Volume"] && d["Purchase Volume"].length > 8) {
              isValid = false;
              errors["Purchase Volume"] =
                "Purchase Volume should be less than or equal to 8 digits";
            }

            if (
              !d["Same Price For All State"] ||
              (d["Same Price For All State"] &&
                ["0", "1"].includes(d["Same Price For All State"]) == false)
            ) {
              isValid = false;
              errors["Same Price For All State"] = "Invalid value";
            }

            if (d["Barcode"] && !/^[a-zA-Z0-9]*$/.test(d["Barcode"])) {
              isValid = false;
              errors["Barcode"] = "Barcode must be alphanumeric";
            }

            if (d["Product Image Link"] && !URL_VALIDATION_REGEX.test(d["Product Image Link"])) {
              isValid = false;
              errors["Product Image Link"] = "Invalid Link";
            }

            // if (
            //   d["Product Gallery Link(s)"] &&
            //   d["Product Gallery Link(s)"]
            //     ?.split(",")
            //     .filter((el) => URL_VALIDATION_REGEX.test(el) == false).length
            // ) {
            //   isValid = false;
            //   errors["Product Gallery Link(s)"] = "Invalid Link(s)";
            // }

            if (Object.keys(errors).length > 0) {
              isValid = false;
              errors["SAP Code"] = JSON.stringify(errors);
            }
            let child = await findChildren(data, d["SAP Code"], true);

            let statePriceArr = null;
            let statePriceAllState = d["Same Price For All State"];

            if (statePriceAllState == "0") {
              if (statePrice?.length > 0) {
                statePriceArr = await findChildren(
                  statePrice,
                  d["SAP Code"],
                  true,
                  "statePrice",
                  d
                );
                // isValid = statePriceArr.isValid;
                if (!statePriceArr.isValid) {
                  isValid = false;
                  errors["SAP Code"] = "Error in state price list";
                }
              } else {
                isValid = false;
                errors["SAP Code"] = "No State price found for this SAP Code";
              }
            }

            if (!d["SAP Code"] || isEmpty(d["SAP Code"])) {
              isValid = false;
              errors["SAP Code"] = "SAP Code cannot be empty or zero";
            }
            if (!child.isValid) {
              isValid = false;
              errors["SAP Code"] = "Error in varients";
            }

            // console.log("errors", d["SAP Code"], errors);

            d["errors"] = errors;
            nodes.push({
              ...d,
              key: d["SAP Code"],
              statePrice: statePriceArr?.children || [],
              ...(child?.children?.length > 0 ? { children: child.children } : null)
            });
          }
          if (i == data.length - 1) {
            resolve({ nodes, isValid: isValid });
          }
        }
      });
    } catch (error) {}
  };

  // this method used to file children and create tree
  const findChildren = (data, nodeId, isValid, statePrice, listItem) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const children = [];
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          item["errors"] = {};
          if (item["Parent"] == nodeId) {
            let prodAttrName = getAllAtrributeName(item);
            if (item["SAP Code"] == nodeId) {
              isValid = false;
              item["errors"]["SAP Code"] = "SAP Code should be unique";
            }
            children.push({
              ...item,
              key: item["SAP Code"],
              Name: `${item["Name"]}-${prodAttrName.replaceAll(" ", "-")}`
              //children: await findChildren(data, item["SAP Code"])
            });
          } else if (statePrice && item["SAP Code"] == nodeId) {
            // if (
            //   !item["Offer Price"] ||
            //   (item["Offer Price"] && parseInt(item["Offer Price"]) < 0) ||
            //   (item["Offer Price"] && parseInt(item["Offer Price"]) > parseInt(listItem["MRP"]))
            // ) {
            //   isValid = false;
            //   item["errors"]["Offer Price"] = "Offer Price can't be zero or greater then MRP";
            // }

            if (
              !item["Sale Price"] ||
              (item["Sale Price"] && parseInt(item["Sale Price"]) < 0) ||
              (item["Sale Price"] && parseInt(item["Sale Price"]) > parseInt(listItem["MRP"]))
            ) {
              isValid = false;
              item["errors"]["Sale Price"] = "Sale Price can't be zero or greater then MRP";
            }

            children.push({
              ...item
            });
          }
          if (i == data.length - 1) {
            resolve({ children: children.length > 0 ? children : [], isValid: isValid });
          }
        }
      } catch (error) {}
    });
  };

  // This method used to show state wise price
  const showPrice = (item) => {
    try {
      setStateDataSource(item?.statePrice || []);
      setshowStateModel(true);
    } catch (error) {}
  };

  // this method used to manupulate item data in loop and sho the error
  const itemdata = (item, value) => {
    return (
      <>
        {value == "Action" &&
        (item["Type"] == "Master" ||
          item["Type"] == "master" ||
          item["Type"] == "Simple" ||
          item["Type"] == "simple") &&
        item["statePrice"]?.length > 0 ? (
          <span>
            {item[value] && TextTruncate(item[value], 30, true)}&nbsp;
            <Tag color={"default"} key={"Price"} onClick={() => showPrice(item)}>
              <a href="jsvascript:void(0)">{"Check State Price"}</a>
            </Tag>
          </span>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            {item?.errors && Object.keys(item.errors).length > 0 && item?.errors?.[value] ? (
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
            {item?.errors && Object.keys(item.errors).length > 0 && item?.errors?.[value] && (
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

  // Function to determine row class name based on age
  const getRowClassName = (record, index) => {
    return record["Type"] == "Master" ? "parent-row" : "";
  };

  // this method used to download sample file
  const downloadSheet = () => {
    try {
      const data = productSampleSheetData.productSheet;
      const data2 = productSampleSheetData.productStateSheet;

      const ws = XLSX.utils.json_to_sheet(data);
      // Freeze the first row
      ws["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: "A2",
        activePane: "bottomRight",
        state: "frozen"
      };

      const ws2 = XLSX.utils.json_to_sheet(data2);

      const instructionData = [
        {
          "Column Name": "SAP Code",
          Description: "This is the unique SAP code assigned to the product. It should be numeric."
        },
        {
          "Column Name": "Type",
          Description:
            "Specify the type of product from (Master, Variant, Simple). Note : If you are creating a product without variant then use 'Simple' keyword as type"
        },
        { "Column Name": "Name", Description: "Enter the name of the product." },
        {
          "Column Name": "Brand",
          Description: "Mention the brand of the product. It should already be added in the system."
        },
        {
          "Column Name": "Dispatch By",
          Description:
            "Specify the dispatch method or carrier for the product from (HO, Depot, PUC)."
        },
        // {
        //   "Column Name": "Display Order",
        //   Description:
        //     "Assign a numerical value to determine the display order of the product on the platform."
        // },
        {
          "Column Name": "Weight",
          Description: "Mention the weight of the product in grams."
        },
        {
          "Column Name": "Barcode",
          Description: "Mention the barcode of the product."
        },
        {
          "Column Name": "Net Content",
          Description:
            "Net content of the product. (e.g 2 units, 2o grams, 2ml, 2 boxes, 3 pcs, etc.)"
        },
        // {
        //   "Column Name": "Is Trending",
        //   Description:
        //     "Indicate whether the product is currently trending or not by entering a binary value (1 or 0). (1 == yes, 0 == no)"
        // },
        {
          "Column Name": "New Arrival",
          Description:
            "Indicate whether the product is new arrived or not by entering a binary value (1 or 0). (1 == yes, 0 == no)"
        },
        // {
        //   "Column Name": "Show Stock",
        //   Description:
        //     "Determine if the product stock should be visible to customers by entering a binary value (1 or 0). (1 == yes, 0 == no)"
        // },
        // {
        //   "Column Name": "Short Description",
        //   Description: "Provide a brief overview or summary of the product."
        // },
        {
          "Column Name": "Full Description",
          Description:
            "Enter a detailed description of the product including features, specifications, etc. It can be HTML text data."
        },
        {
          "Column Name": "Category",
          Description:
            "Specify the category under which the product falls. It should already be added in the system."
        },
        {
          "Column Name": "Min Cart Quantity",
          Description:
            "Define the minimum quantity of the product allowed in the cart. This will be a numeric value."
        },
        {
          "Column Name": "Max Cart Quantity",
          Description:
            "Define the maximum quantity of the product allowed in the cart. This will be a numeric value and higher than the Min cart quantity."
        },
        // {
        //   "Column Name": "Multiple Cart Quantity",
        //   Description:
        //     "Specify if multiple quantities of the product can be added to the cart. This will be a binary value (1 or 0)."
        // },
        { "Column Name": "Meta Title", Description: "Enter the meta title for SEO purposes." },
        {
          "Column Name": "Meta Description",
          Description: "Provide a meta description for SEO purposes."
        },
        {
          "Column Name": "Meta Keywords",
          Description: "Specify relevant keywords for SEO purposes."
        },
        {
          "Column Name": "HSN Number",
          Description: "Enter the Harmonized System of Nomenclature (HSN) code for the product."
        },
        {
          "Column Name": "GST",
          Description:
            "Specify the Goods and Services Tax (GST) applicable to the product. It will be a numeric value."
        },
        {
          "Column Name": "GST Exempt",
          Description:
            "Specify if the product is exempted from GST. This will be a binary value (1 or 0). (1 == yes, 0 == no)"
        },
        {
          "Column Name": "Purchase Price",
          Description: "Enter the purchase price of the product. It will be a numeric value."
        },
        {
          "Column Name": "MRP (Maximum Retail Price)",
          Description:
            "Specify the maximum retail price of the product. It will be a numeric value."
        },
        {
          "Column Name": "Shipping Price",
          Description: "Enter the shipping price for the product. It will be a numeric value."
        },
        {
          "Column Name": "Sale Price",
          Description: "Enter the regular sale price of the product. It will be a numeric value."
        },
        {
          "Column Name": "Offer Price",
          Description: "If applicable, enter any offer price for the product."
        },
        {
          "Column Name": "Purchase Volume",
          Description:
            "Specify the volume of purchase required for bulk discounts. It will be a numeric value."
        },
        {
          "Column Name": "Same Price For All States",
          Description:
            "Indicate if the price remains the same across all states by entering a binary value (0 or 1). (1 == yes, 0 == no)"
        },
        {
          "Column Name": "Parent",
          Description:
            "If the product type is Master, then it will be blank. If it is Variant, then enter the SAP Code of the Master."
        },
        {
          "Column Name": "Attribute 1 Name",
          Description: "Define the name of the first attribute."
        },
        {
          "Column Name": "Attribute 1 Value(s)",
          Description: "Provide the value(s) associated with the first attribute."
        },
        {
          "Column Name": "Attribute 1 Visible",
          Description:
            "Specify if the first attribute should be visible to customers by entering a binary value (0 or 1). (1 == yes, 0 == no)"
        },
        {
          "Column Name": "Attribute 2 Name",
          Description: "Define the name of the second attribute."
        },
        {
          "Column Name": "Attribute 2 Value(s)",
          Description: "Provide the value(s) associated with the second attribute."
        },
        {
          "Column Name": "Attribute 2 Visible",
          Description:
            "Specify if the second attribute should be visible to customers by entering a binary value (0 or 1). (1 == yes, 0 == no)"
        },
        {
          "Column Name": "Attribute 3 Name",
          Description: "Define the name of the third attribute."
        },
        {
          "Column Name": "Attribute 3 Value(s)",
          Description: "Provide the value(s) associated with the third attribute."
        },
        {
          "Column Name": "Attribute 3 Visible",
          Description:
            "Specify if the third attribute should be visible to customers by entering a binary value (0 or 1). (1 == yes, 0 == no)"
        },
        {
          "Column Name": "Attribute Display Order",
          Description: "Assign a numerical value to determine the display order of attributes."
        },
        {
          "Column Name": "Product Image Link",
          Description:
            "Upload images of the product. Ensure images meet the specified requirements."
        }
        // {
        //   "Column Name": "Product Gallery Link(s)	",
        //   Description:
        //     "Upload images of the product. Ensure images meet the specified requirements."
        // }
      ];

      const ws3 = XLSX.utils.json_to_sheet(instructionData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, "Product List");
      XLSX.utils.book_append_sheet(workbook, ws2, "State Price List");
      XLSX.utils.book_append_sheet(workbook, ws3, "Instructions");
      XLSX.writeFile(workbook, "Product-Sample-sheet.xlsx");
    } catch (error) {}
  };

  function generateRandomID() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomID = "";

    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomID += characters.charAt(randomIndex);
    }

    return randomID;
  }

  // this method used to trigger upload file function
  const sendFile = () => {
    try {
      props.setPercentageCountLoading(true);
      const randomId = generateRandomID();
      localStorage.setItem("randomId", randomId);
      let formData = new FormData();
      formData.append("bulk_file", recordFile);
      const deepList = JSON.parse(JSON.stringify(dataSource));
      // setDataSource([]);
      let obj = { load: formData, deepList: deepList, randomId: randomId };

      mutate(obj);
    } catch (error) {}
  };

  // UseMutation hook for creating a new Category via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Category
    (data) => apiService.uploadBulkUploadFile(data.load, data.randomId, true),
    {
      // Configuration options for the mutation
      onSuccess: (res, variables) => {
        if (res.success) {
          handelModel(false);
          // props.setPercentageCountLoading(false)
          props.recallProductApi();
          enqueueSnackbar("Products uploaded successfully", snackBarSuccessConf);
        } else {
          setListError(variables.deepList, res?.data, 0);
        }
        // props.setPercentageCountLoading(false)
      },
      onError: (error, variables) => {
        props.setPercentageCountLoading(false);
        setListError(variables.deepList, error?.data, 0);
        // Handle errors by displaying an error Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // this method used to set list error
  const setListError = (lists, data, i) => {
    try {
      if (data?.[i]?.["type"] == "variant" || data?.[i]?.["type"] == "Variant") {
        let spCode = data?.[i]["parent"];
        let idx = findIndex(lists, { "SAP Code": spCode.toString() });

        const dData = lists[idx];
        let s = (dData?.children || []).map((x) => {
          if (x["SAP Code"] == data?.[i]["SAP Code"]) {
            x["errors"] = data?.[i]["errors"];
          }
          return x;
        });
        lists[idx]["children"] = s;
        lists[idx]["errors"] = { "SAP Code": "Error in varients" };
        i++;
        setListError(lists, data, i);
      } else if (
        data?.[i]?.["type"] &&
        ["Master", "master", "simple", "Simple"].includes(data?.[i]?.["type"])
      ) {
        let spCode = data?.[i]["SAP Code"];
        const indx = findIndex(lists, { "SAP Code": spCode.toString() }); //data[i]["index"];
        if (lists[indx]) {
          lists[indx]["errors"] = data[i]["errors"];
        }

        if (data[i]?.statePrices?.length > 0) {
          lists[indx]["errors"] = { "SAP Code": "Error in state price list" };
          data[i].statePrices.map((j) => {
            lists[indx]["statePrice"][j.index]["errors"] = j.errors;
          });
        }
        i++;
        setListError(lists, data, i);
      } else {
        setDataSource(lists);
      }
    } catch (error) {}
  };

  return (
    <>
      <Modal
        title="Product Upload"
        centered
        open={true}
        onOk={() => handelModel(false)}
        onCancel={() => handelModel(false)}
        maskClosable={false}
        footer={
          showType == "show_list"
            ? [
                // <ProgressCount key="progresscount" />,
                <Button
                  key="back"
                  onClick={() => handelModel(false)}
                  loading={isLoading}
                  disabled={isLoading}>
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={sendFile}
                  loading={isLoading}
                  disabled={isLoading || validFile}>
                  <UploadOutlined /> Import
                </Button>
              ]
            : ""
        }
        width={1000}>
        <>
          <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {showType == "show_list" && (
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={pagination}
                bordered={true}
                scroll={{ x: "max-content" }}
                rowClassName={getRowClassName}
                // expandable={{
                //   expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
                //   onExpand: handleRowExpand,
                //   expandedRowRender: (record) => (
                //     <Table columns={columns} dataSource={record.children} pagination={false} />
                //   )
                //   // {expandedRowKey === record["SAP Code"] && (
                //   //   <Table columns={columns} dataSource={record.children} pagination={false} />
                //   // )}
                // }}
              />
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
                          Support for a single or bulk upload. Strictly prohibited from uploading
                          company data or other banned files.
                        </p>
                      </Dragger>
                    </Col>
                  )}
                </Row>
              </>
            )}
          </div>
        </>
      </Modal>

      <Modal
        title={`Product State List - SAP Code ` + stateDataSource?.[0]?.["SAP Code"]}
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
            dataSource={stateDataSource}
            pagination={false}
            bordered={true}
            scroll={{ x: "max-content" }}
          />
        </>
      </Modal>
    </>
  );
};

export default BulkUpload;
