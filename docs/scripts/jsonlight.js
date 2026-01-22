/*************************************
 *        CONSTANTS                  *
 *************************************/

// Number of characters to capture on each side of a parse error for the preview snippet.
const JSON_PARSE_CONTEXT_RADIUS = 50;

// Maximum count of recent search queries remembered for the dropdown history.
const SEARCH_HISTORY_LIMIT = 12;

// Maximum count of replacement strings remembered for the dropdown history.
const REPLACE_HISTORY_LIMIT = 12;

// Delay (in milliseconds) before persisting a search query to history after typing stops.
const SEARCH_HISTORY_COMMIT_DELAY = 500;

// Suggested regex samples shown in the search dropdown to help users craft patterns.
const SEARCH_REGEX_EXAMPLES = [
    String.raw`toDate\((?:(?!;).)+\)`,
    String.raw`\bhttps?://[^\s]+`,
    String.raw`"errorCode"\s*:\s*\d+`,
    String.raw`(?<="userId"\s*:\s?")([^"\s]+)`
];
let welcome = {
    "title": "JSON Light+",
    "description": "A JSON viewer/editor that displays multi-line strings in its raw format and let's you edit it!",
    "tip": "Click the R (view raw) button in the following line\nClick the E (edit) button to edit the value in a modal dialog\nClick [C] to duplicate the whole JSON element\nClock [D] to delete the whole JSON element",
    "banner": "\n     _ ____   ___  _   _ _     ___      _     _            \n    | / ___| / _ \\| \\ | | |   |_ _|__ _| |__ | |_      _   \n _  | \\\\___ \\ | | |   \\ | |    | |/ _` | '_ \\| __|   _| |_ \n| |_| |___) | |_| | |\\  | |___ | | (_| | | | | |_   |_   _|\n \\___/|____/ \\___/|_| \\_|_____|___\\__, |_| |_|\\__|    |_|  \n                                  |___/                    \n"
}

// Text inserted when pressing Tab with no selection: use "\t" for hard tab, or spaces for soft tabs.
const PROPERTY_EDITOR_TAB_INSERTION = "\t";
// Number of leading spaces added/removed for multi-line indent; supply any string (e.g., two spaces).
const PROPERTY_EDITOR_INDENT_STEP = "  ";

// Debounce durations for the paste/edit textarea auto-refresh behavior.
const PASTE_AREA_EDIT_DEBOUNCE_MS = 600;
const PASTE_AREA_PASTE_DELAY_MS = 30;
const APPEND_DATA_PARSE_DEBOUNCE_MS = 400;



const PROPERTY_EDITOR_MIN_WIDTH = 460;
const PROPERTY_EDITOR_MIN_HEIGHT = 320;
const PROPERTY_EDITOR_MAX_WIDTH = 1400;
const PROPERTY_EDITOR_MAX_HEIGHT = 1100;
const PROPERTY_EDITOR_MAX_WIDTH_RATIO = 0.95;
const PROPERTY_EDITOR_MAX_HEIGHT_RATIO = 0.9;
const PROPERTY_EDITOR_LAYOUT_STORAGE_KEY = "jsonlight.propertyEditorLayout";
const PROPERTY_EDITOR_VIEWPORT_MARGIN = 24;

/*************************************
 *        Property Editor Modal      *
 *************************************/
const propertyEditorState = {
    modalElement: document.querySelector("#property-editor-modal"),
    dialog: document.querySelector("#property-editor-modal .property-editor-dialog"),
    textarea: document.querySelector("#property-editor-input"),
    keyDisplay: document.querySelector("#property-editor-key-display"),
    keyEditor: document.querySelector("#property-editor-key-edit"),
    keyInput: document.querySelector("#property-editor-key-input"),
    keyApplyButton: document.querySelector("#property-editor-key-apply"),
    keyCancelButton: document.querySelector("#property-editor-key-cancel"),
    keyErrorLabel: document.querySelector("#property-editor-key-error"),
    pathLabel: document.querySelector("#property-editor-path"),
    positionLabel: document.querySelector("#property-editor-caret"),
    searchInput: document.querySelector("#property-editor-search-input"),
    searchPrevButton: document.querySelector("#property-editor-find-prev"),
    searchNextButton: document.querySelector("#property-editor-find-next"),
    replaceInput: document.querySelector("#property-editor-replace-input"),
    replaceButton: document.querySelector("#property-editor-replace-current"),
    replaceAllButton: document.querySelector("#property-editor-replace-all"),
    searchStatusLabel: document.querySelector("#property-editor-search-status"),
    searchErrorLabel: document.querySelector("#property-editor-search-error"),
    applyButton: document.querySelector("#property-editor-apply"),
    resizeHandle: document.querySelector("#property-editor-resize-handle"),
    modal: null,
    currentKvRoot: null,
    caretUpdateHandle: null,
};

const appendDataState = {
    modalElement: document.querySelector("#append-data-modal"),
    openButton: document.querySelector("#append-data-button"),
    fileInput: document.querySelector("#append-data-file"),
    textArea: document.querySelector("#append-data-text"),
    formatLabel: document.querySelector("#append-data-format"),
    countLabel: document.querySelector("#append-data-count"),
    errorLabel: document.querySelector("#append-data-error"),
    statusLabel: document.querySelector("#append-data-status"),
    applyButton: document.querySelector("#append-data-apply"),
    modal: null,
    parseHandle: null,
    parsedItems: null,
    parsedMode: null,
    parsedValue: null
};

const propertyRenameState = {
    modalElement: document.querySelector("#property-rename-modal"),
    input: document.querySelector("#property-rename-input"),
    applyButton: document.querySelector("#property-rename-apply"),
    errorLabel: document.querySelector("#property-rename-error"),
    modal: null,
    currentKvRoot: null
};

const propertyEditorSearchState = {
    lastQuery: "",
    lastDirection: 1,
};

const propertyEditorDragState = {
    dialog: null,
    header: null,
    dragging: false,
    lastX: 0,
    lastY: 0,
    currentX: 0,
    currentY: 0,
    initialized: false
};

const propertyEditorResizeState = {
    dialog: null,
    handle: null,
    resizing: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    initialized: false
};

const propertyEditorLayoutState = {
    width: null,
    height: null,
    translateX: 0,
    translateY: 0,
    loaded: false
};

/*************************************
 *        App Configuration          *
 *************************************/
const APP_CONFIG_STORAGE_KEY = "jsonlight.appConfig";
const APP_CONFIG_MIN_PAGE_SIZE = 50;
const APP_CONFIG_MAX_PAGE_SIZE = 2000;
const APP_CONFIG_MIN_INDENT_SIZE = 1;
const APP_CONFIG_MAX_INDENT_SIZE = 8;
const APP_CONFIG_MIN_FONT_SIZE = 0.7;
const APP_CONFIG_MAX_FONT_SIZE = 1.4;
const APP_CONFIG_DEFAULTS = {
    pageSize: 500,
    tabInsertion: PROPERTY_EDITOR_TAB_INSERTION,
    indentSize: PROPERTY_EDITOR_INDENT_STEP.length || 2,
    treeFontSize: 0.9,
    editorFontSize: 0.9
};

const appConfigState = {
    current: loadAppConfigFromStorage(),
    modalElement: document.querySelector("#app-settings-modal"),
    modal: null,
    openButton: document.querySelector("#open-settings-button"),
    form: document.querySelector("#app-settings-form"),
    pageSizeInput: document.querySelector("#config-page-size"),
    tabInsertionInput: document.querySelector("#config-tab-insertion"),
    indentSizeInput: document.querySelector("#config-indent-size"),
    treeFontSizeInput: document.querySelector("#config-tree-font-size"),
    editorFontSizeInput: document.querySelector("#config-editor-font-size"),
    errorLabel: document.querySelector("#app-settings-error")
};

const runtimeFormattingState = {
    tabInsertion: PROPERTY_EDITOR_TAB_INSERTION,
    indentSize: APP_CONFIG_DEFAULTS.indentSize,
    indentToken: PROPERTY_EDITOR_INDENT_STEP,
    treeFontSize: APP_CONFIG_DEFAULTS.treeFontSize,
    editorFontSize: APP_CONFIG_DEFAULTS.editorFontSize
};

updateRuntimeFormattingSettings();

function initializePropertyEditorDragSupport() {
    if (propertyEditorDragState.initialized || !propertyEditorState.modalElement) return;
    const dialog = propertyEditorState.modalElement.querySelector(".modal-dialog");
    const header = propertyEditorState.modalElement.querySelector(".modal-header");
    if (!dialog || !header) return;
    propertyEditorDragState.dialog = dialog;
    propertyEditorDragState.header = header;
    header.style.cursor = "move";
    header.addEventListener("mousedown", handlePropertyEditorDragStart);
    propertyEditorState.modalElement.addEventListener("hidden.bs.modal", () => {
        resetPropertyEditorDragPosition({ preserveTransform: true });
    });
    propertyEditorDragState.initialized = true;
}

function handlePropertyEditorDragStart(event) {
    if (event.button !== 0) return;
    if (!propertyEditorDragState.dialog) return;
    if (!propertyEditorState.modalElement || !propertyEditorState.modalElement.classList.contains("show")) return;
    propertyEditorDragState.dragging = true;
    propertyEditorDragState.lastX = event.clientX;
    propertyEditorDragState.lastY = event.clientY;
    document.addEventListener("mousemove", handlePropertyEditorDragMove);
    document.addEventListener("mouseup", handlePropertyEditorDragEnd);
    event.preventDefault();
}

function handlePropertyEditorDragMove(event) {
    if (!propertyEditorDragState.dragging) return;
    const deltaX = event.clientX - propertyEditorDragState.lastX;
    const deltaY = event.clientY - propertyEditorDragState.lastY;
    propertyEditorDragState.lastX = event.clientX;
    propertyEditorDragState.lastY = event.clientY;
    propertyEditorDragState.currentX += deltaX;
    propertyEditorDragState.currentY += deltaY;
    applyPropertyEditorDragTransform();
}

function handlePropertyEditorDragEnd() {
    if (!propertyEditorDragState.dragging) return;
    propertyEditorDragState.dragging = false;
    document.removeEventListener("mousemove", handlePropertyEditorDragMove);
    document.removeEventListener("mouseup", handlePropertyEditorDragEnd);
    clampPropertyEditorDialogPosition({ force: true });
    recordPropertyEditorDialogTransform();
}

function applyPropertyEditorDragTransform() {
    if (!propertyEditorDragState.dialog) return;
    propertyEditorDragState.dialog.style.transform = `translate(${propertyEditorDragState.currentX}px, ${propertyEditorDragState.currentY}px)`;
}

function resetPropertyEditorDragPosition(options = {}) {
    const preserveTransform = !!options.preserveTransform;
    if (!preserveTransform) {
        propertyEditorDragState.currentX = 0;
        propertyEditorDragState.currentY = 0;
        if (propertyEditorDragState.dialog) {
            propertyEditorDragState.dialog.style.transform = "";
        }
        recordPropertyEditorDialogTransform();
    }
    if (propertyEditorDragState.dragging) {
        propertyEditorDragState.dragging = false;
        document.removeEventListener("mousemove", handlePropertyEditorDragMove);
        document.removeEventListener("mouseup", handlePropertyEditorDragEnd);
    }
}

function initializePropertyEditorResizeSupport() {
    if (propertyEditorResizeState.initialized) return;
    if (!propertyEditorState.modalElement) return;
    const dialog = propertyEditorState.dialog || propertyEditorState.modalElement.querySelector(".property-editor-dialog");
    const handle = propertyEditorState.resizeHandle;
    if (!dialog || !handle) return;
    propertyEditorResizeState.dialog = dialog;
    propertyEditorResizeState.handle = handle;
    propertyEditorResizeState.initialized = true;
    handle.addEventListener("pointerdown", handlePropertyEditorResizeStart);
    propertyEditorState.modalElement.addEventListener("hidden.bs.modal", () => {
        endPropertyEditorResizeSession();
    });
    if (typeof window !== "undefined" && window.addEventListener) {
        window.addEventListener("resize", () => {
            if (propertyEditorState.modalElement && propertyEditorState.modalElement.classList.contains("show")) {
                clampPropertyEditorDialogSize({ force: true });
                clampPropertyEditorDialogPosition({ force: true });
            }
        });
    }
}

function getPropertyEditorSizeBounds() {
    const baseWidth = typeof window !== "undefined" && typeof window.innerWidth === "number"
        ? window.innerWidth
        : (document.documentElement ? document.documentElement.clientWidth : PROPERTY_EDITOR_MIN_WIDTH);
    const baseHeight = typeof window !== "undefined" && typeof window.innerHeight === "number"
        ? window.innerHeight
        : (document.documentElement ? document.documentElement.clientHeight : PROPERTY_EDITOR_MIN_HEIGHT);
    const viewportWidth = Math.max(baseWidth || PROPERTY_EDITOR_MIN_WIDTH, PROPERTY_EDITOR_MIN_WIDTH);
    const viewportHeight = Math.max(baseHeight || PROPERTY_EDITOR_MIN_HEIGHT, PROPERTY_EDITOR_MIN_HEIGHT);
    const maxWidth = Math.max(Math.min(viewportWidth * PROPERTY_EDITOR_MAX_WIDTH_RATIO, PROPERTY_EDITOR_MAX_WIDTH), PROPERTY_EDITOR_MIN_WIDTH);
    const maxHeight = Math.max(Math.min(viewportHeight * PROPERTY_EDITOR_MAX_HEIGHT_RATIO, PROPERTY_EDITOR_MAX_HEIGHT), PROPERTY_EDITOR_MIN_HEIGHT);
    return {
        minWidth: Math.min(PROPERTY_EDITOR_MIN_WIDTH, maxWidth),
        minHeight: Math.min(PROPERTY_EDITOR_MIN_HEIGHT, maxHeight),
        maxWidth,
        maxHeight
    };
}

function handlePropertyEditorResizeStart(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!propertyEditorResizeState.dialog) return;
    event.preventDefault();
    propertyEditorResizeState.resizing = true;
    propertyEditorResizeState.pointerId = typeof event.pointerId === "number" ? event.pointerId : null;
    propertyEditorResizeState.startX = event.clientX;
    propertyEditorResizeState.startY = event.clientY;
    const rect = propertyEditorResizeState.dialog.getBoundingClientRect();
    propertyEditorResizeState.startWidth = rect.width;
    propertyEditorResizeState.startHeight = rect.height;
    document.addEventListener("pointermove", handlePropertyEditorResizeMove);
    document.addEventListener("pointerup", handlePropertyEditorResizeEnd);
    document.addEventListener("pointercancel", handlePropertyEditorResizeEnd);
    if (document.body) {
        document.body.classList.add("property-editor-resizing");
    }
    if (propertyEditorResizeState.handle && typeof propertyEditorResizeState.handle.setPointerCapture === "function" && propertyEditorResizeState.pointerId !== null) {
        try {
            propertyEditorResizeState.handle.setPointerCapture(propertyEditorResizeState.pointerId);
        }
        catch (error) {
            console.warn("Unable to capture pointer for property editor resize", error);
        }
    }
}

function handlePropertyEditorResizeMove(event) {
    if (!propertyEditorResizeState.resizing) return;
    if (propertyEditorResizeState.pointerId !== null && event.pointerId !== propertyEditorResizeState.pointerId) return;
    const bounds = getPropertyEditorSizeBounds();
    const deltaX = event.clientX - propertyEditorResizeState.startX;
    const deltaY = event.clientY - propertyEditorResizeState.startY;
    const width = Math.min(Math.max(propertyEditorResizeState.startWidth + deltaX, bounds.minWidth), bounds.maxWidth);
    const height = Math.min(Math.max(propertyEditorResizeState.startHeight + deltaY, bounds.minHeight), bounds.maxHeight);
    propertyEditorResizeState.dialog.style.width = `${width}px`;
    propertyEditorResizeState.dialog.style.height = `${height}px`;
}

function handlePropertyEditorResizeEnd(event) {
    if (!propertyEditorResizeState.resizing) return;
    if (propertyEditorResizeState.pointerId !== null && event.pointerId !== propertyEditorResizeState.pointerId) return;
    if (propertyEditorResizeState.handle && typeof propertyEditorResizeState.handle.releasePointerCapture === "function" && propertyEditorResizeState.pointerId !== null) {
        try {
            propertyEditorResizeState.handle.releasePointerCapture(propertyEditorResizeState.pointerId);
        }
        catch (error) {
            console.warn("Unable to release pointer for property editor resize", error);
        }
    }
    endPropertyEditorResizeSession();
    clampPropertyEditorDialogSize({ force: true });
    clampPropertyEditorDialogPosition({ force: true });
    recordPropertyEditorDialogSize();
}

function endPropertyEditorResizeSession() {
    if (propertyEditorResizeState.resizing) {
        propertyEditorResizeState.resizing = false;
        document.removeEventListener("pointermove", handlePropertyEditorResizeMove);
        document.removeEventListener("pointerup", handlePropertyEditorResizeEnd);
        document.removeEventListener("pointercancel", handlePropertyEditorResizeEnd);
    }
    if (document.body) {
        document.body.classList.remove("property-editor-resizing");
    }
    propertyEditorResizeState.pointerId = null;
}

function clampPropertyEditorDialogSize(options = {}) {
    const dialog = propertyEditorResizeState.dialog;
    if (!dialog) return;
    const hasInlineSize = dialog.style.width || dialog.style.height;
    if (!options.force && !hasInlineSize) return;
    const bounds = getPropertyEditorSizeBounds();
    const rect = dialog.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, bounds.minWidth), bounds.maxWidth);
    const height = Math.min(Math.max(rect.height, bounds.minHeight), bounds.maxHeight);
    const widthChanged = Math.abs(width - rect.width) > 0.5;
    const heightChanged = Math.abs(height - rect.height) > 0.5;
    if (widthChanged || heightChanged || options.force) {
        dialog.style.width = `${width}px`;
        dialog.style.height = `${height}px`;
        persistPropertyEditorLayout({ width, height });
    }
}

function clampPropertyEditorDialogPosition(options = {}) {
    const dialog = propertyEditorResizeState.dialog;
    if (!dialog) return;
    const viewportWidth = typeof window !== "undefined"
        ? (window.innerWidth || (document.documentElement ? document.documentElement.clientWidth : null))
        : null;
    const viewportHeight = typeof window !== "undefined"
        ? (window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : null))
        : null;
    if (!viewportWidth || !viewportHeight) return;
    const margin = typeof options.margin === "number" ? options.margin : PROPERTY_EDITOR_VIEWPORT_MARGIN;
    const rect = dialog.getBoundingClientRect();
    let offsetX = propertyEditorDragState.currentX;
    let offsetY = propertyEditorDragState.currentY;
    let changed = false;
    if (rect.left < margin) {
        offsetX += margin - rect.left;
        changed = true;
    }
    if (rect.right > viewportWidth - margin) {
        offsetX -= rect.right - (viewportWidth - margin);
        changed = true;
    }
    if (rect.top < margin) {
        offsetY += margin - rect.top;
        changed = true;
    }
    if (rect.bottom > viewportHeight - margin) {
        offsetY -= rect.bottom - (viewportHeight - margin);
        changed = true;
    }
    if (changed) {
        propertyEditorDragState.currentX = offsetX;
        propertyEditorDragState.currentY = offsetY;
        applyPropertyEditorDragTransform();
        recordPropertyEditorDialogTransform();
    }
    else if (options.force) {
        recordPropertyEditorDialogTransform();
    }
}

function recordPropertyEditorDialogSize() {
    const dialog = propertyEditorResizeState.dialog;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    persistPropertyEditorLayout({ width: rect.width, height: rect.height });
}

function recordPropertyEditorDialogTransform() {
    persistPropertyEditorLayout({
        translateX: propertyEditorDragState.currentX || 0,
        translateY: propertyEditorDragState.currentY || 0
    });
}

function getPropertyEditorStorage() {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage || null;
    }
    catch (error) {
        console.warn("Local storage unavailable for property editor layout", error);
        return null;
    }
}

function loadPropertyEditorLayoutFromStorage() {
    if (propertyEditorLayoutState.loaded) {
        return propertyEditorLayoutState;
    }
    propertyEditorLayoutState.loaded = true;
    const storage = getPropertyEditorStorage();
    if (!storage) {
        return propertyEditorLayoutState;
    }
    try {
        const raw = storage.getItem(PROPERTY_EDITOR_LAYOUT_STORAGE_KEY);
        if (!raw) {
            return propertyEditorLayoutState;
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
            if (typeof parsed.width === "number") propertyEditorLayoutState.width = parsed.width;
            if (typeof parsed.height === "number") propertyEditorLayoutState.height = parsed.height;
            if (typeof parsed.translateX === "number") propertyEditorLayoutState.translateX = parsed.translateX;
            if (typeof parsed.translateY === "number") propertyEditorLayoutState.translateY = parsed.translateY;
        }
    }
    catch (error) {
        console.warn("Unable to load property editor layout", error);
    }
    return propertyEditorLayoutState;
}

function persistPropertyEditorLayout(partial = {}) {
    loadPropertyEditorLayoutFromStorage();
    const nextState = { ...propertyEditorLayoutState };
    let changed = false;
    ["width", "height", "translateX", "translateY"].forEach((key) => {
        if (!(key in partial)) return;
        let value = partial[key];
        if (typeof value === "number" && Number.isFinite(value)) {
            value = Math.round(value);
        }
        else if (value !== null) {
            return;
        }
        if (nextState[key] !== value) {
            nextState[key] = value;
            changed = true;
        }
    });
    if (!changed) {
        return;
    }
    Object.assign(propertyEditorLayoutState, nextState);
    const storage = getPropertyEditorStorage();
    if (!storage) {
        return;
    }
    try {
        storage.setItem(
            PROPERTY_EDITOR_LAYOUT_STORAGE_KEY,
            JSON.stringify({
                width: propertyEditorLayoutState.width,
                height: propertyEditorLayoutState.height,
                translateX: propertyEditorLayoutState.translateX,
                translateY: propertyEditorLayoutState.translateY
            })
        );
    }
    catch (error) {
        console.warn("Unable to persist property editor layout", error);
    }
}

