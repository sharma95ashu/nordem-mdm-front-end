import React, { useState, useMemo, useEffect } from "react";
import { Modal, Select, Row, Col, Slider, Button } from "antd";
// import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { snackBarWarningConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";

const { Option } = Select;

const ExportModal = ({ visible, onClose, setLoader, loader }) => {
  // Default options
  const defaultOptions = {
    category: null,
    brand: null,
    type: null,
    gstType: null,
    availability: null,
    dispatchBy: null
  };
  const { apiService } = useServices();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Slider data (from which min/max is dynamically derived)
  const defaultPrices = [1, 125000];
  const defaultPVs = [1, 50000];

  const priceMin = useMemo(() => Math.min(...defaultPrices), []);
  const priceMax = useMemo(() => Math.max(...defaultPrices), []);
  const pvMin = useMemo(() => Math.min(...defaultPVs), []);
  const pvMax = useMemo(() => Math.max(...defaultPVs), []);

  const initialState = {
    category: defaultOptions.category,
    brand: defaultOptions.brand,
    type: defaultOptions.type,
    gstType: defaultOptions.gstType,
    availability: defaultOptions.availability,
    dispatchBy: defaultOptions.dispatchBy,
    priceRange: [priceMin, priceMax],
    pvRange: [pvMin, pvMax]
  };

  const [formState, setFormState] = useState(initialState);

  const handleExport = async (data) => {
    if (
      formState.category === null &&
      formState.brand === null &&
      formState.type === null &&
      formState.gstType === null &&
      formState.availability === null &&
      formState.dispatchBy === null
    ) {
      enqueueSnackbar("Select at-least one filter", snackBarWarningConf);
      return;
    }

    setLoader(true);
    try {
      await apiService.exportProducts({ filterTerm: formState });
    } catch (error) {
      //enqueueSnackbar(error?.message || "Something Went Wrong", snackBarErrorConf);
    }
    setLoader(false);
    onClose();
  };

  const handleReset = () => {
    setFormState(initialState);
  };

  // UseMutation hook for creating a new variant via API
  const { mutate: getCategoryDropDownForExport } = useMutation(
    // Mutation function to handle the API call for creating a new variant
    (data) => apiService.getCategoryDropDownForExport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          setCategories(data?.data || []);
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
      }
    }
  );
  // UseMutation hook for creating a new variant via API
  const { mutate: getBrandDropDownForExport } = useMutation(
    // Mutation function to handle the API call for creating a new variant
    (data) => apiService.getBrandDropDownForExport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          setBrands(data?.data || []);
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
      }
    }
  );

  useEffect(() => {
    getCategoryDropDownForExport();
    getBrandDropDownForExport();
  }, []);

  return (
    <Modal
      title="Product Export"
      open={visible}
      onCancel={onClose}
      closable={!loader}
      maskClosable={false}
      footer={[
        <Button disabled={loader} key="reset" onClick={handleReset}>
          Reset
        </Button>,
        // <Button disabled={loader} key="cancel" onClick={onClose}>
        //   Cancel
        // </Button>,
        <Button
          loading={loader}
          disabled={loader}
          key="export"
          type="primary"
          onClick={handleExport}>
          Export
        </Button>
      ]}
      width={850}>
      <Row gutter={16}>
        <Col span={12}>
          <label>Select Category</label>
          <Select
            showSearch
            placeholder="Select Category"
            value={formState.category}
            onChange={(value) => setFormState({ ...formState, category: value })}
            style={{ width: "100%" }}
            options={categories}
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
          />
        </Col>
        <Col span={12}>
          <label>Select Brand</label>
          <Select
            showSearch
            placeholder="Select Brand"
            value={formState.brand}
            onChange={(value) => setFormState({ ...formState, brand: value })}
            style={{ width: "100%" }}
            options={brands}
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
          />
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <label>Select Type</label>
          <Select
            placeholder="Select Type"
            value={formState.type}
            onChange={(value) => setFormState({ ...formState, type: value })}
            style={{ width: "100%" }}>
            <Option value="master">Master</Option>
            <Option value="variant">Variant</Option>
            <Option value="simple">Simple</Option>
          </Select>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <label>GST Type</label>
          <Select
            placeholder="Select GST Type"
            value={formState.gstType}
            onChange={(value) => setFormState({ ...formState, gstType: value })}
            style={{ width: "100%" }}>
            <Option value={true}>{"Exempted"}</Option>
            <Option value={false}>{"Not Exempted"}</Option>
          </Select>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <label>Availability</label>
          <Select
            placeholder="Select Availability"
            value={formState.availability}
            onChange={(value) => setFormState({ ...formState, availability: value })}
            style={{ width: "100%" }}>
            <Option value={true}>In Stock</Option>
            <Option value={false}>Out of Stock</Option>
          </Select>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <label>Dispatch By</label>
          <Select
            placeholder="Select Dispatch By"
            value={formState.dispatchBy}
            onChange={(value) => setFormState({ ...formState, dispatchBy: value })}
            style={{ width: "100%" }}>
            <Option value={"ho"}>{"Ho"}</Option>
            <Option value="depot">{"Depot"}</Option>
            <Option value="puc">{"Puc"}</Option>
            <Option value="Both">{"Both"}</Option>
          </Select>
        </Col>
        <Col span={12} style={{ marginTop: 24 }}>
          <label>MRP Range</label>
          <Slider
            range
            min={priceMin}
            max={priceMax}
            value={formState.priceRange}
            onChange={(value) => setFormState({ ...formState, priceRange: value })}
          />
        </Col>
        <Col span={12} style={{ marginTop: 24 }}>
          <label>PV Range</label>
          <Slider
            range
            min={pvMin}
            max={pvMax}
            value={formState.pvRange}
            onChange={(value) => setFormState({ ...formState, pvRange: value })}
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default ExportModal;
