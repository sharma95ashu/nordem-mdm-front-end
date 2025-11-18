import React, { useRef } from "react";
import "jodit";
import JoditEditor from "jodit-react";

const buttons = [
  "undo",
  "redo",
  "|",
  "bold",
  "underline",
  "italic",
  "align",
  "|",
  "ul",
  "ol",
  "outdent",
  "indent",
  "|",
  "font",
  "fontsize",
  "paragraph",
  "|",
  "image",
  "link",
  "table",
  "|",
  "hr"
];

const editorConfig = {
  readonly: false,
  toolbar: true,
  spellcheck: false,
  language: "en",
  toolbarButtonSize: "medium",
  toolbarAdaptive: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPaste: "insert_clear_html",
  buttons,
  uploader: { insertImageAsBase64URI: true },
  disablePlugins: "add-new-line"
};

/**
 * Inject inline border styles into tables & cells if missing.
 */
function injectTableBorders(htmlString) {
  if (!htmlString) return htmlString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const tables = doc.querySelectorAll("table");
  if (!tables.length) return htmlString;

  tables.forEach((table) => {
    // --- build style safely as a string ---
    const style = table.getAttribute("style") || "";

    // append missing properties (avoiding duplicates)
    let newStyle = style;

    if (!/border-collapse/i.test(style)) {
      newStyle += "border-collapse:collapse;";
    }
    if (!/border\s*:/i.test(style)) {
      newStyle += "border:1px solid #ccc;";
    }
    if (!/width\s*:/i.test(style)) {
      newStyle += "width:100%;";
    }
    if (!/margin(-bottom)?\s*:/i.test(style)) {
      newStyle += "margin-bottom:12px;";
    }

    table.setAttribute("style", newStyle.trim());

    // --- same for each cell ---
    table.querySelectorAll("td, th").forEach((cell) => {
      const cs = cell.getAttribute("style") || "";
      let newCellStyle = cs;

      if (!/border\s*:/i.test(cs)) {
        newCellStyle += "border:1px solid #ccc;";
      }
      if (!/padding\s*:/i.test(cs)) {
        newCellStyle += "padding:4px;";
      }

      cell.setAttribute("style", newCellStyle.trim());
    });
  });

  return doc.body.innerHTML;
}

const Joditor = ({ description, handleDescription }) => {
  const editorRef = useRef(null);

  const handleEditorChange = (value) => {
    let modifiedHTML = value;

    // only process if there’s a table tag (avoid parsing everything)
    if (value.includes("<table")) {
      modifiedHTML = injectTableBorders(value);
    }

    handleDescription(modifiedHTML);
  };

  return (
    <JoditEditor
      ref={editorRef}
      value={description}
      config={editorConfig}
      onChange={handleEditorChange}
    />
  );
};

export default Joditor;