function applyStoredPropertyEditorLayout() {
    loadPropertyEditorLayoutFromStorage();
    const modal = propertyEditorState.modalElement;
    if (!modal) return;
    const dialog = propertyEditorResizeState.dialog || modal.querySelector(".property-editor-dialog");
    if (!dialog) return;
    propertyEditorState.dialog = dialog;
    propertyEditorResizeState.dialog = dialog;
    propertyEditorDragState.dialog = dialog;
    if (typeof propertyEditorLayoutState.width === "number") {
        dialog.style.width = `${propertyEditorLayoutState.width}px`;
    }
    if (typeof propertyEditorLayoutState.height === "number") {
        dialog.style.height = `${propertyEditorLayoutState.height}px`;
    }
    propertyEditorDragState.currentX = typeof propertyEditorLayoutState.translateX === "number"
        ? propertyEditorLayoutState.translateX
        : 0;
    propertyEditorDragState.currentY = typeof propertyEditorLayoutState.translateY === "number"
        ? propertyEditorLayoutState.translateY
        : 0;
    applyPropertyEditorDragTransform();
    clampPropertyEditorDialogSize({ force: true });
    clampPropertyEditorDialogPosition({ force: true });
}

function getLineAndColumnForOffset(text, offset) {
    let line = 1;
    let column = 1;
    for (let i = 0; i < offset && i < text.length; i++) {
        if (text[i] === "\n") {
            line += 1;
            column = 1;
        }
        else {
            column += 1;
        }
    }
    return { line, column };
}

function updatePropertyEditorCaretInfo() {
    if (!propertyEditorState.textarea || !propertyEditorState.positionLabel) return;
    const textarea = propertyEditorState.textarea;
    const text = textarea.value ?? "";
    let offset = typeof textarea.selectionStart === "number"
        ? textarea.selectionStart
        : text.length;
    if (offset < 0) offset = 0;
    if (offset > text.length) offset = text.length;
    const { line, column } = getLineAndColumnForOffset(text, offset);
    propertyEditorState.positionLabel.textContent = `Ln ${line}, Col ${column}`;
}

function schedulePropertyEditorCaretUpdate() {
    if (propertyEditorState.caretUpdateHandle && typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(propertyEditorState.caretUpdateHandle);
        propertyEditorState.caretUpdateHandle = null;
    }
    const rafAvailable = typeof window !== "undefined" && typeof window.requestAnimationFrame === "function";
    if (rafAvailable) {
        propertyEditorState.caretUpdateHandle = window.requestAnimationFrame(() => {
            propertyEditorState.caretUpdateHandle = null;
            updatePropertyEditorCaretInfo();
        });
    }
    else {
        setTimeout(() => updatePropertyEditorCaretInfo(), 0);
    }
}

function handlePropertyEditorKeyDown(event) {
    if (event.key !== "Tab" || event.altKey || event.metaKey || event.ctrlKey || !propertyEditorState.textarea) {
        return;
    }
    const textarea = propertyEditorState.textarea;
    const selectionStart = textarea.selectionStart ?? 0;
    const selectionEnd = textarea.selectionEnd ?? 0;
    const selectionLength = Math.abs(selectionEnd - selectionStart);
    event.preventDefault();
    if (selectionLength === 0 && !event.shiftKey) {
        const insertion = getConfiguredTabInsertion();
        textarea.setRangeText(insertion, selectionStart, selectionEnd, "end");
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        schedulePropertyEditorCaretUpdate();
        return;
    }
    const handled = indentPropertyEditorSelectedLines(event.shiftKey ? -1 : 1, {
        includeCurrentLineWhenEmpty: event.shiftKey && selectionLength === 0
    });
    if (!handled) {
        schedulePropertyEditorCaretUpdate();
    }
}

function indentPropertyEditorSelectedLines(direction, options = {}) {
    if (!propertyEditorState.textarea) return false;
    const textarea = propertyEditorState.textarea;
    const value = textarea.value ?? "";
    let start = textarea.selectionStart ?? 0;
    let end = textarea.selectionEnd ?? 0;
    if (start > end) {
        [start, end] = [end, start];
    }
    const allowEmptySelection = !!options.includeCurrentLineWhenEmpty;
    if (start === end && !allowEmptySelection) {
        return false;
    }
    if (!value.length) {
        return false;
    }
    const { rangeStart, rangeEnd } = expandPropertyEditorSelectionToLines(value, start, end, allowEmptySelection);
    if (rangeStart === rangeEnd) {
        return false;
    }
    const block = value.slice(rangeStart, rangeEnd);
    const lines = block.split("\n");
    const indentToken = getConfiguredIndentToken();
    const indentLength = indentToken.length;
    if (!indentLength) {
        return false;
    }
    let newBlock;
    if (direction > 0) {
        newBlock = lines.map((line) => indentToken + line).join("\n");
    }
    else {
        const canOutdent = lines.every((line) => line.startsWith(indentToken));
        if (!canOutdent) {
            return false;
        }
        const updatedLines = lines.map((line) => line.slice(indentLength));
        newBlock = updatedLines.join("\n");
    }
    textarea.setRangeText(newBlock, rangeStart, rangeEnd, "end");
    const newSelectionEnd = rangeStart + newBlock.length;
    textarea.setSelectionRange(rangeStart, newSelectionEnd);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    schedulePropertyEditorCaretUpdate();
    return true;
}

function expandPropertyEditorSelectionToLines(value, start, end, allowEmptySelection) {
    const hasSelection = start !== end;
    if (!hasSelection && !allowEmptySelection) {
        return { rangeStart: start, rangeEnd: end };
    }
    let rangeStart = start;
    let rangeEnd = end;
    if (!hasSelection && allowEmptySelection) {
        rangeStart = getPropertyEditorLineBoundaryStart(value, start);
        rangeEnd = getPropertyEditorLineBoundaryEnd(value, end);
    }
    else {
        rangeStart = getPropertyEditorLineBoundaryStart(value, start);
        rangeEnd = getPropertyEditorLineBoundaryEnd(value, end);
    }
    return { rangeStart, rangeEnd };
}

function getPropertyEditorLineBoundaryStart(value, index) {
    let cursor = Math.max(index, 0);
    while (cursor > 0 && value.charAt(cursor - 1) !== "\n") {
        cursor -= 1;
    }
    return cursor;
}

function getPropertyEditorLineBoundaryEnd(value, index) {
    let cursor = Math.max(Math.min(index, value.length), 0);
    const length = value.length;
    while (cursor < length && value.charAt(cursor) !== "\n") {
        cursor += 1;
    }
    return cursor;
}

function updatePropertyEditorSearchControls() {
    const hasQuery = !!(propertyEditorState.searchInput && propertyEditorState.searchInput.value);
    if (propertyEditorState.searchPrevButton) propertyEditorState.searchPrevButton.disabled = !hasQuery;
    if (propertyEditorState.searchNextButton) propertyEditorState.searchNextButton.disabled = !hasQuery;
    if (propertyEditorState.replaceButton) propertyEditorState.replaceButton.disabled = !hasQuery;
    if (propertyEditorState.replaceAllButton) propertyEditorState.replaceAllButton.disabled = !hasQuery;
    if (!hasQuery) {
        setPropertyEditorSearchStatus("", "info");
    }
}

function setPropertyEditorSearchStatus(message, type = "info") {
    if (propertyEditorState.searchStatusLabel) {
        propertyEditorState.searchStatusLabel.textContent = type === "info" ? message : "";
    }
    if (propertyEditorState.searchErrorLabel) {
        propertyEditorState.searchErrorLabel.textContent = type === "error" ? message : "";
    }
}

function getPropertyEditorSearchQuery() {
    return propertyEditorState.searchInput ? propertyEditorState.searchInput.value : "";
}

function getPropertyEditorReplaceText() {
    return propertyEditorState.replaceInput ? propertyEditorState.replaceInput.value : "";
}

function selectPropertyEditorRange(start, end) {
    if (!propertyEditorState.textarea) return;
    propertyEditorState.textarea.focus();
    propertyEditorState.textarea.setSelectionRange(start, end);
    schedulePropertyEditorCaretUpdate();
}

function handlePropertyEditorFind(direction) {
    if (!propertyEditorState.textarea) return;
    const query = getPropertyEditorSearchQuery();
    if (!query) {
        setPropertyEditorSearchStatus("Enter text to find.", "error");
        return;
    }
    const text = propertyEditorState.textarea.value ?? "";
    if (!text) {
        setPropertyEditorSearchStatus("Editor is empty.", "error");
        return;
    }
    const contentLength = text.length;
    const selStart = propertyEditorState.textarea.selectionStart ?? 0;
    const selEnd = propertyEditorState.textarea.selectionEnd ?? 0;
    let searchStart;
    let index = -1;
    if (direction >= 0) {
        searchStart = Math.max(selEnd, 0);
        index = text.indexOf(query, searchStart);
        if (index === -1 && searchStart > 0) {
            index = text.indexOf(query, 0);
        }
    }
    else {
        searchStart = Math.max(selStart - 1, 0);
        index = text.lastIndexOf(query, searchStart);
        if (index === -1 && searchStart < contentLength) {
            index = text.lastIndexOf(query, contentLength);
        }
    }
    if (index === -1) {
        setPropertyEditorSearchStatus("No matches.", "error");
        return;
    }
    selectPropertyEditorRange(index, index + query.length);
    propertyEditorSearchState.lastQuery = query;
    propertyEditorSearchState.lastDirection = direction;
    const { line, column } = getLineAndColumnForOffset(text, index);
    setPropertyEditorSearchStatus(`Match at Ln ${line}, Col ${column}`, "info");
}

function handlePropertyEditorReplaceCurrent() {
    if (!propertyEditorState.textarea) return;
    const query = getPropertyEditorSearchQuery();
    if (!query) {
        setPropertyEditorSearchStatus("Enter text to find before replacing.", "error");
        return;
    }
    const selection = propertyEditorState.textarea.value.substring(
        propertyEditorState.textarea.selectionStart ?? 0,
        propertyEditorState.textarea.selectionEnd ?? 0
    );
    if (selection !== query) {
        handlePropertyEditorFind(propertyEditorSearchState.lastDirection >= 0 ? 1 : -1);
        return;
    }
    const replacement = getPropertyEditorReplaceText();
    propertyEditorState.textarea.setRangeText(
        replacement,
        propertyEditorState.textarea.selectionStart,
        propertyEditorState.textarea.selectionEnd,
        "end"
    );
    schedulePropertyEditorCaretUpdate();
    setPropertyEditorSearchStatus("Replaced current match.", "info");
    handlePropertyEditorFind(1);
}

function handlePropertyEditorReplaceAll() {
    if (!propertyEditorState.textarea) return;
    const query = getPropertyEditorSearchQuery();
    if (!query) {
        setPropertyEditorSearchStatus("Enter text to find before replacing.", "error");
        return;
    }
    const text = propertyEditorState.textarea.value ?? "";
    const replacement = getPropertyEditorReplaceText();
    const occurrences = text.split(query);
    if (occurrences.length <= 1) {
        setPropertyEditorSearchStatus("No matches to replace.", "error");
        return;
    }
    propertyEditorState.textarea.value = occurrences.join(replacement);
    propertyEditorState.textarea.dispatchEvent(new Event("input", { bubbles: true }));
    schedulePropertyEditorCaretUpdate();
    setPropertyEditorSearchStatus(`Replaced ${occurrences.length - 1} matches.`, "info");
}

if (propertyEditorState.modalElement) {
    propertyEditorState.modal = new bootstrap.Modal(propertyEditorState.modalElement);
    propertyEditorState.modalElement.addEventListener("shown.bs.modal", () => {
        applyStoredPropertyEditorLayout();
        if (!propertyEditorState.textarea) return;
        propertyEditorState.textarea.focus();
        propertyEditorState.textarea.select();
        schedulePropertyEditorCaretUpdate();
        updatePropertyEditorSearchControls();
    });
    propertyEditorState.modalElement.addEventListener("hidden.bs.modal", () => {
        propertyEditorState.currentKvRoot = null;
        if (propertyEditorState.positionLabel) {
            propertyEditorState.positionLabel.textContent = "Ln 1, Col 1";
        }
        if (propertyEditorState.searchInput) propertyEditorState.searchInput.value = "";
        if (propertyEditorState.replaceInput) propertyEditorState.replaceInput.value = "";
        if (propertyEditorState.keyInput) propertyEditorState.keyInput.value = "";
        if (propertyEditorState.keyDisplay) propertyEditorState.keyDisplay.textContent = "";
        if (propertyEditorState.keyEditor) propertyEditorState.keyEditor.classList.add("d-none");
        if (propertyEditorState.keyDisplay) propertyEditorState.keyDisplay.classList.remove("d-none");
        setPropertyEditorKeyError("");
        setPropertyEditorSearchStatus("", "info");
    });
}

if (appendDataState.modalElement) {
    appendDataState.modal = new bootstrap.Modal(appendDataState.modalElement);
    appendDataState.modalElement.addEventListener("shown.bs.modal", () => {
        if (appendDataState.textArea) {
            appendDataState.textArea.focus();
        }
        const targetMode = getAppendTargetMode();
        if (!targetMode) {
            setAppendDataError("");
            setAppendDataStatus("Append works with JSON arrays or JSONL data.", true);
        }
    });
    appendDataState.modalElement.addEventListener("hidden.bs.modal", () => {
        resetAppendDataDialog();
    });
}

if (propertyRenameState.modalElement) {
    propertyRenameState.modal = new bootstrap.Modal(propertyRenameState.modalElement);
    propertyRenameState.modalElement.addEventListener("shown.bs.modal", () => {
        if (!propertyRenameState.input) return;
        propertyRenameState.input.focus();
        propertyRenameState.input.select();
    });
    propertyRenameState.modalElement.addEventListener("hidden.bs.modal", () => {
        propertyRenameState.currentKvRoot = null;
        if (propertyRenameState.input) propertyRenameState.input.value = "";
        setPropertyRenameError("");
    });
}

initializePropertyEditorDragSupport();
initializePropertyEditorResizeSupport();

if (propertyEditorState.applyButton) {
    propertyEditorState.applyButton.addEventListener("click", () => {
        if (!propertyEditorState.currentKvRoot || !propertyEditorState.textarea) return;
        const newValue = propertyEditorState.textarea.value;
        const loader = propertyEditorState.currentKvRoot.loader;
        if (propertyEditorState.keyEditor && !propertyEditorState.keyEditor.classList.contains("d-none")) {
            const renameResult = applyPropertyEditorKeyRename({ silent: true });
            if (!renameResult.success) {
                return;
            }
        }
        if (loader && typeof loader.updateValue === "function") {
            loader.updateValue(newValue);
        }
        else if (loader) {
            loader.value = newValue;
        }
        refreshRenderedString(propertyEditorState.currentKvRoot, newValue);
        handleValueChanged(propertyEditorState.currentKvRoot.loader);
        if (propertyEditorState.modal) {
            propertyEditorState.modal.hide();
        }
    });
}

if (propertyEditorState.keyDisplay) {
    propertyEditorState.keyDisplay.addEventListener("click", () => {
        showPropertyEditorKeyEditor();
    });
}

if (propertyEditorState.keyApplyButton) {
    propertyEditorState.keyApplyButton.addEventListener("click", () => {
        applyPropertyEditorKeyRename();
    });
}

if (propertyEditorState.keyCancelButton) {
    propertyEditorState.keyCancelButton.addEventListener("click", () => {
        hidePropertyEditorKeyEditor();
        updatePropertyEditorKeyUI(propertyEditorState.currentKvRoot);
    });
}

if (propertyEditorState.keyInput) {
    propertyEditorState.keyInput.addEventListener("input", () => {
        setPropertyEditorKeyError("");
    });
    propertyEditorState.keyInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            applyPropertyEditorKeyRename();
        }
        else if (ev.key === "Escape") {
            ev.preventDefault();
            hidePropertyEditorKeyEditor();
            updatePropertyEditorKeyUI(propertyEditorState.currentKvRoot);
        }
    });
}

if (propertyRenameState.input) {
    propertyRenameState.input.addEventListener("input", () => {
        setPropertyRenameError("");
    });
    propertyRenameState.input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            if (propertyRenameState.applyButton) {
                propertyRenameState.applyButton.click();
            }
        }
    });
}

if (propertyRenameState.applyButton) {
    propertyRenameState.applyButton.addEventListener("click", () => {
        const result = applyPropertyRename();
        if (!result.success) {
            if (propertyRenameState.input) {
                propertyRenameState.input.focus();
                propertyRenameState.input.select();
            }
            return;
        }
        if (propertyRenameState.modal) {
            propertyRenameState.modal.hide();
        }
    });
}

if (propertyEditorState.textarea) {
    ["input", "keyup", "mouseup", "click"].forEach((eventName) => {
        propertyEditorState.textarea.addEventListener(eventName, () => {
            schedulePropertyEditorCaretUpdate();
        });
    });
    propertyEditorState.textarea.addEventListener("keydown", handlePropertyEditorKeyDown);
}

if (propertyEditorState.searchInput) {
    propertyEditorState.searchInput.addEventListener("input", () => {
        updatePropertyEditorSearchControls();
        setPropertyEditorSearchStatus("", "info");
    });
    propertyEditorState.searchInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            handlePropertyEditorFind(ev.shiftKey ? -1 : 1);
        }
    });
}
if (propertyEditorState.searchPrevButton) {
    propertyEditorState.searchPrevButton.addEventListener("click", () => handlePropertyEditorFind(-1));
}
if (propertyEditorState.searchNextButton) {
    propertyEditorState.searchNextButton.addEventListener("click", () => handlePropertyEditorFind(1));
}
if (propertyEditorState.replaceButton) {
    propertyEditorState.replaceButton.addEventListener("click", () => handlePropertyEditorReplaceCurrent());
}
if (propertyEditorState.replaceAllButton) {
    propertyEditorState.replaceAllButton.addEventListener("click", () => handlePropertyEditorReplaceAll());
}

updatePropertyEditorSearchControls();
initializeAppConfigUI();

function initializeAppConfigUI() {
    if (!appConfigState.modalElement) return;
    try {
        appConfigState.modal = new bootstrap.Modal(appConfigState.modalElement);
    }
    catch (error) {
        console.warn("Unable to initialize settings modal", error);
    }
    appConfigState.modalElement.addEventListener("shown.bs.modal", () => {
        populateAppConfigForm();
        if (appConfigState.pageSizeInput) {
            appConfigState.pageSizeInput.focus();
            appConfigState.pageSizeInput.select();
        }
    });
    appConfigState.modalElement.addEventListener("hidden.bs.modal", () => {
        setAppConfigError("");
    });
    if (appConfigState.openButton) {
        appConfigState.openButton.addEventListener("click", () => {
            populateAppConfigForm();
            if (appConfigState.modal) {
                appConfigState.modal.show();
            }
        });
    }
    if (appConfigState.form) {
        appConfigState.form.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handleAppConfigSave();
        });
    }
}

function populateAppConfigForm() {
    if (appConfigState.pageSizeInput) {
        appConfigState.pageSizeInput.value = `${getConfiguredPageSize()}`;
    }
    if (appConfigState.tabInsertionInput) {
        appConfigState.tabInsertionInput.value = escapeTabInsertionForDisplay(getConfiguredTabInsertion());
    }
    if (appConfigState.indentSizeInput) {
        appConfigState.indentSizeInput.value = `${runtimeFormattingState.indentSize}`;
    }
    if (appConfigState.treeFontSizeInput) {
        appConfigState.treeFontSizeInput.value = `${runtimeFormattingState.treeFontSize}`;
    }
    if (appConfigState.editorFontSizeInput) {
        appConfigState.editorFontSizeInput.value = `${runtimeFormattingState.editorFontSize}`;
    }
    setAppConfigError("");
}

function setAppConfigError(message) {
    if (!appConfigState.errorLabel) return;
    appConfigState.errorLabel.textContent = message || "";
}

async function handleAppConfigSave() {
    if (!appConfigState.form) return;
    setAppConfigError("");
    const parsedPageSize = Number.parseInt(appConfigState.pageSizeInput ? appConfigState.pageSizeInput.value : "", 10);
    if (!Number.isFinite(parsedPageSize)) {
        setAppConfigError(`Enter a valid page size between ${APP_CONFIG_MIN_PAGE_SIZE} and ${APP_CONFIG_MAX_PAGE_SIZE}.`);
        if (appConfigState.pageSizeInput) {
            appConfigState.pageSizeInput.focus();
        }
        return;
    }
    const parsedIndentSize = Number.parseInt(appConfigState.indentSizeInput ? appConfigState.indentSizeInput.value : "", 10);
    if (!Number.isFinite(parsedIndentSize)) {
        setAppConfigError(`Enter an indent size between ${APP_CONFIG_MIN_INDENT_SIZE} and ${APP_CONFIG_MAX_INDENT_SIZE}.`);
        if (appConfigState.indentSizeInput) {
            appConfigState.indentSizeInput.focus();
        }
        return;
    }
    const parsedTreeFontSize = Number.parseFloat(appConfigState.treeFontSizeInput ? appConfigState.treeFontSizeInput.value : "");
    if (!Number.isFinite(parsedTreeFontSize)) {
        setAppConfigError(`Enter a tree font size between ${APP_CONFIG_MIN_FONT_SIZE} and ${APP_CONFIG_MAX_FONT_SIZE}.`);
        if (appConfigState.treeFontSizeInput) {
            appConfigState.treeFontSizeInput.focus();
        }
        return;
    }
    const parsedEditorFontSize = Number.parseFloat(appConfigState.editorFontSizeInput ? appConfigState.editorFontSizeInput.value : "");
    if (!Number.isFinite(parsedEditorFontSize)) {
        setAppConfigError(`Enter an editor font size between ${APP_CONFIG_MIN_FONT_SIZE} and ${APP_CONFIG_MAX_FONT_SIZE}.`);
        if (appConfigState.editorFontSizeInput) {
            appConfigState.editorFontSizeInput.focus();
        }
        return;
    }
    const rawTabValue = appConfigState.tabInsertionInput ? appConfigState.tabInsertionInput.value : "";
    const interpretedTabValue = interpretTabInsertionInput(rawTabValue);
    if (!interpretedTabValue) {
        setAppConfigError("Tab insertion value cannot be empty.");
        if (appConfigState.tabInsertionInput) {
            appConfigState.tabInsertionInput.focus();
        }
        return;
    }
    const nextConfig = {
        pageSize: clampPageSize(parsedPageSize),
        indentSize: clampIndentSize(parsedIndentSize),
        tabInsertion: ensureValidTabInsertion(interpretedTabValue),
        treeFontSize: clampFontSize(parsedTreeFontSize),
        editorFontSize: clampFontSize(parsedEditorFontSize)
    };
    appConfigState.current = nextConfig;
    updateRuntimeFormattingSettings();
    persistAppConfigToStorage(appConfigState.current);
    await refreshPaginationAfterConfigChange();
    if (appConfigState.modal) {
        appConfigState.modal.hide();
    }
}

