import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { AutoComplete, Flex, Input, Typography } from "antd";
import { cloneDeep } from "lodash";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSearchMenus, MenuList } from "Static/utils/menuList";

const SearchMenuModal = ({ setIsMenuPopupOpen, contextPermission }) => {
  const [filteredOptions, setFilteredOptions] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    // Focus the input field when the modal is opened
    if (searchRef.current) {
      searchRef.current.focus();
    }

    return () => {
      setSearchValue("");
    };
  }, []);

  function filterMenuByPermissions(menuList, contextPermissions) {
    // Extracting the allowed slugs...
    const allowedSlugs = contextPermissions
      .filter((p) => p.permissions && p.permissions.length > 0)
      .map((p) => p.module_slug);

    // Checking is module is allowed or not...
    const isModuleAllowed = (slug) => {
      if (Array.isArray(slug)) {
        return slug.some((s) => allowedSlugs.includes(s));
      }
      return allowedSlugs.includes(slug);
    };

    const deepFilter = (menuItem) => {
      let hasValidSubMenu = false;

      // If submenu exists, filter it recursively
      if (menuItem.subMenu && Array.isArray(menuItem.subMenu)) {
        const filteredSubMenu = menuItem.subMenu.map(deepFilter).filter(Boolean) || [];

        if (filteredSubMenu.length > 0) {
          hasValidSubMenu = true;
          menuItem.subMenu = filteredSubMenu;
        } else {
          delete menuItem.subMenu;
        }
      }

      // Check if this item is allowed or has valid children
      if (isModuleAllowed(menuItem.module_slug) || hasValidSubMenu) {
        return { ...menuItem }; // Returning the available module
      }

      return null; // Exclude this item
    };

    return menuList.map(deepFilter).filter(Boolean) || [];
  }

  // Default Options
  const allOptions = useMemo(() => {
    const extractedMenus = createSearchMenus(
      filterMenuByPermissions(cloneDeep(MenuList), contextPermission)
    );
    return extractedMenus?.map((item) => {
      return {
        value: item.value,
        label: (
          <Flex align="center" style={{ height: "30px" }}>
            {item.label}
          </Flex>
        )
      };
    });
  }, [contextPermission]);

  // Get the highlighted text
  const getHighlightedText = useMemo(() => {
    return (text, highlight) => {
      const parts = text?.split(new RegExp(`(${highlight?.join("|")})`, "gi"));
      return (
        <div>
          {parts?.map((part, index) => {
            return highlight?.indexOf(part?.toLowerCase()) > -1 ? <b key={index}>{part}</b> : part;
          })}
        </div>
      );
    };
  }, []);

  const extractTextFromReactElement = (element) => {
    if (typeof element === "string") {
      return element;
    }
    if (React.isValidElement(element)) {
      return React.Children.toArray(element.props.children)
        .map(extractTextFromReactElement)
        .join("");
    }
    return "";
  };

  // Trigger when user types in the search box
  const handleSearch = (value) => {
    // if no value, show all options
    if (!value) {
      setFilteredOptions(null);
      return;
    }

    // Split the search words and filter the options
    const searchWords = value?.toLowerCase().split(" ").filter(Boolean);
    const filtered =
      allOptions.filter((option) => {
        const labelText = extractTextFromReactElement(option?.label)?.toLowerCase();
        return searchWords.every((word) => labelText?.includes(word));
      }) || [];

    // Highlight the text, after filter
    const highlighted = filtered.map((option) => {
      return {
        value: option.value,
        label: (
          <Flex align="center" style={{ height: "30px" }}>
            {getHighlightedText(extractTextFromReactElement(option?.label), searchWords)}
          </Flex>
        )
      };
    });

    // set filtered options
    setFilteredOptions(highlighted);
  };

  // Trigger when use select a menu option
  const onSelect = (data) => {
    setIsDropdownOpen(false); // close autocomplete
    setIsMenuPopupOpen(false); // close modal
    setFilteredOptions(null); // reset filtered options
    navigate(`/${data}`); // router to selected module
  };

  // On Search Input Change
  const handleInputChange = (e) => {
    setIsDropdownOpen(true);
    setSearchValue(e.target.value);
  };

  // handle close
  const handleClose = () => {
    setIsDropdownOpen(false);
    setIsMenuPopupOpen(false);
  };

  return (
    <Flex vertical gap={0}>
      <AutoComplete
        open={isDropdownOpen}
        popupClassName={"dropdown-separator-xl"}
        options={filteredOptions || allOptions}
        notFoundContent={
          <Flex style={{ padding: "var(--ant-padding-xl)" }} justify="center">
            {filteredOptions?.length === 0 && searchValue && (
              <Typography.Text type="secondary" style={{ fontSize: "var(--ant-font-size-md)" }}>
                No result for &quot;<b>{searchValue}</b>&quot;{" "}
              </Typography.Text>
            )}
          </Flex>
        }
        onSelect={onSelect}
        onSearch={(text) => handleSearch(text)}>
        <Flex align="center">
          <Input
            onChange={handleInputChange}
            onClick={() => setIsDropdownOpen(true)}
            value={searchValue}
            size="large"
            placeholder="Search Menu Here..."
            prefix={<SearchOutlined />}
            ref={searchRef}
          />
          <CloseOutlined className="close__icon" onClick={handleClose} />
        </Flex>
      </AutoComplete>
    </Flex>
  );
};

export default SearchMenuModal;