function loadAppConfigFromStorage() {
    const storage = getLocalStorageSafe();
    if (!storage) {
        return { ...APP_CONFIG_DEFAULTS };
    }
    try {
        const raw = storage.getItem(APP_CONFIG_STORAGE_KEY);
        if (!raw) {
            return { ...APP_CONFIG_DEFAULTS };
        }
        const parsed = JSON.parse(raw);
        const nextConfig = {
            pageSize: clampPageSize(parsed.pageSize),
            tabInsertion: ensureValidTabInsertion(parsed.tabInsertion),
            indentSize: clampIndentSize(parsed.indentSize),
            treeFontSize: clampFontSize(parsed.treeFontSize),
            editorFontSize: clampFontSize(parsed.editorFontSize)
        };
        return nextConfig;
    }
    catch (error) {
        console.warn("Unable to load saved preferences", error);
        return { ...APP_CONFIG_DEFAULTS };
    }
}

function persistAppConfigToStorage(config) {
    const storage = getLocalStorageSafe();
    if (!storage) return;
    try {
        storage.setItem(APP_CONFIG_STORAGE_KEY, JSON.stringify(config));
    }
    catch (error) {
        console.warn("Unable to save preferences", error);
    }
}

function updateRuntimeFormattingSettings() {
    const sanitizedPageSize = clampPageSize(appConfigState.current?.pageSize);
    const sanitizedIndentSize = clampIndentSize(appConfigState.current?.indentSize);
    const sanitizedTabInsertion = ensureValidTabInsertion(appConfigState.current?.tabInsertion);
    const sanitizedTreeFontSize = clampFontSize(appConfigState.current?.treeFontSize);
    const sanitizedEditorFontSize = clampFontSize(appConfigState.current?.editorFontSize);
    appConfigState.current = {
        pageSize: sanitizedPageSize,
        indentSize: sanitizedIndentSize,
        tabInsertion: sanitizedTabInsertion,
        treeFontSize: sanitizedTreeFontSize,
        editorFontSize: sanitizedEditorFontSize
    };
    runtimeFormattingState.tabInsertion = sanitizedTabInsertion;
    runtimeFormattingState.indentSize = sanitizedIndentSize;
    runtimeFormattingState.indentToken = buildIndentToken(sanitizedIndentSize);
    runtimeFormattingState.treeFontSize = sanitizedTreeFontSize;
    runtimeFormattingState.editorFontSize = sanitizedEditorFontSize;
    applyRuntimeFontSizes();
}

function getConfiguredTabInsertion() {
    return runtimeFormattingState.tabInsertion || PROPERTY_EDITOR_TAB_INSERTION || "\t";
}

function getConfiguredIndentToken() {
    return runtimeFormattingState.indentToken || PROPERTY_EDITOR_INDENT_STEP || "  ";
}

function getConfiguredPageSize() {
    return appConfigState.current?.pageSize || APP_CONFIG_DEFAULTS.pageSize;
}

function clampPageSize(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return APP_CONFIG_DEFAULTS.pageSize;
    }
    return Math.min(Math.max(parsed, APP_CONFIG_MIN_PAGE_SIZE), APP_CONFIG_MAX_PAGE_SIZE);
}

function clampIndentSize(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return APP_CONFIG_DEFAULTS.indentSize;
    }
    return Math.min(Math.max(parsed, APP_CONFIG_MIN_INDENT_SIZE), APP_CONFIG_MAX_INDENT_SIZE);
}

function clampFontSize(value) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) {
        return APP_CONFIG_DEFAULTS.treeFontSize;
    }
    return Math.min(Math.max(parsed, APP_CONFIG_MIN_FONT_SIZE), APP_CONFIG_MAX_FONT_SIZE);
}

function ensureValidTabInsertion(value) {
    if (typeof value !== "string" || value.length === 0) {
        return PROPERTY_EDITOR_TAB_INSERTION;
    }
    return value;
}

function buildIndentToken(indentSize) {
    const safeSize = Math.max(indentSize || APP_CONFIG_DEFAULTS.indentSize, 1);
    return " ".repeat(safeSize);
}

function applyRuntimeFontSizes() {
    if (typeof document === "undefined" || !document.documentElement) return;
    document.documentElement.style.setProperty("--tree-font-size", `${runtimeFormattingState.treeFontSize}rem`);
    document.documentElement.style.setProperty("--editor-font-size", `${runtimeFormattingState.editorFontSize}rem`);
}

function escapeTabInsertionForDisplay(value) {
    if (!value) return "";
    return value
        .replace(/\\/g, "\\\\")
        .replace(/\t/g, "\\t")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/ /g, "\\s");
}

function interpretTabInsertionInput(value) {
    if (typeof value !== "string" || !value.length) {
        return "";
    }
    return value.replace(/\\(\\|t|n|r|s)/g, (_, code) => {
        switch (code) {
            case "t": return "\t";
            case "n": return "\n";
            case "r": return "\r";
            case "s": return " ";
            case "\\": return "\\";
            default: return `\\${code}`;
        }
    });
}

async function refreshPaginationAfterConfigChange() {
    if (topLevelState.mode !== "json-array") {
        resetTopLevelPaginationState();
        return;
    }
    const desiredPageSize = getConfiguredPageSize();
    topLevelPaginationState.pageSize = desiredPageSize;
    if (topLevelState.count <= desiredPageSize) {
        resetTopLevelPaginationState();
        return;
    }
    const kvRoot = topLevelPaginationState.kvRoot || document.querySelector("#view .kv-root");
    if (!kvRoot) {
        resetTopLevelPaginationState();
        return;
    }
    initializeTopLevelPagination(kvRoot);
    await renderTopLevelPage(topLevelPaginationState.currentPage, { forceRerender: true });
}

/*************************************
 *              Search               *
 *************************************/
const searchState = {
    query: "",
    isRegex: false,
    matches: [],
    currentIndex: -1,
    activeElement: null,
    error: null,
    lastQuery: "",
    lastRecordedQuery: "",
    lastFocusedPath: null,
    highlightInfo: null,
};

let searchInput = document.querySelector("#search-input");
let searchRegexToggle = document.querySelector("#search-regex");
let searchPrevButton = document.querySelector("#search-prev");
let searchNextButton = document.querySelector("#search-next");
let searchStatusLabel = document.querySelector("#search-status");
let searchErrorLabel = document.querySelector("#search-error");
let searchRefreshHandle = null;
let replaceInput = document.querySelector("#replace-input");
let replaceAllButton = document.querySelector("#replace-all");
let replaceButton = document.querySelector("#replace-current");
let searchCollapseToggle = document.querySelector("#search-collapse-toggle");
let searchCollapse = document.querySelector("#search-collapse");
const topLevelPaginationState = {
    enabled: false,
    pageSize: getConfiguredPageSize(),
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    kvRoot: null,
    childList: null
};
const topLevelState = { mode: "none", count: 0 };
const topLevelCountLabel = document.querySelector("#top-level-count");
const topLevelInput = document.querySelector("#top-level-index-input");
const topLevelGoButton = document.querySelector("#top-level-go");
const topLevelErrorLabel = document.querySelector("#top-level-error");
const topLevelHighlightState = { kvElement: null, rootElement: null, timeoutHandle: null };
const topLevelPageContainer = document.querySelector("#top-level-pagination");
const topLevelPageStatusLabel = document.querySelector("#top-level-page-status");
const topLevelPageRangeLabel = document.querySelector("#top-level-page-range");
const topLevelPagePrevButton = document.querySelector("#top-level-page-prev");
const topLevelPageNextButton = document.querySelector("#top-level-page-next");
const searchHistoryList = document.querySelector("#search-history-options");
const replaceHistoryList = document.querySelector("#replace-history-options");
const SEARCH_HISTORY_STORAGE_KEY = "jsonlight.searchHistory";
const REPLACE_HISTORY_STORAGE_KEY = "jsonlight.replaceHistory";
let searchHistoryValues = [];
let replaceHistoryValues = [];
let searchHistoryCommitHandle = null;

initializeSearchAndReplaceHistory();
initializeSearchCollapseToggle();

if (topLevelGoButton) {
    topLevelGoButton.addEventListener("click", () => {
        handleTopLevelJump();
    });
}
if (topLevelInput) {
    topLevelInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            handleTopLevelJump();
        }
    });
    topLevelInput.addEventListener("input", () => setTopLevelError(""));
}
if (topLevelPagePrevButton) {
    topLevelPagePrevButton.addEventListener("click", () => {
        changeTopLevelPage(-1);
    });
}
if (topLevelPageNextButton) {
    topLevelPageNextButton.addEventListener("click", () => {
        changeTopLevelPage(1);
    });
}

function requestSearchRefresh() {
    if (!searchInput) return;
    if (searchRefreshHandle) {
        clearTimeout(searchRefreshHandle);
    }
    searchRefreshHandle = setTimeout(() => {
        searchRefreshHandle = null;
        performSearch();
    }, 75);
}

function getLoaderPathSegments(loader) {
    if (!loader) return [];
    const segments = [];
    let current = loader;
    while (current && current.parentLoader) {
        segments.unshift(current.parentKey);
        current = current.parentLoader;
    }
    return segments;
}

function getCollapseWrapper(kvRoot) {
    if (!kvRoot) return null;
    for (const child of kvRoot.children) {
        if (child.classList && child.classList.contains("collapse")) {
            return child;
        }
    }
    return null;
}

function captureExpandedPaths(rootLoader = null) {
    const expanded = [];
    document.querySelectorAll("#view .kv-root").forEach((kvRoot) => {
        if (!kvRoot.loader) return;
        if (rootLoader && !isLoaderDescendantOrSelf(kvRoot.loader, rootLoader)) return;
        const collapseWrapper = getCollapseWrapper(kvRoot);
        if (collapseWrapper && collapseWrapper.classList.contains("show")) {
            const segments = getLoaderPathSegments(kvRoot.loader);
            if (segments.length > 0) {
                expanded.push(segments);
            }
        }
    });
    return expanded;
}

function isLoaderDescendantOrSelf(loader, ancestorCandidate) {
    if (!loader || !ancestorCandidate) return false;
    let current = loader;
    while (current) {
        if (current === ancestorCandidate) return true;
        current = current.parentLoader;
    }
    return false;
}

async function restoreExpandedPaths(paths) {
    if (!paths || !paths.length) return;
    const tasks = paths
        .filter((path) => Array.isArray(path) && path.length > 0)
        .map(async (path) => {
            try {
                const kvRoot = await ensurePathRendered(path);
                if (kvRoot) {
                    await expandKvRoot(kvRoot);
                }
            }
            catch (error) {
                console.warn("Failed to restore expanded path", path, error);
            }
        });
    await Promise.all(tasks);
}

async function focusPathSegments(pathSegments, highlightTopLevel = false) {
    if (!Array.isArray(pathSegments)) return;
    const kvRoot = await ensurePathRendered(pathSegments);
    if (!kvRoot) return;
    focusKvRoot(kvRoot, highlightTopLevel);
}

function setTopLevelError(message) {
    if (!topLevelErrorLabel) return;
    topLevelErrorLabel.textContent = message || "";
}

function clearTopLevelHighlight() {
    if (topLevelHighlightState.timeoutHandle) {
        clearTimeout(topLevelHighlightState.timeoutHandle);
        topLevelHighlightState.timeoutHandle = null;
    }
    if (topLevelHighlightState.kvElement) {
        topLevelHighlightState.kvElement.classList.remove("top-level-focus");
        topLevelHighlightState.kvElement = null;
    }
    if (topLevelHighlightState.rootElement) {
        topLevelHighlightState.rootElement.classList.remove("top-level-focus-root");
        topLevelHighlightState.rootElement = null;
    }
}

function applyTopLevelHighlight(kvElement, rootElement, durationMs = 4000) {
    clearTopLevelHighlight();
    if (!kvElement) return;
    kvElement.classList.add("top-level-focus");
    topLevelHighlightState.kvElement = kvElement;
    if (rootElement) {
        rootElement.classList.add("top-level-focus-root");
        topLevelHighlightState.rootElement = rootElement;
    }
    topLevelHighlightState.timeoutHandle = setTimeout(() => {
        clearTopLevelHighlight();
    }, durationMs);
}

function resetTopLevelPaginationState() {
    topLevelPaginationState.enabled = false;
    topLevelPaginationState.pageSize = getConfiguredPageSize();
    topLevelPaginationState.totalItems = 0;
    topLevelPaginationState.totalPages = 1;
    topLevelPaginationState.currentPage = 1;
    topLevelPaginationState.kvRoot = null;
    topLevelPaginationState.childList = null;
    updateTopLevelPaginationControls();
}

function initializeTopLevelPagination(kvRoot) {
    const configuredPageSize = getConfiguredPageSize();
    if (!kvRoot || topLevelState.mode !== "json-array" || topLevelState.count <= configuredPageSize) {
        resetTopLevelPaginationState();
        return;
    }
    const previousPage = topLevelPaginationState.enabled ? topLevelPaginationState.currentPage : 1;
    topLevelPaginationState.enabled = true;
    topLevelPaginationState.pageSize = configuredPageSize;
    topLevelPaginationState.totalItems = topLevelState.count;
    topLevelPaginationState.totalPages = Math.max(1, Math.ceil(topLevelPaginationState.totalItems / topLevelPaginationState.pageSize));
    topLevelPaginationState.currentPage = Math.min(Math.max(previousPage, 1), topLevelPaginationState.totalPages);
    topLevelPaginationState.kvRoot = kvRoot;
    topLevelPaginationState.childList = null;
    updateTopLevelPaginationControls();
}

function getTopLevelPageRange(pageNumber) {
    const safeTotal = Math.max(topLevelPaginationState.totalItems, 0);
    if (!topLevelPaginationState.enabled || safeTotal === 0) {
        return { start: 0, end: 0 };
    }
    const pageSize = topLevelPaginationState.pageSize || getConfiguredPageSize();
    const clampedPage = Math.min(Math.max(pageNumber, 1), topLevelPaginationState.totalPages || 1);
    const startIndex = (clampedPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, safeTotal);
    return {
        start: startIndex + 1,
        end: endIndex
    };
}

function updateTopLevelPaginationControls() {
    if (!topLevelPageContainer) return;
    if (!topLevelPaginationState.enabled) {
        topLevelPageContainer.hidden = true;
        if (topLevelPageStatusLabel) topLevelPageStatusLabel.textContent = "";
        if (topLevelPageRangeLabel) topLevelPageRangeLabel.textContent = "";
        if (topLevelPagePrevButton) topLevelPagePrevButton.disabled = true;
        if (topLevelPageNextButton) topLevelPageNextButton.disabled = true;
        return;
    }
    topLevelPageContainer.hidden = false;
    if (topLevelPageStatusLabel) {
        topLevelPageStatusLabel.textContent = `${topLevelPaginationState.currentPage} / ${topLevelPaginationState.totalPages}`;
    }
    if (topLevelPageRangeLabel) {
        const range = getTopLevelPageRange(topLevelPaginationState.currentPage);
        topLevelPageRangeLabel.textContent = range.start === 0 && range.end === 0
            ? "Items 0 of 0"
            : `Items ${range.start}–${range.end} of ${topLevelPaginationState.totalItems}`;
    }
    if (topLevelPagePrevButton) {
        topLevelPagePrevButton.disabled = topLevelPaginationState.currentPage <= 1;
    }
    if (topLevelPageNextButton) {
        topLevelPageNextButton.disabled = topLevelPaginationState.currentPage >= topLevelPaginationState.totalPages;
    }
}

function getPageForTopLevelIndex(index) {
    const pageSize = topLevelPaginationState.pageSize || getConfiguredPageSize();
    if (!Number.isFinite(index) || index < 0) return 1;
    return Math.floor(index / pageSize) + 1;
}

async function changeTopLevelPage(delta) {
    if (!topLevelPaginationState.enabled || !delta) return;
    const targetPage = Math.min(
        Math.max(topLevelPaginationState.currentPage + delta, 1),
        topLevelPaginationState.totalPages
    );
    if (targetPage === topLevelPaginationState.currentPage) {
        return;
    }
    if (topLevelPagePrevButton) topLevelPagePrevButton.disabled = true;
    if (topLevelPageNextButton) topLevelPageNextButton.disabled = true;
    try {
        await renderTopLevelPage(targetPage);
    }
    finally {
        updateTopLevelPaginationControls();
    }
}

async function renderTopLevelPage(pageNumber, options = {}) {
    if (!topLevelPaginationState.enabled) return false;
    const kvRoot = topLevelPaginationState.kvRoot;
    if (!kvRoot || !kvRoot.loader) return false;
    const collapseWrapper = kvRoot.querySelector(".collapse");
    if (!collapseWrapper) return false;
    const childList = options.childListOverride || collapseWrapper.querySelector(".child-list");
    if (!childList) return false;

    const pageSize = topLevelPaginationState.pageSize || getConfiguredPageSize();
    const children = kvRoot.loader.getChild();
    const totalItems = Math.max(children.length, 0);
    topLevelPaginationState.totalItems = totalItems;
    topLevelPaginationState.totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    let targetPage = Math.min(Math.max(pageNumber, 1), topLevelPaginationState.totalPages);
    const startIndex = Math.max(0, (targetPage - 1) * pageSize);
    const endIndex = Math.min(startIndex + pageSize, children.length);

    const fragment = document.createDocumentFragment();
    for (let i = startIndex; i < endIndex; i++) {
        const childKV = children[i];
        if (!childKV) continue;
        const [key, loader] = childKV;
        fragment.appendChild(renderKV(key, loader));
    }
    childList.replaceChildren(fragment);
    topLevelPaginationState.childList = childList;
    const previousPage = topLevelPaginationState.currentPage;
    topLevelPaginationState.currentPage = targetPage;
    updateTopLevelPaginationControls();

    if (options.forceCollapseAll) {
        collapseAll();
    }
    else if (options.applyExpandCollapseMode !== false && expandCollapseToggleState === "expanded") {
        await expandAll();
    }
    return previousPage !== targetPage;
}

async function ensureTopLevelPageForIndex(index, options = {}) {
    if (!topLevelPaginationState.enabled) return false;
    if (!Number.isFinite(index) || index < 0) return false;
    const targetPage = getPageForTopLevelIndex(index);
    if (targetPage === topLevelPaginationState.currentPage && !options.forceRerender) {
        return false;
    }
    await renderTopLevelPage(targetPage, options);
    return true;
}

async function ensureTopLevelPageForPath(pathSegments, options = {}) {
    if (!Array.isArray(pathSegments) || pathSegments.length === 0) return false;
    const first = pathSegments[0];
    if (typeof first !== "number") return false;
    return ensureTopLevelPageForIndex(first, options);
}

async function refreshChildListForLoader(loader, options = {}) {
    if (!loader) return null;
    const pathSegments = getLoaderPathSegments(loader);
    let kvRoot = null;
    if (!pathSegments.length) {
        kvRoot = document.querySelector("#view .kv-root");
        if (!kvRoot) return null;
    }
    else {
        kvRoot = await ensurePathRendered(pathSegments);
        if (!kvRoot) return null;
    }
    const collapseWrapper = getCollapseWrapper(kvRoot);
    if (!collapseWrapper) return kvRoot;
    const childList = collapseWrapper.querySelector(".child-list");
    if (!childList) return kvRoot;
    const scrollContainer = document.querySelector("#view");
    const preserveScroll = !!options.preserveScroll;
    const scrollSnapshot = (scrollContainer && preserveScroll)
        ? { left: scrollContainer.scrollLeft, top: scrollContainer.scrollTop }
        : null;
    const wasShown = collapseWrapper.classList.contains("show");
    if (!wasShown) {
        populateCollapseChildren(kvRoot, childList);
    }
    else {
        childList.replaceChildren();
        populateCollapseChildren(kvRoot, childList);
    }
    if (scrollContainer && scrollSnapshot) {
        scrollContainer.scrollTo(scrollSnapshot.left, scrollSnapshot.top);
    }
    return kvRoot;
}

function updateTopLevelNavigator() {
    let mode = "none";
    let count = 0;
    if (g_jsonlLoader) {
        mode = "jsonl";
        count = g_jsonlLoader.getTotalLines();
    }
    else if (g_currentRootLoader) {
        const rootValue = g_currentRootLoader.getValue();
        if (Array.isArray(rootValue)) {
            mode = "json-array";
            count = rootValue.length;
        }
        else if (rootValue && typeof rootValue === "object") {
            mode = "json-object";
            count = Object.keys(rootValue).length;
        }
        else if (typeof rootValue !== "undefined") {
            mode = "json-value";
            count = 1;
        }
    }
    topLevelState.mode = mode;
    topLevelState.count = count;
    if (topLevelCountLabel) {
        topLevelCountLabel.textContent = `${count}`;
    }
    const canJump = (mode === "json-array" || mode === "jsonl") && count > 0;
    if (topLevelInput) {
        topLevelInput.disabled = !canJump;
        topLevelInput.placeholder = mode === "jsonl"
            ? "Line number (1-based)"
            : (mode === "json-array" ? "Index (0-based)" : "Jump works with arrays or JSONL");
        if (mode === "json-array") {
            topLevelInput.min = 0;
            topLevelInput.max = count > 0 ? count - 1 : 0;
        }
        else if (mode === "jsonl") {
            topLevelInput.min = 1;
            topLevelInput.max = count;
        }
        else {
            topLevelInput.min = 0;
            topLevelInput.max = 0;
        }
        if (!canJump) {
            topLevelInput.value = "";
        }
    }
    if (topLevelGoButton) {
        topLevelGoButton.disabled = !canJump;
    }
    if (!canJump) {
        setTopLevelError("");
    }
}

async function handleTopLevelJump() {
    if (!topLevelInput) return;
    if (topLevelState.count === 0) {
        setTopLevelError("No items to jump to.");
        return;
    }
    if (topLevelState.mode === "jsonl" || topLevelState.mode === "json-array") {
        const rawValue = (topLevelInput.value ?? "").trim();
        if (!rawValue) {
            setTopLevelError("Enter a number to jump.");
            return;
        }
        const parsed = Number.parseInt(rawValue, 10);
        if (!Number.isFinite(parsed)) {
            setTopLevelError("Enter a valid number.");
            return;
        }
        if (topLevelState.mode === "jsonl") {
            if (parsed < 1 || parsed > topLevelState.count) {
                setTopLevelError(`Enter a value between 1 and ${topLevelState.count}.`);
                return;
            }
            setTopLevelError("");
            navigateToLine(parsed);
            return;
        }
        if (parsed < 0 || parsed >= topLevelState.count) {
            setTopLevelError(`Enter a value between 0 and ${topLevelState.count - 1}.`);
            return;
        }
        setTopLevelError("");
        await jumpToArrayIndex(parsed);
        return;
    }
    setTopLevelError("Jump works with arrays or JSONL.");
}

async function jumpToArrayIndex(index) {
    const switchedPage = await ensureTopLevelPageForIndex(index, {
        forceCollapseAll: true,
        applyExpandCollapseMode: false
    });
    if (switchedPage) {
        setExpandCollapseToggleState(false);
    }
    const kvRoot = await ensurePathRendered([index]);
    if (!kvRoot) {
        setTopLevelError("Unable to locate that array item.");
        return;
    }
    if (switchedPage) {
        await expandKvRoot(kvRoot);
    }
    focusKvRoot(kvRoot, true);
}

function focusKvRoot(kvRoot, includeRootHighlight = false) {
    if (!kvRoot) return;
    const target = kvRoot.querySelector(".kv") || kvRoot;
    applyTopLevelHighlight(target, includeRootHighlight ? kvRoot : null);
    try {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    catch (error) {
        target.scrollIntoView();
    }
}

function initializeSearchAndReplaceHistory() {
    searchHistoryValues = loadHistoryList(SEARCH_HISTORY_STORAGE_KEY, SEARCH_HISTORY_LIMIT)
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean);
    replaceHistoryValues = loadHistoryList(REPLACE_HISTORY_STORAGE_KEY, REPLACE_HISTORY_LIMIT)
        .filter((value) => typeof value === "string");
    refreshSearchHistoryDatalist();
    refreshReplaceHistoryDatalist();
}

function initializeSearchCollapseToggle() {
    if (!searchCollapseToggle || !searchCollapse) return;
    const updateToggle = () => {
        const isExpanded = searchCollapse.classList.contains("show");
        searchCollapseToggle.textContent = isExpanded ? "−" : "+";
        searchCollapseToggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    };
    updateToggle();
    searchCollapse.addEventListener("show.bs.collapse", () => {
        searchCollapseToggle.textContent = "−";
        searchCollapseToggle.setAttribute("aria-expanded", "true");
    });
    searchCollapse.addEventListener("shown.bs.collapse", updateToggle);
    searchCollapse.addEventListener("hidden.bs.collapse", updateToggle);
}

function getLocalStorageSafe() {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage || null;
    }
    catch (error) {
        console.warn("Local storage unavailable", error);
        return null;
    }
}

function loadHistoryList(storageKey, limit) {
    const storage = getLocalStorageSafe();
    if (!storage) return [];
    try {
        const raw = storage.getItem(storageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.filter((value) => typeof value === "string").slice(0, limit);
        }
    }
    catch (error) {
        console.warn("Failed to load history", error);
    }
    return [];
}

function saveHistoryList(storageKey, values) {
    const storage = getLocalStorageSafe();
    if (!storage) return;
    try {
        storage.setItem(storageKey, JSON.stringify(values));
    }
    catch (error) {
        console.warn("Failed to save history", error);
    }
}

function refreshSearchHistoryDatalist() {
    if (!searchHistoryList) return;
    const seen = new Set();
    const combined = [];
    SEARCH_REGEX_EXAMPLES.forEach((example) => {
        const value = (example ?? "").toString();
        if (value && !seen.has(value)) {
            combined.push(value);
            seen.add(value);
        }
    });
    searchHistoryValues.forEach((value) => {
        const normalized = (value ?? "").toString();
        if (normalized && !seen.has(normalized)) {
            combined.push(normalized);
            seen.add(normalized);
        }
    });
    populateDatalist(searchHistoryList, combined);
}

function refreshReplaceHistoryDatalist() {
    if (!replaceHistoryList) return;
    populateDatalist(replaceHistoryList, [...replaceHistoryValues]);
}

function populateDatalist(listElement, values) {
    if (!listElement) return;
    listElement.innerHTML = "";
    const fragment = document.createDocumentFragment();
    values.forEach((value) => {
        if (typeof value !== "string") return;
        const option = document.createElement("option");
        option.value = value;
        fragment.appendChild(option);
    });
    listElement.appendChild(fragment);
}

function updateHistoryList(history, value, limit) {
    const filtered = history.filter((entry) => entry !== value);
    filtered.unshift(value);
    if (filtered.length > limit) {
        filtered.length = limit;
    }
    return filtered;
}

function recordSearchHistoryValue(value) {
    const normalized = (value ?? "").trim();
    if (!normalized) return;
    searchHistoryValues = updateHistoryList(searchHistoryValues, normalized, SEARCH_HISTORY_LIMIT);
    saveHistoryList(SEARCH_HISTORY_STORAGE_KEY, searchHistoryValues);
    refreshSearchHistoryDatalist();
}

function recordReplaceHistoryValue(value) {
    if (typeof value !== "string") return;
    if (value === "") return;
    replaceHistoryValues = updateHistoryList(replaceHistoryValues, value, REPLACE_HISTORY_LIMIT);
    saveHistoryList(REPLACE_HISTORY_STORAGE_KEY, replaceHistoryValues);
    refreshReplaceHistoryDatalist();
}

function queueSearchHistoryCommit() {
    if (!searchInput) return;
    if (searchHistoryCommitHandle) {
        clearTimeout(searchHistoryCommitHandle);
    }
    searchHistoryCommitHandle = setTimeout(() => {
        searchHistoryCommitHandle = null;
        commitSearchHistory();
    }, SEARCH_HISTORY_COMMIT_DELAY);
}

function flushPendingSearch() {
    if (!searchRefreshHandle) return;
    clearTimeout(searchRefreshHandle);
    searchRefreshHandle = null;
    performSearch();
}

function commitSearchHistory() {
    if (!searchInput) return;
    if (searchHistoryCommitHandle) {
        clearTimeout(searchHistoryCommitHandle);
        searchHistoryCommitHandle = null;
    }
    flushPendingSearch();
    const query = (searchInput.value ?? "").trim();
    if (!query) {
        searchState.lastRecordedQuery = "";
        return;
    }
    if (query === searchState.lastRecordedQuery) {
        return;
    }
    if (searchState.error) return;
    recordSearchHistoryValue(query);
    searchState.lastRecordedQuery = query;
}

function performSearch() {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    searchState.query = query;
    searchState.matches = [];
    searchState.currentIndex = -1;
    searchState.error = null;
    setActiveSearchElement(null);
    const previousQuery = searchState.lastQuery;
    searchState.lastQuery = query;
    if (query !== previousQuery) {
        searchState.lastFocusedPath = null;
    }

    if (!query || !g_currentRootLoader) {
        searchState.lastFocusedPath = null;
        updateSearchControls();
        return;
    }

    const pattern = buildSearchPattern(query, searchState.isRegex);
    if (!pattern) {
        updateSearchControls();
        return;
    }

    const rootValue = g_currentRootLoader.getValue();
    collectSearchMatches(rootValue, [], pattern);

    if (searchState.matches.length === 0) {
        searchState.lastFocusedPath = null;
        updateSearchControls();
        return;
    }

    let focusIndex = 0;
    const preservedIndex = findMatchIndexByPath(searchState.lastFocusedPath);
    if (preservedIndex !== -1) {
        focusIndex = preservedIndex;
    }
    focusSearchResultByIndex(focusIndex);
}

function buildSearchPattern(query, isRegex) {
    if (!query) return null;
    if (isRegex) {
        try {
            // Compile once to validate the pattern; separate helper builds the actual regex per use.
            // eslint-disable-next-line no-new
            new RegExp(query, "i");
        }
        catch (error) {
            searchState.error = error.message;
            return null;
        }
        return {
            mode: "regex",
            source: query,
            collectMatches(text) {
                const target = (text ?? "").toString();
                if (!target) return [];
                const regex = new RegExp(query, "gi");
                const matches = [];
                let occurrenceIndex = 0;
                let match;
                while ((match = regex.exec(target)) !== null) {
                    matches.push({
                        index: match.index,
                        length: match[0].length,
                        text: match[0],
                        groups: match.slice(1),
                        groupsObject: match.groups || null,
                        occurrenceIndex
                    });
                    occurrenceIndex += 1;
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex += 1;
                    }
                }
                return matches;
            },
            buildRegex(globalFlag) {
                return new RegExp(query, globalFlag ? "gi" : "i");
            }
        };
    }
    const needle = query.toLowerCase();
    return {
        mode: "text",
        source: query,
        collectMatches(text) {
            const target = (text ?? "").toString();
            if (!target || !needle) return [];
            const lower = target.toLowerCase();
            const matches = [];
            const step = Math.max(query.length, 1);
            let occurrenceIndex = 0;
            let startIndex = 0;
            while (needle && (startIndex = lower.indexOf(needle, startIndex)) !== -1) {
                matches.push({
                    index: startIndex,
                    length: query.length,
                    text: target.substr(startIndex, query.length),
                    groups: [],
                    groupsObject: null,
                    occurrenceIndex
                });
                occurrenceIndex += 1;
                startIndex += step;
            }
            return matches;
        },
        buildRegex(globalFlag) {
            const escaped = escapeRegExp(query);
            return new RegExp(escaped, globalFlag ? "gi" : "i");
        }
    };
}

function collectSearchMatches(value, path, pattern) {
    if (Array.isArray(value)) {
        value.forEach((item, index) => {
            evaluateSearchNode(path, index, item, pattern);
        });
        return;
    }
    if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, childValue]) => {
            evaluateSearchNode(path, key, childValue, pattern);
        });
        return;
    }

    const primitiveText = formatValueForSearch(value);
    pushValueMatches(path, primitiveText, pattern);
}

function evaluateSearchNode(path, key, value, pattern) {
    const nextPath = [...path, key];
    const keyText = keyToSearchString(key);
    const rawKeyText = typeof key === "string" ? key : (typeof key === "number" ? key.toString() : "");
    pushKeyMatches(nextPath, keyText, rawKeyText, pattern);
    if (isPrimitiveValue(value)) {
        const valueText = formatValueForSearch(value);
        pushValueMatches(nextPath, valueText, pattern);
    }
    if (value && typeof value === "object") {
        collectSearchMatches(value, nextPath, pattern);
    }
}

function pushKeyMatches(path, keyText, rawKeyText, pattern) {
    const sourceText = rawKeyText || keyText || "";
    if (!sourceText || !pattern || typeof pattern.collectMatches !== "function") return;
    const matches = pattern.collectMatches(sourceText);
    matches.forEach((info) => {
        searchState.matches.push({
            path: [...path],
            matchSource: "key",
            snippet: sourceText,
            matchIndex: info.index,
            matchLength: info.length,
            occurrenceIndex: info.occurrenceIndex,
            groups: info.groups || [],
            groupsObject: info.groupsObject || null,
            matchedText: info.text
        });
    });
}

function pushValueMatches(path, valueText, pattern) {
    if (valueText == null || !pattern || typeof pattern.collectMatches !== "function") return;
    const matches = pattern.collectMatches(valueText);
    matches.forEach((info) => {
        searchState.matches.push({
            path: [...path],
            matchSource: "value",
            snippet: valueText,
            matchIndex: info.index,
            matchLength: info.length,
            occurrenceIndex: info.occurrenceIndex,
            groups: info.groups || [],
            groupsObject: info.groupsObject || null,
            matchedText: info.text
        });
    });
}

function keyToSearchString(key) {
    if (key === null || typeof key === "undefined") return "root";
    if (typeof key === "number") return `[${key}]`;
    if (typeof key === "string") return JSON.stringify(key);
    return key.toString();
}

function formatValueForSearch(value) {
    if (value === null) return "null";
    switch (typeof value) {
        case "string":
            return value;
        case "number":
        case "boolean":
            return value.toString();
        case "object":
            try {
                return JSON.stringify(value);
            }
            catch (error) {
                return "";
            }
        default:
            return "";
    }
}

function isPrimitiveValue(value) {
    return value === null || (typeof value !== "object" && typeof value !== "function");
}

async function focusSearchResultByIndex(index) {
    if (index < 0 || index >= searchState.matches.length) return;
    const match = searchState.matches[index];
    const kvRoot = await ensurePathRendered(match.path);
    if (!kvRoot) {
        updateSearchControls();
        return;
    }
    const target = kvRoot.querySelector(".kv") || kvRoot;
    setActiveSearchElement(target);
    highlightMatchInKv(kvRoot, match);
    try {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    catch (error) {
        target.scrollIntoView();
    }
    searchState.currentIndex = index;
    searchState.lastFocusedPath = match
        ? {
            path: clonePath(match.path),
            source: match.matchSource,
            occurrenceIndex: typeof match.occurrenceIndex === "number" ? match.occurrenceIndex : null
        }
        : null;
    updateSearchControls();
}

function clonePath(path) {
    return Array.isArray(path) ? [...path] : null;
}

function findMatchIndexByPath(targetInfo) {
    if (!targetInfo || !targetInfo.path) return -1;
    for (let i = 0; i < searchState.matches.length; i++) {
        const match = searchState.matches[i];
        if (match.matchSource === targetInfo.source && pathsEqual(match.path, targetInfo.path)) {
            const hasOccurrence = typeof targetInfo.occurrenceIndex === "number";
            if (hasOccurrence && typeof match.occurrenceIndex === "number" && match.occurrenceIndex !== targetInfo.occurrenceIndex) {
                continue;
            }
            return i;
        }
    }
    return -1;
}

function pathsEqual(pathA, pathB) {
    if (!Array.isArray(pathA) || !Array.isArray(pathB)) return false;
    if (pathA.length !== pathB.length) return false;
    for (let i = 0; i < pathA.length; i++) {
        if (pathA[i] !== pathB[i]) return false;
    }
    return true;
}

async function ensurePathRendered(pathSegments) {
    const rootKvRoot = document.querySelector("#view .kv-root");
    if (!rootKvRoot) return null;
    if (Array.isArray(pathSegments) && pathSegments.length > 0) {
        await ensureTopLevelPageForPath(pathSegments);
    }
    if (!pathSegments || pathSegments.length === 0) {
        await expandKvRoot(rootKvRoot);
        return rootKvRoot;
    }

    let currentKvRoot = rootKvRoot;
    for (const segment of pathSegments) {
        await expandKvRoot(currentKvRoot);
        currentKvRoot = findChildKvRoot(currentKvRoot, segment);
        if (!currentKvRoot) return null;
    }
    return currentKvRoot;
}

function expandKvRoot(kvRoot) {
    return new Promise((resolve) => {
        const collapseWrapper = kvRoot.querySelector(".collapse");
        if (!collapseWrapper) {
            resolve();
            return;
        }
        if (collapseWrapper.classList.contains("show")) {
            resolve();
            return;
        }

        const onShown = () => {
            collapseWrapper.removeEventListener('shown.bs.collapse', onShown);
            resolve();
        };
        collapseWrapper.addEventListener('shown.bs.collapse', onShown);
        let collapse = bootstrap.Collapse.getInstance(collapseWrapper);
        if (collapse) {
            collapse.show();
        }
        else {
            collapse = new bootstrap.Collapse(collapseWrapper);
        }
    });
}

function findChildKvRoot(parentKvRoot, key) {
    const collapseWrapper = parentKvRoot.querySelector(".collapse");
    if (!collapseWrapper) return null;
    const childList = collapseWrapper.querySelector(".child-list");
    if (!childList) return null;
    for (const child of childList.children) {
        if (child.loader && keysEqual(child.loader.parentKey, key)) {
            return child;
        }
    }
    return null;
}

function keysEqual(a, b) {
    if (typeof a === "number" || typeof b === "number") {
        return Number(a) === Number(b);
    }
    return String(a) === String(b);
}

function adjustExpandedPathsForArrayInsertion(paths, parentPath, insertIndex) {
    if (!Array.isArray(paths) || !Number.isInteger(insertIndex)) return paths;
    const normalizedParentPath = Array.isArray(parentPath) ? parentPath : [];
    return paths.map((path) => adjustExpandedPathForArrayInsertion(path, normalizedParentPath, insertIndex));
}

function adjustExpandedPathForArrayInsertion(path, parentPath, insertIndex) {
    if (!Array.isArray(path)) return path;
    if (path.length <= parentPath.length) return path;
    for (let i = 0; i < parentPath.length; i++) {
        if (!keysEqual(path[i], parentPath[i])) {
            return path;
        }
    }
    const childSegmentIndex = parentPath.length;
    const childKey = path[childSegmentIndex];
    if (typeof childKey === "number" && childKey >= insertIndex) {
        const adjusted = [...path];
        adjusted[childSegmentIndex] = childKey + 1;
        return adjusted;
    }
    return path;
}

function setActiveSearchElement(element) {
    if (searchState.activeElement && searchState.activeElement !== element) {
        searchState.activeElement.classList.remove("search-current");
    }
    if (element) {
        element.classList.add("search-current");
        searchState.activeElement = element;
    }
    else {
        searchState.activeElement = null;
        clearMatchHighlight();
    }
}

function updateSearchControls() {
    const hasMatches = searchState.matches.length > 0 && !searchState.error;
    if (searchPrevButton) searchPrevButton.disabled = !hasMatches;
    if (searchNextButton) searchNextButton.disabled = !hasMatches;
    if (searchStatusLabel) {
        if (hasMatches && searchState.currentIndex >= 0) {
            searchStatusLabel.textContent = `${searchState.currentIndex + 1} / ${searchState.matches.length}`;
        }
        else {
            searchStatusLabel.textContent = "0 / 0";
        }
    }
    if (searchErrorLabel) {
        searchErrorLabel.textContent = searchState.error ? `Regex error: ${searchState.error}` : "";
    }
    const canReplaceNow = hasMatches && !!searchState.query;
    if (replaceAllButton) replaceAllButton.disabled = !canReplaceNow;
    if (replaceButton) replaceButton.disabled = !canReplaceNow;
}

function getSearchRegex(global, options = {}) {
    if (!searchState.query) return null;
    let pattern = searchState.query;
    if (!searchState.isRegex) {
        pattern = escapeRegExp(searchState.query);
    }
    const flags = global ? "gi" : "i";
    try {
        return new RegExp(pattern, flags);
    }
    catch (error) {
        if (options.reportError) {
            searchState.error = error.message;
            updateSearchControls();
        }
        return null;
    }
}

function escapeHtml(str) {
    if (str == null) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function clearMatchHighlight() {
    if (searchState.highlightInfo && searchState.highlightInfo.element) {
        searchState.highlightInfo.element.innerHTML = searchState.highlightInfo.originalHtml;
    }
    searchState.highlightInfo = null;
}

function applyTextHighlight(element, matchDetails) {
    if (!element) return;
    const text = element.textContent ?? "";
    if (!text) return;
    const regex = getSearchRegex(true);
    if (!regex) return;
    const targetOccurrence = matchDetails && typeof matchDetails.occurrenceIndex === "number"
        ? matchDetails.occurrenceIndex
        : 0;
    let occurrence = 0;
    let highlightMatch = null;
    let execResult;
    regex.lastIndex = 0;
    while ((execResult = regex.exec(text)) !== null) {
        if (occurrence === targetOccurrence) {
            highlightMatch = execResult;
            break;
        }
        occurrence += 1;
        if (!regex.global) {
            break;
        }
        if (execResult.index === regex.lastIndex) {
            regex.lastIndex += 1;
        }
    }
    if (!highlightMatch) {
        regex.lastIndex = 0;
        highlightMatch = regex.exec(text);
        if (!highlightMatch) return;
    }
    const matchStart = highlightMatch.index;
    const matchText = highlightMatch[0] ?? "";
    if (matchStart == null || matchStart < 0 || !matchText) return;
    const before = text.slice(0, matchStart);
    const after = text.slice(matchStart + matchText.length);
    searchState.highlightInfo = {
        element,
        originalHtml: element.innerHTML
    };
    element.innerHTML = `${escapeHtml(before)}<span class="match-highlight">${escapeHtml(matchText)}</span>${escapeHtml(after)}`;
}

function highlightMatchInKv(kvRoot, match) {
    clearMatchHighlight();
    if (!kvRoot || !match) return;
    let targetElement = null;
    if (match.matchSource === "key") {
        targetElement = kvRoot.querySelector(".json-key");
    }
    else {
        targetElement = kvRoot.querySelector(".json-value");
    }
    if (targetElement) {
        applyTextHighlight(targetElement, match);
    }
}

function moveSearch(direction) {
    commitSearchHistory();
    if (searchState.matches.length === 0 || searchState.error) return;
    let targetIndex = searchState.currentIndex;
    if (targetIndex === -1) {
        targetIndex = direction > 0 ? 0 : searchState.matches.length - 1;
    }
    else {
        targetIndex = (targetIndex + direction + searchState.matches.length) % searchState.matches.length;
    }
    focusSearchResultByIndex(targetIndex);
}

function canPerformReplacement() {
    return !!searchState.query && !searchState.error && searchState.matches.length > 0;
}

function getReplaceText() {
    if (!replaceInput) return "";
    return replaceInput.value ?? "";
}

function getReplacementTextForRegexEngine() {
    const raw = getReplaceText();
    if (searchState.isRegex) {
        return raw;
    }
    return raw.replace(/\$/g, "$$$$");
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildReplacementRegex(replaceAllOccurrences) {
    return getSearchRegex(replaceAllOccurrences, { reportError: true });
}

async function replaceValueAtPath(path, replaceAllOccurrences, matchDetails = null) {
    const kvRoot = await ensurePathRendered(path);
    if (!kvRoot || !kvRoot.loader) return false;
    const loader = kvRoot.loader;
    const currentValue = loader.getValue();
    if (typeof currentValue !== "string") return false;
    let newValue;
    if (!replaceAllOccurrences && canUseMatchDetails(matchDetails)) {
        newValue = replaceUsingMatchDetails(currentValue, matchDetails);
    }
    else {
        const regex = buildReplacementRegex(true);
        if (!regex) return false;
        const replacementText = getReplacementTextForRegexEngine();
        newValue = currentValue.replace(regex, replacementText);
    }
    if (newValue === currentValue) return false;
    if (typeof loader.updateValue === "function") {
        loader.updateValue(newValue);
    }
    else {
        loader.value = newValue;
    }
    refreshRenderedString(kvRoot, newValue);
    handleValueChanged(loader, { skipSearchRefresh: true });
    return true;
}

async function replaceCurrentMatch(advanceToNext) {
    if (!canPerformReplacement()) return;
    if (searchState.currentIndex === -1) {
        await focusSearchResultByIndex(0);
    }
    if (searchState.currentIndex === -1) return;
    const currentMatch = searchState.matches[searchState.currentIndex];
    if (!currentMatch) return;
    if (currentMatch.matchSource !== "value") {
        moveSearch(1);
        return;
    }
    const currentPath = clonePath(currentMatch.path);
    const replaced = await replaceValueAtPath(currentPath, false, currentMatch);
    if (!replaced) return;
    recordReplaceHistoryValue(getReplaceText());
    let desiredInfo = {
        path: currentPath,
        source: "value",
        occurrenceIndex: typeof currentMatch.occurrenceIndex === "number" ? currentMatch.occurrenceIndex : null
    };
    if (advanceToNext) {
        const nextMatch = searchState.matches[searchState.currentIndex + 1];
        desiredInfo = nextMatch
            ? {
                path: clonePath(nextMatch.path),
                source: nextMatch.matchSource,
                occurrenceIndex: typeof nextMatch.occurrenceIndex === "number" ? nextMatch.occurrenceIndex : null
            }
            : null;
    }
    searchState.lastFocusedPath = desiredInfo;
    performSearch();
}

async function replaceAllMatches() {
    if (!canPerformReplacement()) return;
    const pathKeys = new Set();
    const matchPaths = searchState.matches
        .filter(match => match.matchSource === "value")
        .map(match => clonePath(match.path))
        .filter(Boolean)
        .filter((path) => {
            const key = JSON.stringify(path);
            if (pathKeys.has(key)) return false;
            pathKeys.add(key);
            return true;
        });
    let replacedAny = false;
    for (const path of matchPaths) {
        const replaced = await replaceValueAtPath(path, true);
        if (replaced) {
            replacedAny = true;
        }
    }
    if (replacedAny) {
        recordReplaceHistoryValue(getReplaceText());
    }
    searchState.lastFocusedPath = null;
    performSearch();
}

function canUseMatchDetails(details) {
    return !!details
        && typeof details.matchIndex === "number"
        && typeof details.matchLength === "number"
        && details.matchIndex >= 0;
}

function replaceUsingMatchDetails(currentValue, matchDetails) {
    if (!canUseMatchDetails(matchDetails)) return currentValue;
    const start = matchDetails.matchIndex;
    const end = start + matchDetails.matchLength;
    if (start > currentValue.length || end > currentValue.length) {
        return currentValue;
    }
    const replacementSegment = buildReplacementSegment(matchDetails, currentValue);
    return `${currentValue.slice(0, start)}${replacementSegment}${currentValue.slice(end)}`;
}

function buildReplacementSegment(matchDetails, inputText) {
    const rawTemplate = getReplaceText();
    if (!searchState.isRegex) {
        return rawTemplate;
    }
    const matchText = getMatchedTextFromDetails(matchDetails, inputText);
    const groups = Array.isArray(matchDetails.groups) ? matchDetails.groups : [];
    const fakeMatch = [matchText, ...groups];
    fakeMatch.index = typeof matchDetails.matchIndex === "number" ? matchDetails.matchIndex : 0;
    fakeMatch.input = inputText;
    fakeMatch.groups = matchDetails.groupsObject || {};
    return applyReplacementTemplate(rawTemplate, fakeMatch, inputText);
}

function getMatchedTextFromDetails(matchDetails, inputText) {
    if (matchDetails && typeof matchDetails.matchedText === "string") {
        return matchDetails.matchedText;
    }
    const start = typeof matchDetails.matchIndex === "number" ? matchDetails.matchIndex : 0;
    const length = typeof matchDetails.matchLength === "number" ? matchDetails.matchLength : 0;
    return inputText.slice(start, start + length);
}

function applyReplacementTemplate(template, matchResult, inputText) {
    if (template == null) return "";
    const matchText = matchResult[0] ?? "";
    const matchIndex = typeof matchResult.index === "number" ? matchResult.index : 0;
    const namedGroups = matchResult.groups || {};
    const groupCount = Math.max(matchResult.length - 1, 0);
    return template.replace(/\$([$&`']|<[^>]+>|\d{1,2})/g, (full, token) => {
        switch (token) {
            case "$":
                return "$";
            case "&":
                return matchText;
            case "`":
                return inputText.slice(0, matchIndex);
            case "'":
                return inputText.slice(matchIndex + matchText.length);
            default:
                if (token.startsWith("<") && token.endsWith(">")) {
                    const name = token.slice(1, -1);
                    return Object.prototype.hasOwnProperty.call(namedGroups, name) && namedGroups[name] != null
                        ? namedGroups[name]
                        : "";
                }
                const groupIndex = Number.parseInt(token, 10);
                if (!Number.isNaN(groupIndex)) {
                    if (groupIndex < 1) {
                        return full;
                    }
                    if (groupIndex >= 1 && groupIndex <= groupCount) {
                        const value = matchResult[groupIndex];
                        return value != null ? value : "";
                    }
                    return "";
                }
                return full;
        }
    });
}

/*************************************
 *              Renderer             *
 *************************************/

// JSON key-value pair -> HTML element
// for a key-value pair in an object, key is a string.
// for elements in a list, key is a number "index".
// for the root-level value, key is null.
function renderKV(key, loader) {
    let kvRoot = newKV(loader);
    let kv = kvRoot.querySelector(".kv");
    let kvText = kvRoot.querySelector(".kv .kv-text");
    attachBulkCheckboxIfNeeded(kvRoot, kv, kvText);
    kvText.appendChild(renderKey(key));

    let colonSpan = document.createElement("span");
    colonSpan.innerText = ": ";
    kvText.appendChild(colonSpan);

    value = loader.getValue();
    let valueSpan = null;
    switch (typeof value) {
        case "string":
            valueSpan = renderString(kvRoot, value);
            break;
        case "number":
            valueSpan = renderNumber(kvRoot, value);
            break;
        case "boolean":
            valueSpan = renderBool(kvRoot, value);
            break;
        case "object":
            if (value == null) {
                valueSpan = renderNull(kvRoot, value);
            }
            else if (Array.isArray(value)) {
                valueSpan = renderArray(kvRoot, value);
            }
            else {
                valueSpan = renderObject(kvRoot, value);
            }
    }
    kvText.appendChild(valueSpan);
    addNodeActionButtons(kvRoot);
    return kvRoot;
}

function newKV(loader) {
    let kvRoot = document.createElement("div");
    kvRoot.loader = loader;
    kvRoot.classList.add("kv-root");
    let kv = document.createElement("div");
    kv.classList.add("kv", "d-flex", "align-items-center", "mb-1");
    let kvText = document.createElement("div");
    kvText.classList.add("kv-text");
    kv.appendChild(kvText);
    kvRoot.appendChild(kv);
    return kvRoot;
}

function newIconButton(text) {
    let button = document.createElement("button");
    button.classList.add("btn", "btn-light", "btn-sm", "btn-icon", "btn-icon-large");
    button.setAttribute("type", "button");
    button.innerHTML = text;
    return button;
}

function newToggleButton(text) {
    let toggleButton = newIconButton(text);
    toggleButton.setAttribute("data-bs-toggle", "button");
    return toggleButton;
}

function ensureButtonGroup(kvRoot) {
    let kv = kvRoot.querySelector(".kv");
    let buttonGroup = kv.querySelector(".kv-button-group");
    if (!buttonGroup) {
        buttonGroup = document.createElement("div");
        buttonGroup.classList.add("kv-button-group");
        kv.insertBefore(buttonGroup, kv.firstChild);
    }
    return buttonGroup;
}

// Adds a collapse button and a collapsed child list to kvRoot.
// The child list is initially empty,
// When the button is hit, the child list is rendered from dataRef
function addCollapse(kvRoot, dataRef) {
    kvRoot.dataRef = dataRef

    let kv = kvRoot.querySelector(".kv");
    
    let collapseButton = newToggleButton("+");
    collapseButton.classList.add("toggle-button", "collapse-button");
    let buttonGroup = ensureButtonGroup(kvRoot);
    buttonGroup.insertBefore(collapseButton, buttonGroup.firstChild);
    
    let collapseWrapper = document.createElement("div");
    collapseWrapper.classList.add("collapse");
    let childBlock = document.createElement("div");
    childBlock.classList.add("child-block", "d-flex", "gap-2");
    let indent = document.createElement("div");
    indent.classList.add("indent", "border-end", "pe-5", "flex-shrink-0");
    let childList = document.createElement("div");
    childList.classList.add("child-list");
    childBlock.appendChild(indent);
    childBlock.appendChild(childList);
    collapseWrapper.appendChild(childBlock);
    kvRoot.appendChild(collapseWrapper);
    
    collapseButton.addEventListener("click", (ev) => {
        if (!collapseWrapper.classList.contains("collapsing")) {
            new bootstrap.Collapse(collapseWrapper);
        }
    });

    collapseWrapper.addEventListener('show.bs.collapse', (ev) => {
        ev.stopPropagation();
        populateCollapseChildren(kvRoot, childList);
        collapseButton.innerHTML = "-";
        collapseButton.setAttribute("aria-expanded", "true");
    });
    collapseWrapper.addEventListener('hidden.bs.collapse', (ev) => {
        ev.stopPropagation();
        childList.replaceChildren();
        collapseButton.innerHTML = "+";
        collapseButton.setAttribute("aria-expanded", "false");
    })
}

function populateCollapseChildren(kvRoot, childList) {
    if (!kvRoot || !kvRoot.loader || !childList) return;
    if (topLevelPaginationState.enabled && kvRoot === topLevelPaginationState.kvRoot) {
        renderTopLevelPage(topLevelPaginationState.currentPage, {
            childListOverride: childList,
            applyExpandCollapseMode: false,
            forceRerender: true
        });
        return;
    }
    if (childList.childElementCount > 0) return;
    const fragment = document.createDocumentFragment();
    for (const childKV of kvRoot.loader.getChild()) {
        fragment.appendChild(renderKV(...childKV));
    }
    childList.appendChild(fragment);
}

// for a key-value pair in an object, key is a string.
// for elements in a list, key is a number "index".
// for the root-level value, key is null.
function renderKey(key) {
    let keystr = "key error";
    if (key == null) keystr = "root";
    else if (typeof(key) == "number") {
        keystr = "[" + key.toString() + "]";
    }
    else if (typeof(key) == "string") {
        keystr = JSON.stringify(key);
    }
    let keySpan = document.createElement("span");
    keySpan.classList.add("text-primary", "json-key");
    keySpan.innerText = keystr;
    return keySpan;
}

function addViewRaw(kvRoot) {
    let viewRawButton = newToggleButton("≣");
    viewRawButton.classList.remove("btn-icon-large");
    viewRawButton.classList.add("toggle-button", "view-raw-button");
    viewRawButton.addEventListener("click", (ev) => {
        if (viewRawButton.classList.contains("active")) {
            renderRawString(kvRoot);
        }
        else {
            cancelRawString(kvRoot);
        }
    });
    let buttonGroup = ensureButtonGroup(kvRoot);
    buttonGroup.appendChild(viewRawButton);
}

function addEditButton(kvRoot) {
    if (!propertyEditorState.modalElement || !propertyEditorState.textarea) return;
    let editButton = newIconButton("✎");
    editButton.classList.add("toggle-button", "edit-button", "btn-icon-large");
    editButton.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const loader = kvRoot ? kvRoot.loader : null;
        const value = loader ? loader.getValue() : null;
        if (Array.isArray(value)) {
            openPropertyRenameEditor(kvRoot);
        }
        else {
            openPropertyEditor(kvRoot);
        }
    });

    let buttonGroup = ensureButtonGroup(kvRoot);
    let viewRawButton = buttonGroup.querySelector(".view-raw-button");
    if (viewRawButton) {
        viewRawButton.insertAdjacentElement("afterend", editButton);
    }
    else {
        buttonGroup.appendChild(editButton);
    }
    updateEditingButtonVisibility(editButton);
}

function addDuplicateButton(kvRoot) {
    if (!kvRoot || !kvRoot.loader || !kvRoot.loader.parentLoader) return;
    const duplicateButton = newIconButton("⎘");
    duplicateButton.classList.add("toggle-button", "duplicate-button", "btn-icon-large");
    duplicateButton.title = "Duplicate item";
    duplicateButton.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        await handleDuplicateNode(kvRoot);
    });
    const buttonGroup = ensureButtonGroup(kvRoot);
    buttonGroup.appendChild(duplicateButton);
    updateEditingButtonVisibility(duplicateButton);
}

function addDeleteButton(kvRoot) {
    if (!kvRoot || !kvRoot.loader || !kvRoot.loader.parentLoader) return;
    const deleteButton = newIconButton("×");
    deleteButton.classList.remove("btn-icon-large");
    deleteButton.classList.add("toggle-button", "delete-button");
    deleteButton.title = "Delete item";
    deleteButton.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        await handleDeleteNode(kvRoot);
    });
    const buttonGroup = ensureButtonGroup(kvRoot);
    buttonGroup.appendChild(deleteButton);
    updateEditingButtonVisibility(deleteButton);
}

function addNodeActionButtons(kvRoot) {
    if (!kvRoot || !kvRoot.loader || !kvRoot.loader.parentLoader) return;
    addDuplicateButton(kvRoot);
    addDeleteButton(kvRoot);
}

function openPropertyEditor(kvRoot) {
    if (!propertyEditorState.modal || !propertyEditorState.textarea) return;
    propertyEditorState.currentKvRoot = kvRoot;
    const loader = kvRoot.loader;
    const value = loader ? loader.getValue() : "";
    propertyEditorState.textarea.value = typeof value === "string" ? value : "";
    updatePropertyEditorKeyUI(kvRoot);
    updatePropertyEditorPath(loader);
    schedulePropertyEditorCaretUpdate();
    propertyEditorState.modal.show();
}

function formatPropertyEditorKeyLabel(key) {
    if (key == null) return "root";
    if (typeof key === "number") return `[${key}]`;
    if (typeof key === "string") return JSON.stringify(key);
    return String(key);
}

function isPropertyEditorKeyEditable(loader) {
    if (!loader || !loader.parentLoader) return false;
    const parentValue = loader.parentLoader.getValue();
    if (!parentValue || typeof parentValue !== "object" || Array.isArray(parentValue)) return false;
    return typeof loader.parentKey === "string";
}

function getAppendTargetMode() {
    if (g_jsonlLoader && g_currentMode === "jsonl-line") {
        return "jsonl";
    }
    if (g_currentRootLoader) {
        const rootValue = g_currentRootLoader.getValue();
        if (Array.isArray(rootValue)) {
            return "json-array";
        }
    }
    return null;
}

function setAppendDataError(message) {
    if (!appendDataState.errorLabel) return;
    if (message) {
        appendDataState.errorLabel.textContent = message;
        appendDataState.errorLabel.classList.remove("d-none");
    }
    else {
        appendDataState.errorLabel.textContent = "";
        appendDataState.errorLabel.classList.add("d-none");
    }
}

function updateAppendDataSummary(count, mode) {
    if (appendDataState.formatLabel) {
        appendDataState.formatLabel.textContent = mode ? `Format: ${mode.toUpperCase()}` : "Format: —";
    }
    if (appendDataState.countLabel) {
        appendDataState.countLabel.textContent = `Will add: ${count || 0}`;
    }
}

function setAppendDataStatus(message, isWarning = false) {
    if (!appendDataState.statusLabel) return;
    appendDataState.statusLabel.textContent = message || "";
    appendDataState.statusLabel.classList.toggle("append-data-status-warning", !!isWarning);
}

function setAppendDataApplyState(disabled, reason = "") {
    if (!appendDataState.applyButton) return;
    appendDataState.applyButton.disabled = !!disabled;
    appendDataState.applyButton.title = disabled && reason ? reason : "Append";
}

function parseJsonTextWithContext(text) {
    try {
        const value = JSON.parse(text);
        return { success: true, value };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            context: buildJsonParseErrorContext(text, error.message)
        };
    }
}

function focusAppendDataError(context) {
    if (!context || !appendDataState.textArea) return;
    const offset = getOffsetForLineAndColumn(appendDataState.textArea.value || "", context.line, context.column);
    appendDataState.textArea.focus();
    appendDataState.textArea.setSelectionRange(offset, offset);
    const lineHeight = parseFloat(getComputedStyle(appendDataState.textArea).lineHeight || "16");
    const targetTop = Math.max(0, (context.line - 1) * lineHeight - appendDataState.textArea.clientHeight / 2);
    appendDataState.textArea.scrollTop = targetTop;
}

function parseJsonlText(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    const items = [];
    for (let i = 0; i < lines.length; i += 1) {
        try {
            items.push(JSON.parse(lines[i]));
        }
        catch (error) {
            return {
                success: false,
                error: `Line ${i + 1}: ${error.message}`,
                context: { line: i + 1, column: 1 }
            };
        }
    }
    return { success: true, items };
}

function parseAppendDataText(text, hintMode = null) {
    const trimmed = (text || "").trim();
    if (!trimmed) {
        return { success: false, error: "Paste JSON/JSONL or choose a file first." };
    }
    if (hintMode === "jsonl") {
        const jsonlResult = parseJsonlText(trimmed);
        if (jsonlResult.success) {
            return { success: true, mode: "jsonl", items: jsonlResult.items, value: null };
        }
    }
    const jsonResult = parseJsonTextWithContext(trimmed);
    if (jsonResult.success) {
        const value = jsonResult.value;
        const items = Array.isArray(value) ? value : [value];
        return { success: true, mode: "json", items, value };
    }
    const jsonlFallback = parseJsonlText(trimmed);
    if (jsonlFallback.success) {
        return { success: true, mode: "jsonl", items: jsonlFallback.items, value: null };
    }
    return { success: false, error: jsonResult.error, context: jsonResult.context };
}

function scheduleAppendDataParse(hintMode = null) {
    if (!appendDataState.textArea) return;
    if (appendDataState.parseHandle) {
        clearTimeout(appendDataState.parseHandle);
        appendDataState.parseHandle = null;
    }
    appendDataState.parseHandle = setTimeout(() => {
        appendDataState.parseHandle = null;
        const result = parseAppendDataText(appendDataState.textArea.value, hintMode);
        if (!result.success) {
            appendDataState.parsedItems = null;
            appendDataState.parsedMode = null;
            appendDataState.parsedValue = null;
            updateAppendDataSummary(0, null);
            const location = result.context && result.context.line && result.context.column
                ? ` (Ln ${result.context.line}, Col ${result.context.column})`
                : "";
            setAppendDataError(result.error ? `Parse error: ${result.error}${location}` : "Unable to parse input.");
            if (result.context) {
                focusAppendDataError(result.context);
            }
            if (appendDataState.applyButton) appendDataState.applyButton.disabled = true;
            return;
        }
        appendDataState.parsedItems = result.items;
        appendDataState.parsedMode = result.mode;
        appendDataState.parsedValue = result.value;
        updateAppendDataSummary(result.items.length, result.mode);
        setAppendDataError("");
        const targetMode = getAppendTargetMode();
        let disableApply = !targetMode || result.items.length === 0;
        let statusMessage = "";
        let statusWarning = false;
        if (!targetMode) {
            statusMessage = "Append works with JSON arrays or JSONL data.";
            statusWarning = true;
        }
        if (targetMode && result.items.length > 0) {
            if (targetMode === "jsonl" && g_jsonlLoader && g_jsonlLoader.lines.length > 0) {
                try {
                    const existingSample = JSON.parse(g_jsonlLoader.lines[0]);
                    const incomingSample = result.items[0];
                    const message = getTopLevelCompatibilityMessage(existingSample, incomingSample);
                    if (message) {
                        statusMessage = message;
                        statusWarning = true;
                        disableApply = true;
                    }
                }
                catch (error) {
                    statusMessage = "Unable to validate JSONL structure.";
                    statusWarning = true;
                    disableApply = true;
                }
            }
            if (targetMode === "json-array" && g_currentRootLoader) {
                try {
                    const rootValue = g_currentRootLoader.getValue();
                    if (!Array.isArray(rootValue)) {
                        statusMessage = "Current data is not an array.";
                        statusWarning = true;
                        disableApply = true;
                    }
                    else if (rootValue.length > 0) {
                        const existingSample = rootValue[0];
                        const incomingSample = result.items[0];
                        const message = getTopLevelCompatibilityMessage(existingSample, incomingSample);
                        if (message) {
                            statusMessage = message;
                            statusWarning = true;
                            disableApply = true;
                        }
                    }
                }
                catch (error) {
                    statusMessage = "Unable to validate array structure.";
                    statusWarning = true;
                    disableApply = true;
                }
            }
        }
        if (!statusMessage && disableApply && result.items.length === 0) {
            statusMessage = "No items to append.";
            statusWarning = true;
        }
        setAppendDataStatus(statusMessage, statusWarning);
        if (disableApply) {
            const tooltip = statusMessage || "Append is unavailable.";
            setAppendDataApplyState(true, tooltip);
        }
        else {
            setAppendDataApplyState(false, "Append");
        }
    }, APPEND_DATA_PARSE_DEBOUNCE_MS);
}

function resetAppendDataDialog() {
    appendDataState.parsedItems = null;
    appendDataState.parsedMode = null;
    appendDataState.parsedValue = null;
    if (appendDataState.fileInput) appendDataState.fileInput.value = "";
    if (appendDataState.textArea) appendDataState.textArea.value = "";
    updateAppendDataSummary(0, null);
    setAppendDataError("");
    setAppendDataStatus("");
    setAppendDataApplyState(true, "Paste or choose data to append.");
}

function formatKeyList(keys, limit = 6) {
    if (!Array.isArray(keys)) return "";
    const shown = keys.slice(0, limit);
    const suffix = keys.length > limit ? ` +${keys.length - limit} more` : "";
    return `${shown.join(", ")}${suffix}`;
}

function describeTopLevelShape(value) {
    const category = getTopLevelCategory(value);
    if (category === "object") {
        const keys = Object.keys(value || {});
        return `object keys: ${formatKeyList(keys) || "(none)"}`;
    }
    return `type: ${category}`;
}

function getTopLevelCompatibilityMessage(existingItem, newItem) {
    if (isCompatibleTopLevel(existingItem, newItem)) return null;
    return `Incompatible top-level structure (existing ${describeTopLevelShape(existingItem)}; new ${describeTopLevelShape(newItem)}).`;
}

function getTopLevelCategory(value) {
    if (value === null || value === undefined) return "null";
    if (Array.isArray(value)) return "array";
    const type = typeof value;
    if (type === "object") return "object";
    if (type === "string") return "string";
    if (type === "number") return "number";
    if (type === "boolean") return "boolean";
    return "other";
}

function getObjectShapeKey(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return Object.keys(value).sort().join("|");
}

function isCompatibleTopLevel(existingItem, newItem) {
    const existingCategory = getTopLevelCategory(existingItem);
    const newCategory = getTopLevelCategory(newItem);
    if (existingCategory !== newCategory) return false;
    if (existingCategory === "object") {
        return getObjectShapeKey(existingItem) === getObjectShapeKey(newItem);
    }
    return true;
}

async function applyAppendData() {
    const targetMode = getAppendTargetMode();
    if (!targetMode) {
        setAppendDataError("");
        setAppendDataStatus("Append works with JSON arrays or JSONL data.", true);
        setAppendDataApplyState(true, "Append works with JSON arrays or JSONL data.");
        return;
    }
    if (!appendDataState.parsedItems || appendDataState.parsedItems.length === 0) {
        setAppendDataError("No parsed items to append.");
        setAppendDataStatus("");
        setAppendDataApplyState(true, "No parsed items to append.");
        return;
    }
    if (targetMode === "jsonl" && g_jsonlLoader) {
        if (g_jsonlLoader.lines.length > 0) {
            try {
                const existingSample = JSON.parse(g_jsonlLoader.lines[0]);
                const incomingSample = appendDataState.parsedItems[0];
                if (!isCompatibleTopLevel(existingSample, incomingSample)) {
                    setAppendDataError("");
                    setAppendDataStatus("Incompatible top-level structure for JSONL append.", true);
                    setAppendDataApplyState(true, "Incompatible top-level structure for JSONL append.");
                    return;
                }
            }
            catch (error) {
                setAppendDataError("");
                setAppendDataStatus("Unable to validate JSONL structure before append.", true);
                setAppendDataApplyState(true, "Unable to validate JSONL structure before append.");
                return;
            }
        }
        const linesToAdd = appendDataState.parsedItems.map(item => {
            try {
                return JSON.stringify(item);
            }
            catch (error) {
                return null;
            }
        }).filter(line => line != null);
        if (!linesToAdd.length) {
            setAppendDataError("Unable to serialize items for JSONL append.");
            return;
        }
        g_jsonlLoader.lines.push(...linesToAdd);
        updateJsonlControls();
        updateTopLevelNavigator();
        updateDownloadButtons();
        if (appendDataState.modal) appendDataState.modal.hide();
        return;
    }
    if (targetMode === "json-array" && g_currentRootLoader) {
        const rootValue = g_currentRootLoader.getValue();
        if (!Array.isArray(rootValue)) {
            setAppendDataError("");
            setAppendDataStatus("Current data is not an array.", true);
            setAppendDataApplyState(true, "Current data is not an array.");
            return;
        }
        if (rootValue.length > 0) {
            const existingSample = rootValue[0];
            const incomingSample = appendDataState.parsedItems[0];
            if (!isCompatibleTopLevel(existingSample, incomingSample)) {
                setAppendDataError("");
                setAppendDataStatus("Incompatible top-level structure for array append.", true);
                setAppendDataApplyState(true, "Incompatible top-level structure for array append.");
                return;
            }
        }
        const expandedPaths = captureExpandedPaths();
        rootValue.push(...appendDataState.parsedItems);
        handleValueChanged(g_currentRootLoader);
        rerenderCurrentRoot({ preserveScroll: true });
        restoreExpandedPaths(expandedPaths);
        if (appendDataState.modal) appendDataState.modal.hide();
    }
}

function setPropertyEditorKeyError(message) {
    if (!propertyEditorState.keyErrorLabel) return;
    if (message) {
        propertyEditorState.keyErrorLabel.textContent = message;
        propertyEditorState.keyErrorLabel.classList.remove("d-none");
    }
    else {
        propertyEditorState.keyErrorLabel.textContent = "";
        propertyEditorState.keyErrorLabel.classList.add("d-none");
    }
}

function updatePropertyEditorKeyUI(kvRoot) {
    if (!propertyEditorState.keyDisplay) return;
    const loader = kvRoot ? kvRoot.loader : null;
    const key = loader ? loader.parentKey : null;
    const editable = g_editingEnabled && isPropertyEditorKeyEditable(loader);
    propertyEditorState.keyDisplay.textContent = formatPropertyEditorKeyLabel(key);
    propertyEditorState.keyDisplay.classList.toggle("property-editor-key-clickable", editable);
    propertyEditorState.keyDisplay.disabled = !editable;
    if (propertyEditorState.keyEditor) {
        propertyEditorState.keyEditor.classList.add("d-none");
    }
    propertyEditorState.keyDisplay.classList.remove("d-none");
    setPropertyEditorKeyError("");
}

function showPropertyEditorKeyEditor() {
    if (!propertyEditorState.keyEditor || !propertyEditorState.keyInput || !propertyEditorState.keyDisplay) return;
    const kvRoot = propertyEditorState.currentKvRoot;
    const loader = kvRoot ? kvRoot.loader : null;
    if (!g_editingEnabled || !isPropertyEditorKeyEditable(loader)) return;
    propertyEditorState.keyInput.value = loader.parentKey ?? "";
    propertyEditorState.keyEditor.classList.remove("d-none");
    propertyEditorState.keyDisplay.classList.add("d-none");
    setPropertyEditorKeyError("");
    propertyEditorState.keyInput.focus();
    propertyEditorState.keyInput.select();
}

function hidePropertyEditorKeyEditor() {
    if (propertyEditorState.keyEditor) {
        propertyEditorState.keyEditor.classList.add("d-none");
    }
    if (propertyEditorState.keyDisplay) {
        propertyEditorState.keyDisplay.classList.remove("d-none");
    }
    setPropertyEditorKeyError("");
}

function updateKvRootKeyLabel(kvRoot, key) {
    if (!kvRoot) return;
    const keyElement = kvRoot.querySelector(".json-key");
    if (keyElement) {
        keyElement.textContent = formatPropertyEditorKeyLabel(key);
    }
}

function setPropertyRenameError(message) {
    if (!propertyRenameState.errorLabel) return;
    if (message) {
        propertyRenameState.errorLabel.textContent = message;
        propertyRenameState.errorLabel.classList.remove("d-none");
    }
    else {
        propertyRenameState.errorLabel.textContent = "";
        propertyRenameState.errorLabel.classList.add("d-none");
    }
}

function openPropertyRenameEditor(kvRoot) {
    if (!propertyRenameState.modal || !propertyRenameState.input) return;
    const loader = kvRoot ? kvRoot.loader : null;
    if (!isPropertyEditorKeyEditable(loader)) return;
    propertyRenameState.currentKvRoot = kvRoot;
    propertyRenameState.input.value = loader.parentKey ?? "";
    setPropertyRenameError("");
    propertyRenameState.modal.show();
}

function applyPropertyRename() {
    const kvRoot = propertyRenameState.currentKvRoot;
    const loader = kvRoot ? kvRoot.loader : null;
    if (!propertyRenameState.input || !loader || !isPropertyEditorKeyEditable(loader)) {
        return { success: true, changed: false };
    }
    const parentValue = loader.parentLoader.getValue();
    if (!parentValue || typeof parentValue !== "object" || Array.isArray(parentValue)) {
        return { success: false, changed: false, reason: "parent-not-object" };
    }
    const oldKey = loader.parentKey;
    const newKey = propertyRenameState.input.value;
    if (newKey === oldKey) {
        return { success: true, changed: false };
    }
    if (Object.prototype.hasOwnProperty.call(parentValue, newKey)) {
        setPropertyRenameError("That property name already exists in this object.");
        return { success: false, changed: false, reason: "duplicate" };
    }
    const oldIdentifier = getBulkSelectionIdentifier(loader);
    const keys = Object.keys(parentValue);
    const nextValue = {};
    keys.forEach((key) => {
        if (key === oldKey) {
            nextValue[newKey] = parentValue[key];
        }
        else {
            nextValue[key] = parentValue[key];
        }
    });
    loader.parentLoader.value = nextValue;
    loader.parentKey = newKey;
    updateKvRootKeyLabel(kvRoot, newKey);
    if (oldIdentifier && bulkSelectionState.has(oldIdentifier)) {
        const newIdentifier = getBulkSelectionIdentifier(loader);
        const value = bulkSelectionState.get(oldIdentifier);
        bulkSelectionState.delete(oldIdentifier);
        if (newIdentifier) {
            bulkSelectionState.set(newIdentifier, loader.parentKey);
        }
    }
    handleValueChanged(loader.parentLoader);
    return { success: true, changed: true };
}

function applyPropertyEditorKeyRename(options = {}) {
    const kvRoot = propertyEditorState.currentKvRoot;
    const loader = kvRoot ? kvRoot.loader : null;
    if (!g_editingEnabled || !isPropertyEditorKeyEditable(loader)) {
        return { success: true, changed: false };
    }
    if (!propertyEditorState.keyInput) {
        return { success: true, changed: false };
    }
    const parentValue = loader.parentLoader.getValue();
    if (!parentValue || typeof parentValue !== "object" || Array.isArray(parentValue)) {
        return { success: false, changed: false, reason: "parent-not-object" };
    }
    const oldKey = loader.parentKey;
    const newKey = propertyEditorState.keyInput.value;
    if (newKey === oldKey) {
        hidePropertyEditorKeyEditor();
        return { success: true, changed: false };
    }
    if (Object.prototype.hasOwnProperty.call(parentValue, newKey)) {
        setPropertyEditorKeyError("That property name already exists in this object.");
        if (!options.silent) {
            propertyEditorState.keyInput.focus();
            propertyEditorState.keyInput.select();
        }
        return { success: false, changed: false, reason: "duplicate" };
    }
    const oldIdentifier = getBulkSelectionIdentifier(loader);
    const keys = Object.keys(parentValue);
    const nextValue = {};
    keys.forEach((key) => {
        if (key === oldKey) {
            nextValue[newKey] = parentValue[key];
        }
        else {
            nextValue[key] = parentValue[key];
        }
    });
    loader.parentLoader.value = nextValue;
    loader.parentKey = newKey;
    updateKvRootKeyLabel(kvRoot, newKey);
    updatePropertyEditorPath(loader);
    updatePropertyEditorKeyUI(kvRoot);
    if (oldIdentifier && bulkSelectionState.has(oldIdentifier)) {
        const newIdentifier = getBulkSelectionIdentifier(loader);
        const value = bulkSelectionState.get(oldIdentifier);
        bulkSelectionState.delete(oldIdentifier);
        if (newIdentifier) {
            bulkSelectionState.set(newIdentifier, loader.parentKey);
        }
    }
    handleValueChanged(loader.parentLoader);
    hidePropertyEditorKeyEditor();
    return { success: true, changed: true };
}

function refreshRenderedString(kvRoot, newValue) {
    let jsonValue = kvRoot.querySelector(".kv .kv-text .json-value");
    if (jsonValue) {
        if (searchState.highlightInfo && searchState.highlightInfo.element === jsonValue) {
            searchState.highlightInfo = null;
        }
        jsonValue.textContent = JSON.stringify(newValue);
    }
    let rawString = kvRoot.querySelector(".raw-string");
    if (rawString) {
        rawString.textContent = newValue + "\n";
    }
}

function updatePropertyEditorPath(loader) {
    if (!propertyEditorState.pathLabel) return;
    propertyEditorState.pathLabel.textContent = formatLoaderPath(loader);
}

function formatLoaderPath(loader) {
    if (!loader) return "root";
    let segments = [];
    let current = loader;
    while (current && current.parentLoader) {
        segments.unshift(current.parentKey);
        current = current.parentLoader;
    }
    return buildPathFromSegments(segments);
}

function buildPathFromSegments(segments) {
    if (!segments.length) return "root";
    let path = "root";
    for (const segment of segments) {
        if (typeof segment === "number") {
            path += `[${segment}]`;
        }
        else if (segment == null) {
            continue;
        }
        else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(segment)) {
            path += `.${segment}`;
        }
        else {
            path += `["${escapePathSegment(segment)}"]`;
        }
    }
    return path;
}

function escapePathSegment(segment) {
    let segmentStr = String(segment);
    return segmentStr.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getRootLoader(loader) {
    if (!loader) return null;
    let current = loader;
    while (current && current.parentLoader) {
        current = current.parentLoader;
    }
    return current;
}

function handleValueChanged(loader, options = {}) {
    let rootLoader = getRootLoader(loader);
    if (!rootLoader || rootLoader !== g_currentRootLoader) return;
    if (g_currentMode === "jsonl-line" && g_jsonlLoader) {
        g_jsonlLoader.updateCurrentLineText(rootLoader.getValue());
    }
    updateDownloadButtons();
    updateTopLevelNavigator();
    updateBulkControls();
    if (!options.skipSearchRefresh) {
        requestSearchRefresh();
    }
}

function updateEditingButtonVisibility(button) {
    if (!button) return;
    button.style.display = g_editingEnabled ? "" : "none";
}

function setEditingEnabled(isEnabled) {
    g_editingEnabled = isEnabled;
    document.querySelectorAll(".edit-button, .duplicate-button, .delete-button").forEach(button => {
        updateEditingButtonVisibility(button);
    });
    updateBulkControls();
}

function renderRawString(kvRoot) {
    let jsonValue = kvRoot.querySelector(".kv .kv-text .json-value");
    jsonValue.style.display = "none";

    let rawString = document.createElement("pre");
    rawString.classList.add("raw-string", "mb-1");

    // The last trailing new line is not rendered by the browser.
    // Fix it by appending an extra newline character.
    rawString.textContent = kvRoot.loader.getValue() + "\n";
    kvRoot.appendChild(rawString);
}

function cancelRawString(kvRoot) {
    let rawString = kvRoot.querySelector(".raw-string");
    kvRoot.removeChild(rawString);
    let jsonValue = kvRoot.querySelector(".kv .kv-text .json-value");
    jsonValue.style.display = "initial";
}

function renderStringify(jobj) {
    let valueSpan = document.createElement("span");
    valueSpan.classList.add("json-value");
    valueSpan.textContent = JSON.stringify(jobj);
    return valueSpan;
}

function renderString(kvRoot, jobj) {
    addViewRaw(kvRoot);
    addEditButton(kvRoot);
    return renderStringify(jobj);
}

function renderNumber(kvRoot, jobj) {
    return renderStringify(jobj);
}

function renderBool(kvRoot, jobj) {
    return renderStringify(jobj);
}

function renderNull(kvRoot, jobj) {
    return renderStringify(jobj);
}

function renderArray(kvRoot, jobj) {
    let valueSpan = document.createElement("span");
    valueSpan.classList.add("json-value");
    addEditButton(kvRoot);
    if (jobj.length == 0) {
        valueSpan.textContent = "[]";
        return valueSpan;
    }
    addCollapse(kvRoot, jobj);
    valueSpan.textContent = "[...]";
    return valueSpan;
}

function renderObject(kvRoot, jobj) {
    let valueSpan = document.createElement("span");
    valueSpan.classList.add("json-value");
    if (Object.keys(jobj).length == 0) {
        valueSpan.textContent = "{}"
        return valueSpan;
    }
    addCollapse(kvRoot, jobj);
    valueSpan.textContent = "{...}"
    return valueSpan;
}

/*************************************
 *           Data Loader             *
 *************************************/

// base class for dataloaders
// A dataloader corresponds to an array or an object,
// and is responsible to load its children.
class DataLoader {
    constructor() {
        this.value = undefined;
        this.parentLoader = null;
        this.parentKey = null;
    }

    loadString() {}
    async loadFile() {}
    loadObject(obj) {
        this.value = obj;
    }
    assignParent(parentLoader, parentKey) {
        this.parentLoader = parentLoader;
        this.parentKey = parentKey;
    }
    updateValue(newValue) {
        this.value = newValue;
        if (!this.parentLoader) return;
        if (this.parentKey === null) return;
        if (this.parentLoader.value == null || typeof this.parentLoader.value != "object") return;
        this.parentLoader.value[this.parentKey] = newValue;
    }
    getValue() {
        return this.value;
    }
    // Returns a list of (key, dataloader).
    getChild() {}
}


class WebDataLoader extends DataLoader {
    constructor() {
        super();
    }

    loadString(jsonStr) {
        console.log(jsonStr);
        try {
            this.value = JSON.parse(jsonStr);
            return { success: true };
        }
        catch (exception) {
            return { 
                success: false, 
                error: exception.message,
                type: 'JSON Parse Error',
                context: buildJsonParseErrorContext(jsonStr, exception.message)
            };
        }
    }

    async loadFile(file) {
        if (file.name.endsWith(".json") || file.name.endsWith(".geojson"))
            return this.loadString(await file.text());
        if (file.name.endsWith(".jsonl")) {
            try {
                let fileText = await file.text();
                let lines = fileText.split(/[\r\n]+/);
                this.value = lines.filter(line => line).map((line, index) => {
                    try {
                        return JSON.parse(line);
                    } catch (exception) {
                        throw new Error(`Line ${index + 1}: ${exception.message}`);
                    }
                });
                return { success: true };
            }
            catch (exception) {
                return { 
                    success: false, 
                    error: exception.message,
                    type: 'JSONL Parse Error'
                };
            }
        }
        return { 
            success: false, 
            error: `Unsupported file type: ${file.name}`,
            type: 'File Type Error'
        };
    }

    getChild() {
        if (this.value == null || typeof this.value != "object") return [];
        let ret = []
        if (Array.isArray(this.value)) {
            for (const [i, v] of this.value.entries()) {
                let childLoader = new WebDataLoader();
                childLoader.assignParent(this, i);
                childLoader.loadObject(v);
                ret.push([i, childLoader]);
            }
            return ret;
        }
        
        // Object
        for (const [k, v] of Object.entries(this.value)) {
            let childLoader = new WebDataLoader();
            childLoader.assignParent(this, k);
            childLoader.loadObject(v);
            ret.push([k, childLoader]);
        }
        return ret;
    }

    updateCurrentLineText(updatedValue) {
        if (this.currentLine == null || this.currentLine < 0 || this.currentLine >= this.lines.length) return;
        this.value = updatedValue;
        try {
            this.lines[this.currentLine] = JSON.stringify(updatedValue);
        }
        catch (error) {
            console.warn("Failed to serialize JSONL line", error);
        }
    }
}

class JsonlDataLoader extends DataLoader {
    constructor() {
        super();
        this.lines = [];
        this.currentLine = 0;
    }

    async loadFile(file) {
        if (!file.name.endsWith(".jsonl") && !file.name.endsWith(".json") && !file.name.endsWith(".geojson")) {
            return { 
                success: false, 
                error: `Expected .json .jsonl .geojson file, got: ${file.name}`,
                type: 'File Type Error'
            };
        }
        
        try {
            let fileText = await file.text();
            this.lines = fileText.split(/[\r\n]+/).filter(line => line.trim());
            if (this.lines.length === 0) {
                return { 
                    success: false, 
                    error: 'File is empty or contains no valid lines',
                    type: 'JSONL File Error'
                };
            }
            return this.loadLine(0);
        }
        catch (exception) {
            return { 
                success: false, 
                error: exception.message,
                type: 'File Read Error'
            };
        }
    }

    loadLine(lineIndex) {
        if (lineIndex < 0 || lineIndex >= this.lines.length) {
            return { 
                success: false, 
                error: `Line ${lineIndex + 1} is out of range (1-${this.lines.length})`,
                type: 'Line Index Error'
            };
        }
        
        try {
            this.currentLine = lineIndex;
            this.value = JSON.parse(this.lines[lineIndex]);
            return { success: true };
        }
        catch (exception) {
            return { 
                success: false, 
                error: `Line ${lineIndex + 1}: ${exception.message}`,
                type: 'JSON Parse Error'
            };
        }
    }

    getTotalLines() {
        return this.lines.length;
    }

    getCurrentLine() {
        return this.currentLine;
    }

    getChild() {
        if (this.value == null || typeof this.value != "object") return [];
        let ret = []
        if (Array.isArray(this.value)) {
            for (const [i, v] of this.value.entries()) {
                let childLoader = new WebDataLoader();
                childLoader.assignParent(this, i);
                childLoader.loadObject(v);
                ret.push([i, childLoader]);
            }
            return ret;
        }
        
        // Object
        for (const [k, v] of Object.entries(this.value)) {
            let childLoader = new WebDataLoader();
            childLoader.assignParent(this, k);
            childLoader.loadObject(v);
            ret.push([k, childLoader]);
        }
        return ret;
    }
}

class DesktopDataLoader extends DataLoader {

}


/*************************************
 *           File Name Display       *
 *************************************/

function updateFileNameDisplay(fileName) {
    const fileNameElement = document.querySelector("#file-name-display");
    if (fileName) {
        fileNameElement.textContent = fileName;
        fileNameElement.title = fileName; // Show full name on hover
        fileNameElement.style.display = "block";
        lastLoadedFileName = fileName;
    } else {
        fileNameElement.textContent = "No file selected";
        fileNameElement.title = "";
        fileNameElement.style.display = "none";
    }
}

function clearFileNameDisplay() {
    updateFileNameDisplay(null);
}

function normalizeFileMode(mode) {
    return mode === FILE_MODE_JSONL ? FILE_MODE_JSONL : FILE_MODE_JSON;
}

function setFileOperationMode(mode, options = {}) {
    fileOperationMode = normalizeFileMode(mode);
    if (!options.skipSync && fileModeInputs && fileModeInputs.length) {
        fileModeInputs.forEach((input) => {
            input.checked = input.value === fileOperationMode;
        });
    }
    updateFilePickerAccept();
    updateDownloadButtons();
}

function getFileOperationMode() {
    return fileOperationMode;
}

function updateFilePickerAccept() {
    if (!filePicker) return;
    filePicker.accept = fileOperationMode === FILE_MODE_JSONL
        ? ".jsonl, .ndjson, .jsonlines, .txt"
        : ".json, .geojson, .txt";
}

/*************************************
 *        Bulk Operations            *
 *************************************/

function canUseBulkOperations() {
    if (!g_currentRootLoader) return false;
    const value = g_currentRootLoader.getValue();
    if (value == null) return false;
    if (Array.isArray(value)) return true;
    return typeof value === "object";
}

function getBulkSelectionIdentifier(loader) {
    if (!loader || !g_currentRootLoader) return null;
    if (!loader.parentLoader || loader.parentLoader !== g_currentRootLoader) return null;
    const segment = loader.parentKey;
    if (typeof segment === "number") {
        return `n:${segment}`;
    }
    return `s:${String(segment)}`;
}

function isBulkItemSelected(loader) {
    const identifier = getBulkSelectionIdentifier(loader);
    if (!identifier) return false;
    return bulkSelectionState.has(identifier);
}

function handleBulkCheckboxChange(loader, isChecked) {
    const identifier = getBulkSelectionIdentifier(loader);
    if (!identifier) return;
    if (isChecked) {
        bulkSelectionState.set(identifier, loader.parentKey);
    }
    else {
        bulkSelectionState.delete(identifier);
    }
    updateBulkControls();
}

function attachBulkCheckboxIfNeeded(kvRoot, kvElement, kvTextElement) {
    if (!kvRoot || !kvElement || !kvTextElement) return;
    const loader = kvRoot.loader;
    if (!loader || !loader.parentLoader || loader.parentLoader !== g_currentRootLoader) return;
    let wrapper = kvElement.querySelector(".bulk-checkbox-wrapper");
    if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.classList.add("form-check", "bulk-checkbox-wrapper");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("form-check-input");
        checkbox.checked = isBulkItemSelected(loader);
        checkbox.addEventListener("change", () => handleBulkCheckboxChange(loader, checkbox.checked));
        wrapper.appendChild(checkbox);
        kvElement.insertBefore(wrapper, kvTextElement);
    }
    updateBulkCheckboxState(wrapper, loader);
}

function updateBulkCheckboxState(wrapper, loader) {
    if (!wrapper || !loader) return;
    const checkbox = wrapper.querySelector(".form-check-input");
    if (checkbox) {
        checkbox.checked = isBulkItemSelected(loader);
    }
}

function clearBulkSelectionState() {
    if (bulkSelectionState.size === 0) return;
    bulkSelectionState.clear();
}

function refreshBulkCheckboxesDisplay() {
    const kvRoots = document.querySelectorAll("#view .kv-root");
    kvRoots.forEach((kvRoot) => {
        const loader = kvRoot.loader;
        if (!loader || !loader.parentLoader || loader.parentLoader !== g_currentRootLoader) return;
        const kv = kvRoot.querySelector(".kv");
        const kvText = kvRoot.querySelector(".kv .kv-text");
        if (!kv || !kvText) return;
        attachBulkCheckboxIfNeeded(kvRoot, kv, kvText);
    });
}

function setBulkModeClass(enabled) {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (!body) return;
    body.classList.toggle("bulk-mode-enabled", !!enabled);
}

function pruneBulkSelectionAgainstRoot() {
    if (bulkSelectionState.size === 0) return;
    if (!g_currentRootLoader) {
        bulkSelectionState.clear();
        return;
    }
    const value = g_currentRootLoader.getValue();
    if (value == null || typeof value !== "object") {
        bulkSelectionState.clear();
        return;
    }
    if (Array.isArray(value)) {
        const length = value.length;
        for (const [identifier, segment] of bulkSelectionState.entries()) {
            const index = Number(segment);
            if (!Number.isInteger(index) || index < 0 || index >= length) {
                bulkSelectionState.delete(identifier);
            }
        }
        return;
    }
    for (const [identifier, segment] of bulkSelectionState.entries()) {
        if (!Object.prototype.hasOwnProperty.call(value, segment)) {
            bulkSelectionState.delete(identifier);
        }
    }
}

function updateBulkControls() {
    pruneBulkSelectionAgainstRoot();
    const allowed = g_editingEnabled && canUseBulkOperations();
    if (!allowed && bulkOperationsEnabled) {
        bulkOperationsEnabled = false;
        clearBulkSelectionState();
        setBulkModeClass(false);
        refreshBulkCheckboxesDisplay();
    }
    if (bulkToggleInput) {
        bulkToggleInput.disabled = !allowed;
        bulkToggleInput.checked = allowed && bulkOperationsEnabled;
    }
    if (bulkDeleteContainer) {
        bulkDeleteContainer.style.display = bulkOperationsEnabled ? "" : "none";
    }
    if (bulkDeleteButton) {
        bulkDeleteButton.disabled = !bulkOperationsEnabled || bulkSelectionState.size === 0;
    }
    if (bulkExportButton) {
        bulkExportButton.disabled = !bulkOperationsEnabled || bulkSelectionState.size === 0;
    }
    if (bulkSelectionCountLabel) {
        const count = bulkOperationsEnabled ? bulkSelectionState.size : 0;
        bulkSelectionCountLabel.textContent = String(count);
    }
}

function setBulkOperationsEnabled(enabled) {
    const nextValue = !!enabled;
    if (bulkOperationsEnabled === nextValue) return;
    if (nextValue && (!g_editingEnabled || !canUseBulkOperations())) {
        if (bulkToggleInput) {
            bulkToggleInput.checked = false;
        }
        return;
    }
    bulkOperationsEnabled = nextValue;
    if (!bulkOperationsEnabled) {
        clearBulkSelectionState();
    }
    setBulkModeClass(bulkOperationsEnabled);
    updateBulkControls();
    refreshBulkCheckboxesDisplay();
}

async function handleBulkDeleteSelected() {
    if (!bulkOperationsEnabled || bulkSelectionState.size === 0) return;
    if (!g_editingEnabled) {
        alert("Enable editing to delete items.");
        return;
    }
    if (!g_currentRootLoader) return;
    const rootValue = g_currentRootLoader.getValue();
    if (rootValue == null || typeof rootValue !== "object") {
        alert("Bulk delete requires a JSON object or array at the root level.");
        return;
    }
    const itemCount = bulkSelectionState.size;
    const confirmed = typeof window === "undefined"
        ? true
        : window.confirm(`Delete ${itemCount} selected item${itemCount === 1 ? "" : "s"}? This cannot be undone.`);
    if (!confirmed) {
        return;
    }
    const expandedPaths = captureExpandedPaths();
    if (Array.isArray(rootValue)) {
        const indexes = Array.from(bulkSelectionState.values())
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value))
            .sort((a, b) => b - a);
        indexes.forEach((index) => {
            if (index >= 0 && index < rootValue.length) {
                rootValue.splice(index, 1);
            }
        });
    }
    else {
        Array.from(bulkSelectionState.values()).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(rootValue, key)) {
                delete rootValue[key];
            }
        });
    }
    clearBulkSelectionState();
    handleValueChanged(g_currentRootLoader, { skipSearchRefresh: true });
    rerenderCurrentRoot();
    await restoreExpandedPaths(expandedPaths);
    updateBulkControls();
}

function collectBulkSelectedEntries(rootValue) {
    if (rootValue == null || typeof rootValue !== "object") return [];
    if (Array.isArray(rootValue)) {
        const selectedIndexes = new Set(
            Array.from(bulkSelectionState.values())
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value))
        );
        const entries = [];
        rootValue.forEach((value, index) => {
            if (selectedIndexes.has(index)) {
                entries.push({ key: index, value });
            }
        });
        return entries;
    }
    const selectedKeys = new Set(
        Array.from(bulkSelectionState.values())
            .map((value) => (value == null ? null : value.toString()))
            .filter((value) => typeof value === "string")
    );
    const entries = [];
    Object.keys(rootValue).forEach((key) => {
        if (selectedKeys.has(key)) {
            entries.push({ key, value: rootValue[key] });
        }
    });
    return entries;
}

function buildBulkExportJson(entries, isArrayRoot) {
    if (!entries || entries.length === 0) return null;
    if (isArrayRoot) {
        const payload = entries.map(({ value }) => cloneJsonValue(value));
        return JSON.stringify(payload, null, 2);
    }
    const payload = {};
    entries.forEach(({ key, value }) => {
        payload[key] = cloneJsonValue(value);
    });
    return JSON.stringify(payload, null, 2);
}

function buildBulkExportJsonl(entries, isArrayRoot) {
    if (!entries || entries.length === 0) return null;
    const lines = entries.map(({ key, value }) => {
        if (isArrayRoot) {
            return JSON.stringify(cloneJsonValue(value));
        }
        const wrapper = {};
        wrapper[key] = cloneJsonValue(value);
        return JSON.stringify(wrapper);
    });
    return lines.join("\n");
}

async function handleBulkExportSelected() {
    if (!bulkOperationsEnabled) return;
    pruneBulkSelectionAgainstRoot();
    if (bulkSelectionState.size === 0) {
        updateBulkControls();
        alert("Select at least one item to export.");
        return;
    }
    if (!g_currentRootLoader) return;
    const rootValue = g_currentRootLoader.getValue();
    if (rootValue == null || typeof rootValue !== "object") {
        alert("Bulk export requires a JSON object or array at the root level.");
        return;
    }
    const entries = collectBulkSelectedEntries(rootValue);
    if (entries.length === 0) {
        updateBulkControls();
        alert("Selected items are no longer available.");
        return;
    }
    const format = getFileOperationMode();
    const isArrayRoot = Array.isArray(rootValue);
    const payload = format === FILE_MODE_JSONL
        ? buildBulkExportJsonl(entries, isArrayRoot)
        : buildBulkExportJson(entries, isArrayRoot);
    if (!payload) {
        alert("Nothing to export.");
        return;
    }
    const suggestedName = getBulkExportSuggestedName(format);
    const fileName = promptFileName(format, { suggestedName, persist: false });
    if (!fileName) return;
    if (typeof window !== "undefined" && window.__TAURI__) {
        await saveWithTauri(payload, fileName, format);
    }
    else {
        const mimeType = format === FILE_MODE_JSONL ? "application/jsonl" : "application/json";
        triggerDownload(payload, fileName, mimeType);
    }
}

function initializeTooltips() {
    if (typeof document === "undefined" || typeof bootstrap === "undefined") return;
    const tooltipElements = Array.from(document.querySelectorAll("[data-bs-toggle='tooltip']"));
    tooltipElements.forEach((element) => {
        bootstrap.Tooltip.getOrCreateInstance(element);
    });
}

function applyTheme(theme) {
    const body = typeof document !== "undefined" ? document.body : null;
    if (!body) return;
    body.classList.toggle("theme-dark", theme === THEME_DARK);
}

function setTheme(theme, options = {}) {
    const normalized = theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;
    currentTheme = normalized;
    applyTheme(normalized);
    if (!options.skipToggleSync && themeToggleInput) {
        themeToggleInput.checked = normalized === THEME_DARK;
    }
    if (!options.skipStorage) {
        const storage = getLocalStorageSafe();
        if (storage) {
            storage.setItem(THEME_STORAGE_KEY, normalized);
        }
    }
}

function getStoredThemePreference() {
    const storage = getLocalStorageSafe();
    if (!storage) return null;
    const stored = storage.getItem(THEME_STORAGE_KEY);
    if (stored === THEME_DARK || stored === THEME_LIGHT) {
        return stored;
    }
    return null;
}

function initThemeFromPreference() {
    let preference = getStoredThemePreference();
    if (!preference) {
        const prefersDark = typeof window !== "undefined"
            && typeof window.matchMedia === "function"
            && window.matchMedia("(prefers-color-scheme: dark)").matches;
        preference = prefersDark ? THEME_DARK : THEME_LIGHT;
    }
    setTheme(preference, { skipStorage: true });
}

/*************************************
 *           Controls                *
 *************************************/

let g_platform = "web";
if (typeof window !== "undefined" && window.__TAURI__) {
    g_platform = "desktop";
}
let g_jsonlLoader = null; // Global JSONL loader for line navigation
let g_currentRootLoader = null;
let g_currentMode = null;
let g_editingEnabled = true;
const FILE_MODE_JSON = "json";
const FILE_MODE_JSONL = "jsonl";
let fileOperationMode = FILE_MODE_JSON;
let downloadDataButton = null;
let filePicker = null;
let fileModeInputs = [];
let lastLoadedFileName = "";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const THEME_STORAGE_KEY = "jsonlight.themePreference";
const BULK_MODE_CLASS = "bulk-mode-enabled";
let currentTheme = THEME_LIGHT;
let themeToggleInput = null;
let bulkOperationsEnabled = false;
const bulkSelectionState = new Map();
let bulkToggleInput = null;
let bulkDeleteButton = null;
let bulkExportButton = null;
let bulkDeleteContainer = null;
let bulkSelectionCountLabel = null;
let expandCollapseToggleButton = null;
let expandCollapseToggleState = "collapsed";
let pasteAreaRenderTimeoutId = null;
let pasteAreaSkipNextInputDebounce = false;

updateTopLevelNavigator();

function rerenderCurrentRoot(options = {}) {
    if (!g_currentRootLoader) return;
    const view = document.querySelector("#view");
    const preserveScroll = !!options.preserveScroll;
    const scrollSnapshot = (view && preserveScroll)
        ? { left: view.scrollLeft, top: view.scrollTop }
        : null;
    if (view) {
        view.replaceChildren();
    }
    renderJSON(g_currentRootLoader);
    if (view && scrollSnapshot) {
        view.scrollTo(scrollSnapshot.left, scrollSnapshot.top);
    }
}

function cloneJsonValue(value) {
    if (typeof structuredClone === "function") {
        try {
            return structuredClone(value);
        }
        catch (error) {
            console.warn("structuredClone failed, falling back to JSON clone", error);
        }
    }
    try {
        return JSON.parse(JSON.stringify(value));
    }
    catch (error) {
        console.warn("Failed to clone value", error);
        return value;
    }
}

function confirmNodeAction(action) {
    if (typeof window === "undefined" || typeof window.confirm !== "function") return true;
    const actionVerb = action === "delete" ? "delete" : "duplicate";
    return window.confirm(`Are you sure you want to ${actionVerb} this item?`);
}

function deleteLoaderChild(loader) {
    if (!loader || !loader.parentLoader) return { success: false };
    const parent = loader.parentLoader;
    const parentValue = parent.getValue();
    const parentPath = getLoaderPathSegments(parent);
    if (Array.isArray(parentValue)) {
        const index = Number(loader.parentKey);
        if (!Number.isInteger(index)) return { success: false };
        parentValue.splice(index, 1);
        let focusPath = null;
        if (parentValue.length > 0) {
            let focusIndex = index - 1;
            if (focusIndex < 0) {
                focusIndex = 0;
            }
            if (focusIndex >= parentValue.length) {
                focusIndex = parentValue.length - 1;
            }
            if (focusIndex >= 0) {
                focusPath = [...parentPath, focusIndex];
            }
        }
        else {
            focusPath = parentPath;
        }
        return { success: true, focusPath };
    }
    if (parentValue && typeof parentValue === "object") {
        if (!Object.prototype.hasOwnProperty.call(parentValue, loader.parentKey)) {
            return { success: false };
        }
        const keysBefore = Object.keys(parentValue);
        const currentIndex = keysBefore.indexOf(loader.parentKey);
        delete parentValue[loader.parentKey];
        const remainingKeys = keysBefore.filter((key) => key !== loader.parentKey);
        let focusPath = parentPath;
        if (remainingKeys.length > 0) {
            let focusKey = null;
            if (currentIndex > 0) {
                focusKey = keysBefore[currentIndex - 1];
            }
            else {
                focusKey = remainingKeys[0];
            }
            if (focusKey != null) {
                focusPath = [...parentPath, focusKey];
            }
        }
        return { success: true, focusPath };
    }
    return { success: false };
}

function duplicateLoaderChild(loader) {
    if (!loader || !loader.parentLoader) return { success: false };
    const parent = loader.parentLoader;
    const parentValue = parent.getValue();
    const parentPath = getLoaderPathSegments(parent);
    const clone = cloneJsonValue(loader.getValue());
    if (Array.isArray(parentValue)) {
        const index = Number(loader.parentKey);
        if (!Number.isInteger(index)) return { success: false };
        const newIndex = index + 1;
        parentValue.splice(newIndex, 0, clone);
        return { success: true, newPath: [...parentPath, newIndex] };
    }
    if (parentValue && typeof parentValue === "object") {
        const baseKey = loader.parentKey != null ? loader.parentKey.toString() : "copy";
        let candidate = `${baseKey}_copy`;
        let counter = 1;
        while (Object.prototype.hasOwnProperty.call(parentValue, candidate)) {
            counter += 1;
            candidate = `${baseKey}_copy${counter}`;
        }
        parentValue[candidate] = clone;
        return { success: true, newPath: [...parentPath, candidate] };
    }
    return { success: false };
}

async function handleDeleteNode(kvRoot) {
    if (!g_editingEnabled || !kvRoot || !kvRoot.loader) return;
    const loader = kvRoot.loader;
    if (!loader.parentLoader) {
        alert("Cannot delete the root item.");
        return;
    }
    if (!confirmNodeAction("delete")) {
        return;
    }
    const parentLoader = loader.parentLoader;
    const expandedPaths = captureExpandedPaths();
    const result = deleteLoaderChild(loader);
    if (!result.success) {
        alert("Unable to delete this item.");
        return;
    }
    handleValueChanged(parentLoader, { skipSearchRefresh: true });
    rerenderCurrentRoot();
    await restoreExpandedPaths(expandedPaths);
    if (result.focusPath) {
        await focusPathSegments(result.focusPath, true);
    }
}

async function handleDuplicateNode(kvRoot) {
    if (!g_editingEnabled || !kvRoot || !kvRoot.loader) return;
    const loader = kvRoot.loader;
    if (!loader.parentLoader) {
        alert("Cannot duplicate the root item.");
        return;
    }
    if (!confirmNodeAction("duplicate")) {
        return;
    }
    const parentLoader = loader.parentLoader;
    const parentPathSegments = getLoaderPathSegments(parentLoader);
    const parentValue = parentLoader.getValue();
    const scopedExpandedPaths = captureExpandedPaths(parentLoader);
    const result = duplicateLoaderChild(loader);
    if (!result.success) {
        alert("Unable to duplicate this item.");
        return;
    }
    let expandedPathsForRestore = scopedExpandedPaths;
    if (Array.isArray(parentValue) && Array.isArray(result.newPath)) {
        const childSegmentIndex = parentPathSegments.length;
        const insertedIndex = childSegmentIndex < result.newPath.length
            ? result.newPath[childSegmentIndex]
            : null;
        if (Number.isInteger(insertedIndex)) {
            expandedPathsForRestore = adjustExpandedPathsForArrayInsertion(
                scopedExpandedPaths,
                parentPathSegments,
                insertedIndex
            );
        }
    }
    handleValueChanged(parentLoader, { skipSearchRefresh: true });
    await refreshChildListForLoader(parentLoader, { preserveScroll: true });
    await restoreExpandedPaths(expandedPathsForRestore);
    if (result.newPath) {
        await focusPathSegments(result.newPath, true);
    }
}

function setCurrentRootLoader(loader, mode) {
    g_currentRootLoader = loader;
    g_currentMode = mode;
    resetTopLevelPaginationState();
    clearBulkSelectionState();
    updateBulkControls();
    updateDownloadButtons();
    updateTopLevelNavigator();
}

function clearCurrentRootLoader() {
    setCurrentRootLoader(null, null);
    setExpandCollapseToggleState(false);
}

function updateDownloadButtons() {
    if (!downloadDataButton) return;
    const mode = getFileOperationMode();
    const isJsonMode = mode === FILE_MODE_JSON;
    downloadDataButton.disabled = isJsonMode ? !g_currentRootLoader : !g_jsonlLoader;
    downloadDataButton.textContent = isJsonMode ? "Save JSON" : "Save JSONL";
    downloadDataButton.title = isJsonMode
        ? "Download the current view as JSON"
        : "Download the current data as JSON Lines";
}

function getJsonText() {
    if (!g_currentRootLoader) return null;
    let value = g_currentRootLoader.getValue();
    if (typeof value === "undefined") return null;
    return JSON.stringify(value, null, 2);
}

function getJsonlText() {
    if (!g_jsonlLoader || !g_jsonlLoader.lines || g_jsonlLoader.lines.length === 0) return null;
    return g_jsonlLoader.lines.join("\n");
}

function promptFileName(format, options = {}) {
    const suggestedName = ensureFileExtension(
        options.suggestedName || getSuggestedFileName(format),
        format
    );
    const shouldPersist = options.persist !== false;
    if (typeof window === "undefined" || typeof window.prompt !== "function") {
        if (shouldPersist) {
            lastLoadedFileName = suggestedName;
        }
        return suggestedName;
    }
    let userInput = window.prompt("Enter file name", suggestedName);
    if (userInput == null) return null;
    let trimmed = userInput.trim();
    if (!trimmed) {
        trimmed = suggestedName;
    }
    trimmed = ensureFileExtension(trimmed, format);
    if (shouldPersist) {
        lastLoadedFileName = trimmed;
    }
    return trimmed;
}

function getSuggestedFileName(format) {
    const extension = format === "jsonl" ? ".jsonl" : ".json";
    const defaultBase = "data";
    if (lastLoadedFileName) {
        const cleaned = lastLoadedFileName.trim();
        if (cleaned) {
            const base = cleaned.replace(/\.[^./\\]+$/, "") || cleaned;
            return `${base}${extension}`;
        }
    }
    return `${defaultBase}${extension}`;
}

function ensureFileExtension(fileName, format) {
    const extension = format === "jsonl" ? ".jsonl" : ".json";
    const cleaned = fileName.trim();
    if (!cleaned.toLowerCase().endsWith(extension)) {
        const base = cleaned.replace(/\.[^./\\]+$/, "") || cleaned;
        return `${base}${extension}`;
    }
    return cleaned;
}

function getBulkExportSuggestedName(format) {
    const baseWithExtension = getSuggestedFileName(format);
    const base = baseWithExtension.replace(/\.[^./\\]+$/, "") || "data";
    return ensureFileExtension(`${base}-selection`, format);
}

async function handleSaveRequest(format) {
    let content = format === "jsonl" ? getJsonlText() : getJsonText();
    if (!content) {
        alert("No data available to save yet.");
        return;
    }
    let chosenName = promptFileName(format);
    if (!chosenName) return;
    if (typeof window !== "undefined" && window.__TAURI__) {
        await saveWithTauri(content, chosenName, format);
    }
    else {
        let mimeType = format === "jsonl" ? "application/jsonl" : "application/json";
        triggerDownload(content, chosenName, mimeType);
    }
}

async function saveWithTauri(content, defaultName, format) {
    try {
        const [{ save }, { writeTextFile }] = await Promise.all([
            import("https://cdn.jsdelivr.net/npm/@tauri-apps/api@2/dialog"),
            import("https://cdn.jsdelivr.net/npm/@tauri-apps/api@2/fs")
        ]);
        const filePath = await save({
            defaultPath: defaultName,
            filters: [{ name: format.toUpperCase(), extensions: [format] }]
        });
        if (filePath) {
            await writeTextFile(filePath, content);
        }
    }
    catch (error) {
        console.error("Failed to save file", error);
        alert("Unable to save file: " + error.message);
    }
}

function triggerDownload(content, filename, mimeType) {
    let blob = new Blob([content], { type: mimeType });
    let url = URL.createObjectURL(blob);
    let anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

function newDataLoader() {
    if (g_platform == "web") {
        return new WebDataLoader();
    }
    else {
        return new DesktopDataLoader();
    }
}

function renderJSON(loader) {
    let rootJson = renderKV(null, loader);
    document.querySelector("#view").appendChild(rootJson);
    initializeTopLevelPagination(rootJson);
    let rootButton = rootJson.querySelector(".collapse-button");
    if (rootButton) {
        rootButton.style.display = "none";
        rootButton.click();
    }
    requestSearchRefresh();
    setExpandCollapseToggleState(false);
}
function tryExtractJsonErrorPosition(message, sourceText) {
    if (!message) return null;
    const positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch && positionMatch[1]) {
        const position = Number.parseInt(positionMatch[1], 10);
        if (Number.isFinite(position)) {
            return position;
        }
    }
    const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (lineColumnMatch && sourceText) {
        const line = Number.parseInt(lineColumnMatch[1], 10);
        const column = Number.parseInt(lineColumnMatch[2], 10);
        if (Number.isFinite(line) && Number.isFinite(column)) {
            return getOffsetForLineAndColumn(sourceText, line, column);
        }
    }
    return null;
}

function getOffsetForLineAndColumn(text, targetLine, targetColumn) {
    if (!text) return 0;
    let line = 1;
    let column = 1;
    const desiredLine = Math.max(1, Number(targetLine) || 1);
    const desiredColumn = Math.max(1, Number(targetColumn) || 1);
    for (let i = 0; i < text.length; i++) {
        if (line === desiredLine && column === desiredColumn) {
            return i;
        }
        if (text[i] === "\n") {
            line += 1;
            column = 1;
        }
        else {
            column += 1;
        }
    }
    return text.length;
}

function buildJsonParseErrorContext(sourceText, errorMessage, radius = JSON_PARSE_CONTEXT_RADIUS) {
    if (!sourceText || !errorMessage) return null;
    const position = tryExtractJsonErrorPosition(errorMessage, sourceText);
    if (position == null) return null;
    const normalizedPosition = Math.min(Math.max(position, 0), sourceText.length);
    const start = Math.max(0, normalizedPosition - radius);
    const end = Math.min(sourceText.length, normalizedPosition + radius);
    const excerpt = sourceText.slice(start, end);
    const relativeIndex = normalizedPosition - start;
    const highlightStart = Math.min(Math.max(relativeIndex, 0), excerpt.length);
    const highlightEnd = relativeIndex < excerpt.length
        ? Math.min(highlightStart + 1, excerpt.length)
        : highlightStart;
    const { line, column } = getLineAndColumnForOffset(sourceText, normalizedPosition);
    return {
        excerpt,
        highlightStart,
        highlightEnd,
        absolutePosition: position,
        line,
        column,
        clippedPrefix: start > 0,
        clippedSuffix: end < sourceText.length,
        virtualHighlight: relativeIndex >= excerpt.length
    };
}

function displayParseError(errorInfo) {
    let errorContainer = document.createElement("div");
    errorContainer.classList.add("alert", "alert-danger", "m-3");
    
    let errorTitle = document.createElement("h5");
    errorTitle.classList.add("alert-heading");
    errorTitle.innerText = errorInfo?.type || "Error";
    errorContainer.appendChild(errorTitle);
    
    let errorMessage = document.createElement("p");
    errorMessage.classList.add("mb-0");
    errorMessage.innerText = errorInfo?.error || "An unknown error occurred";
    errorContainer.appendChild(errorMessage);

    if (errorInfo?.context && errorInfo.context.excerpt) {
        const context = errorInfo.context;
        const meta = document.createElement("p");
        meta.classList.add("mb-1", "mt-2", "small", "text-muted");
        meta.textContent = `Around position ${context.absolutePosition} (Ln ${context.line}, Col ${context.column})`;
        errorContainer.appendChild(meta);

        const snippet = document.createElement("pre");
        snippet.classList.add("error-context-snippet", "p-2", "bg-light", "border", "rounded");
        const before = context.excerpt.slice(0, context.highlightStart);
        const highlight = context.excerpt.slice(context.highlightStart, context.highlightEnd);
        const after = context.excerpt.slice(context.highlightEnd);
        const prefix = context.clippedPrefix ? "&hellip;" : "";
        const suffix = context.clippedSuffix ? "&hellip;" : "";
        const highlightedText = highlight || (context.virtualHighlight ? "[EOF]" : "");
        snippet.innerHTML = `${prefix}${escapeHtml(before)}<mark class="error-highlight">${escapeHtml(highlightedText)}</mark>${escapeHtml(after)}${suffix}`;
        errorContainer.appendChild(snippet);
    }
    
    document.querySelector("#view").appendChild(errorContainer);
    requestSearchRefresh();
}

function renderFromPasteAreaValue() {
    if (!pasteArea) return;
    hideJsonlControls();
    clearFileNameDisplay();
    renderJsonStr(pasteArea.value);
}

function schedulePasteAreaRender(delayMs) {
    if (!pasteArea) return;
    if (pasteAreaRenderTimeoutId) {
        clearTimeout(pasteAreaRenderTimeoutId);
    }
    const delay = typeof delayMs === "number" ? Math.max(0, delayMs) : PASTE_AREA_EDIT_DEBOUNCE_MS;
    pasteAreaRenderTimeoutId = setTimeout(() => {
        pasteAreaRenderTimeoutId = null;
        renderFromPasteAreaValue();
    }, delay);
}

function renderJsonStr(jsonStr) {
    document.querySelector("#view").replaceChildren();

    let loader = newDataLoader();
    let result = loader.loadString(jsonStr);
    if (!result.success) {
        clearCurrentRootLoader();
        displayParseError(result);
        return;
    }
    setCurrentRootLoader(loader, "json");
    renderJSON(loader);
}

async function renderJsonFile(file) {
    hideJsonlControls();
    document.querySelector("#view").replaceChildren();

    let loader = newDataLoader();
    let result = await loader.loadFile(file);
    if (!result.success) {
        clearCurrentRootLoader();
        displayParseError(result);
        return;
    }
    setCurrentRootLoader(loader, "json");
    renderJSON(loader);
}

async function renderJsonlFile(file) {
    document.querySelector("#view").replaceChildren();

    const loader = new JsonlDataLoader();
    let result = await loader.loadFile(file);
    if (!result.success) {
        hideJsonlControls();
        clearCurrentRootLoader();
        displayParseError(result);
        return;
    }
    g_jsonlLoader = loader;
    updateTopLevelNavigator();
    
    // Show JSONL controls
    showJsonlControls();
    updateJsonlControls();
    renderCurrentJsonlLine();
    updateDownloadButtons();
}

function showJsonlControls() {
    document.querySelector("#jsonl-controls").style.display = "block";
}

function hideJsonlControls() {
    document.querySelector("#jsonl-controls").style.display = "none";
    g_jsonlLoader = null;
    updateDownloadButtons();
    updateTopLevelNavigator();
}

function updateJsonlControls() {
    if (!g_jsonlLoader) return;
    
    const totalLines = g_jsonlLoader.getTotalLines();
    const currentLine = g_jsonlLoader.getCurrentLine() + 1; // 1-indexed for display
    
    document.querySelector("#total-lines").textContent = `/ ${totalLines}`;
    document.querySelector("#line-input").value = currentLine;
    document.querySelector("#line-input").max = totalLines;
    
    // Update button states
    document.querySelector("#prev-line").disabled = currentLine <= 1;
    document.querySelector("#next-line").disabled = currentLine >= totalLines;
}

function renderCurrentJsonlLine() {
    if (!g_jsonlLoader) return;
    
    document.querySelector("#view").replaceChildren();
    
    // Create a temporary loader with the current line's data
    let loader = new WebDataLoader();
    loader.loadObject(g_jsonlLoader.getValue());
    setCurrentRootLoader(loader, "jsonl-line");
    renderJSON(loader);
}

function navigateToLine(lineNumber) {
    if (!g_jsonlLoader) return;
    
    const lineIndex = lineNumber - 1; // Convert to 0-indexed
    let result = g_jsonlLoader.loadLine(lineIndex);
    if (result.success) {
        updateJsonlControls();
        renderCurrentJsonlLine();
    } else {
        // Display error in a temporary alert
        let errorAlert = document.createElement("div");
        errorAlert.classList.add("alert", "alert-warning", "alert-dismissible", "fade", "show", "m-2");
        errorAlert.innerHTML = `
            <strong>Navigation Error:</strong> ${result.error}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector("#view").insertBefore(errorAlert, document.querySelector("#view").firstChild);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.parentNode.removeChild(errorAlert);
            }
        }, 3000);
        
        // Reset input to current line
        updateJsonlControls();
    }
}

let pasteArea = document.querySelector("#paste");
if (pasteArea) {
    pasteArea.addEventListener("paste", () => {
        pasteAreaSkipNextInputDebounce = true;
        schedulePasteAreaRender(PASTE_AREA_PASTE_DELAY_MS);
    });
    pasteArea.addEventListener("input", () => {
        if (pasteAreaSkipNextInputDebounce) {
            pasteAreaSkipNextInputDebounce = false;
            return;
        }
        schedulePasteAreaRender(PASTE_AREA_EDIT_DEBOUNCE_MS);
    });
    pasteArea.addEventListener("change", () => {
        schedulePasteAreaRender(0);
    });
    if (pasteArea.value && pasteArea.value.trim() !== "") {
        schedulePasteAreaRender(0);
    }
}

const pasteToggleButton = document.querySelector("#paste-toggle-button");
const pasteCollapse = document.querySelector("#paste-collapse");
if (pasteToggleButton && pasteCollapse) {
    pasteCollapse.addEventListener("show.bs.collapse", () => {
        pasteToggleButton.textContent = "-";
    });
    pasteCollapse.addEventListener("hide.bs.collapse", () => {
        pasteToggleButton.textContent = "+";
    });
    if (!pasteCollapse.classList.contains("show")) {
        pasteToggleButton.textContent = "+";
    }
}

fileModeInputs = Array.from(document.querySelectorAll("input[name='file-mode']"));
fileModeInputs.forEach((input) => {
    input.addEventListener("change", () => {
        if (input.checked) {
            setFileOperationMode(input.value);
        }
    });
});

filePicker = document.querySelector("#filepicker");
if (filePicker) {
    filePicker.addEventListener("change", () => {
        const files = filePicker.files;
        if (!files || !files[0]) {
            clearFileNameDisplay();
            return;
        }
        const file = files[0];
        updateFileNameDisplay(file.name);
        if (getFileOperationMode() === FILE_MODE_JSONL) {
            renderJsonlFile(file);
        }
        else {
            renderJsonFile(file);
        }
    });
}

if (appendDataState.openButton) {
    appendDataState.openButton.addEventListener("click", () => {
        resetAppendDataDialog();
        const targetMode = getAppendTargetMode();
        if (!targetMode) {
            setAppendDataError("Append works with JSON arrays or JSONL data.");
        }
        if (appendDataState.modal) {
            appendDataState.modal.show();
        }
    });
}

if (appendDataState.fileInput) {
    appendDataState.fileInput.addEventListener("change", async () => {
        const files = appendDataState.fileInput.files;
        if (!files || !files[0]) return;
        const file = files[0];
        const text = await file.text();
        if (appendDataState.textArea) {
            appendDataState.textArea.value = text;
        }
        const hint = file.name.endsWith(".jsonl") || file.name.endsWith(".ndjson") || file.name.endsWith(".jsonlines")
            ? "jsonl"
            : "json";
        scheduleAppendDataParse(hint);
    });
}

if (appendDataState.textArea) {
    appendDataState.textArea.addEventListener("input", () => {
        scheduleAppendDataParse();
    });
}

if (appendDataState.applyButton) {
    appendDataState.applyButton.addEventListener("click", () => {
        applyAppendData();
    });
}

themeToggleInput = document.querySelector("#theme-toggle");
initThemeFromPreference();
if (themeToggleInput) {
    themeToggleInput.addEventListener("change", () => {
        setTheme(themeToggleInput.checked ? THEME_DARK : THEME_LIGHT);
    });
}

initializeTooltips();

// JSONL navigation controls
let prevButton = document.querySelector("#prev-line");
prevButton.addEventListener("click", (ev) => {
    if (g_jsonlLoader) {
        const currentLine = g_jsonlLoader.getCurrentLine() + 1;
        if (currentLine > 1) {
            navigateToLine(currentLine - 1);
        }
    }
});

let nextButton = document.querySelector("#next-line");
nextButton.addEventListener("click", (ev) => {
    if (g_jsonlLoader) {
        const currentLine = g_jsonlLoader.getCurrentLine() + 1;
        const totalLines = g_jsonlLoader.getTotalLines();
        if (currentLine < totalLines) {
            navigateToLine(currentLine + 1);
        }
    }
});

let lineInput = document.querySelector("#line-input");
lineInput.addEventListener("change", (ev) => {
    if (g_jsonlLoader) {
        const lineNumber = parseInt(lineInput.value);
        const totalLines = g_jsonlLoader.getTotalLines();
        if (lineNumber >= 1 && lineNumber <= totalLines) {
            navigateToLine(lineNumber);
        } else {
            // Reset to current line if invalid input
            updateJsonlControls();
        }
    }
});

lineInput.addEventListener("keypress", (ev) => {
    if (ev.key === "Enter") {
        ev.target.blur(); // Trigger change event
    }
});

// Expand/Collapse toggle functionality
expandCollapseToggleButton = document.querySelector("#expand-collapse-toggle");
if (expandCollapseToggleButton) {
    setExpandCollapseToggleState(false);
    expandCollapseToggleButton.addEventListener("click", async () => {
        const shouldExpand = expandCollapseToggleState !== "expanded";
        expandCollapseToggleButton.disabled = true;
        try {
            if (shouldExpand) {
                const expanded = await expandAll();
                setExpandCollapseToggleState(expanded ? true : false);
            }
            else {
                collapseAll();
                setExpandCollapseToggleState(false);
            }
        }
        finally {
            expandCollapseToggleButton.disabled = false;
        }
    });
}

async function expandAll() {
    const root = document.querySelector("#view .kv-root");
    if (!root) return false;
    const queue = [root];
    let processed = 0;
    const yieldInterval = 40;
    while (queue.length > 0) {
        const current = queue.shift();
        const children = expandKvRootImmediate(current);
        if (children.length > 0) {
            queue.push(...children);
        }
        processed += 1;
        if (processed % yieldInterval === 0) {
            await yieldToEventLoop();
        }
    }
    return true;
}

function expandKvRootImmediate(kvRoot) {
    if (!kvRoot) return [];
    const collapseWrapper = kvRoot.querySelector(".collapse");
    if (!collapseWrapper) return [];
    const childList = collapseWrapper.querySelector(".child-list");
    if (!childList) return [];
    if (!collapseWrapper.classList.contains("show")) {
        populateCollapseChildren(kvRoot, childList);
        collapseWrapper.classList.add("show");
        collapseWrapper.style.height = "";
        const collapseButton = kvRoot.querySelector(".collapse-button");
        if (collapseButton) {
            collapseButton.innerHTML = "-";
            collapseButton.setAttribute("aria-expanded", "true");
        }
    }
    return Array.from(childList.children).filter((child) => child.classList && child.classList.contains("kv-root"));
}

function yieldToEventLoop() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

function collapseAll() {
    const allWrappers = document.querySelectorAll("#view .kv-root .collapse.show");
    allWrappers.forEach((collapseWrapper) => {
        const kvRoot = collapseWrapper.closest(".kv-root");
        if (!kvRoot) return;
        const collapseButton = kvRoot.querySelector(".collapse-button");
        const isRootLevel = collapseButton && collapseButton.style.display === "none";
        if (isRootLevel) {
            return;
        }
        collapseWrapper.classList.remove("show");
        collapseWrapper.style.height = "";
        const childList = collapseWrapper.querySelector(".child-list");
        if (childList) {
            childList.replaceChildren();
        }
        if (collapseButton) {
            collapseButton.innerHTML = "+";
            collapseButton.setAttribute("aria-expanded", "false");
        }
    });
}

function setExpandCollapseToggleState(isExpanded) {
    expandCollapseToggleState = isExpanded ? "expanded" : "collapsed";
    if (!expandCollapseToggleButton) return;
    expandCollapseToggleButton.dataset.state = expandCollapseToggleState;
    expandCollapseToggleButton.textContent = isExpanded ? "Collapse All" : "Expand All";
    expandCollapseToggleButton.classList.toggle("btn-outline-primary", !isExpanded);
    expandCollapseToggleButton.classList.toggle("btn-outline-secondary", isExpanded);
    expandCollapseToggleButton.setAttribute("aria-pressed", isExpanded ? "true" : "false");
}

let editingToggle = document.querySelector("#toggle-editing");
if (editingToggle) {
    editingToggle.checked = g_editingEnabled;
    editingToggle.addEventListener("change", () => {
        setEditingEnabled(editingToggle.checked);
    });
}

bulkToggleInput = document.querySelector("#toggle-bulk-operations");
bulkDeleteButton = document.querySelector("#bulk-delete-selected");
bulkExportButton = document.querySelector("#bulk-export-selected");
bulkDeleteContainer = document.querySelector("#bulk-operations-actions");
bulkSelectionCountLabel = document.querySelector("#bulk-selection-count");
if (bulkToggleInput) {
    bulkToggleInput.checked = bulkOperationsEnabled;
    bulkToggleInput.addEventListener("change", () => {
        setBulkOperationsEnabled(bulkToggleInput.checked);
    });
}
if (bulkDeleteButton) {
    bulkDeleteButton.addEventListener("click", () => {
        handleBulkDeleteSelected();
    });
}
if (bulkExportButton) {
    bulkExportButton.addEventListener("click", () => {
        handleBulkExportSelected();
    });
}
updateBulkControls();

downloadDataButton = document.querySelector("#download-data");
if (downloadDataButton) {
    downloadDataButton.addEventListener("click", () => handleSaveRequest(getFileOperationMode()));
}
const initialModeInput = fileModeInputs.find((input) => input.checked);
const preferredInitialMode = initialModeInput ? initialModeInput.value : FILE_MODE_JSON;
if (fileOperationMode === FILE_MODE_JSON) {
    setFileOperationMode(preferredInitialMode, { skipSync: true });
}
else {
    setFileOperationMode(fileOperationMode);
}

if (searchRegexToggle) {
    searchState.isRegex = searchRegexToggle.checked;
    searchRegexToggle.addEventListener("change", () => {
        searchState.isRegex = searchRegexToggle.checked;
        performSearch();
    });
}
else {
    searchState.isRegex = false;
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        requestSearchRefresh();
        queueSearchHistoryCommit();
    });
    searchInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            commitSearchHistory();
            moveSearch(ev.shiftKey ? -1 : 1);
        }
    });
    searchInput.addEventListener("blur", () => commitSearchHistory());
}

if (searchPrevButton) {
    searchPrevButton.addEventListener("click", () => moveSearch(-1));
}
if (searchNextButton) {
    searchNextButton.addEventListener("click", () => moveSearch(1));
}
updateSearchControls();

if (replaceAllButton) {
    replaceAllButton.addEventListener("click", () => {
        replaceAllMatches();
    });
}
if (replaceButton) {
    replaceButton.addEventListener("click", () => {
        replaceCurrentMatch(true);
    });
}

// Handle "open with" functionality from Tauri
async function handleOpenWithFile(filePath, mode) {
    try {
        console.log(`Opening file: ${filePath} in ${mode} mode`);
        
        // Use Tauri's fs API to read the file
        if (window.__TAURI__) {
            const { readTextFile } = await import('https://cdn.jsdelivr.net/npm/@tauri-apps/api@2/fs');
            const fileContent = await readTextFile(filePath);
            const fileName = filePath.split(/[\\/]/).pop(); // Extract filename from path
            
            // Update file name display
            updateFileNameDisplay(fileName);
            setFileOperationMode(mode === "jsonl" ? FILE_MODE_JSONL : FILE_MODE_JSON);
            
            if (mode === 'jsonl') {
                // Create a temporary blob to simulate a file for JSONL processing
                const blob = new Blob([fileContent], { type: 'text/plain' });
                const file = new File([blob], fileName, { type: 'text/plain' });
                await renderJsonlFile(file);
            } else {
                // JSON mode (includes .json and .geojson)
                hideJsonlControls();
                renderJsonStr(fileContent);
            }
        }
    } catch (error) {
        console.error('Error opening file:', error);
        
        // Display error to user
        document.querySelector("#view").replaceChildren();
        displayParseError({
            type: 'File Open Error',
            error: `Failed to open file: ${error.message}`
        });
    }
}

let loader = new WebDataLoader();
loader.loadObject(welcome);
setCurrentRootLoader(loader, "welcome");
renderJSON(loader);