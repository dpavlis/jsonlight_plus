let long_demo = {
    "string": "This is a string value\nThis the second line",
    "number": 123.456,
    "list": ["elem1", "elem2", "elem3", "elem4", "elem5", "elem6",
             "elem7", "elem8", "elem9", "elem10", "elem11", "elem12",
             "elem13", "elem14", "elem15", "elem16", "elem17", "elem18"],
    "boolean": true,
    "null": null
};

let demo = {
    "string": "This is a string value\nThis the second line\n" +
              "Test HTML tags: <span> content </span>\n",
    "number": 123.456,
    "list": ["elem1", "elem2"],
    "boolean": true,
    "null": null,
    "long-demo": long_demo,
    "empty-list": [],
    "empty-object": {},
    "long-string": "Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long "
};

let welcome = {
    "title": "JSON Light+",
    "description": "A JSON viewer/editor that displays multi-line strings in its raw format and let's you edit it!",
    "tip": "Click the R (view raw) button in the following line\nClick the E (edit) button to edit the value in a modal dialog\nClick [C] to duplicate the whole JSON element\nClock [D] to delete the whole JSON element",
    "banner": "\n     _ ____   ___  _   _ _     ___      _     _            \n    | / ___| / _ \\| \\ | | |   |_ _|__ _| |__ | |_      _   \n _  | \\\\___ \\ | | |   \\ | |    | |/ _` | '_ \\| __|   _| |_ \n| |_| |___) | |_| | |\\  | |___ | | (_| | | | | |_   |_   _|\n \\___/|____/ \\___/|_| \\_|_____|___\\__, |_| |_|\\__|    |_|  \n                                  |___/                    \n"
}

/*************************************
 *        Property Editor Modal      *
 *************************************/
const propertyEditorState = {
    modalElement: document.querySelector("#property-editor-modal"),
    textarea: document.querySelector("#property-editor-input"),
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
    modal: null,
    currentKvRoot: null,
    caretUpdateHandle: null,
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

function initializePropertyEditorDragSupport() {
    if (propertyEditorDragState.initialized || !propertyEditorState.modalElement) return;
    const dialog = propertyEditorState.modalElement.querySelector(".modal-dialog");
    const header = propertyEditorState.modalElement.querySelector(".modal-header");
    if (!dialog || !header) return;
    propertyEditorDragState.dialog = dialog;
    propertyEditorDragState.header = header;
    header.style.cursor = "move";
    header.addEventListener("mousedown", handlePropertyEditorDragStart);
    propertyEditorState.modalElement.addEventListener("shown.bs.modal", resetPropertyEditorDragPosition);
    propertyEditorState.modalElement.addEventListener("hidden.bs.modal", resetPropertyEditorDragPosition);
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
}

function applyPropertyEditorDragTransform() {
    if (!propertyEditorDragState.dialog) return;
    propertyEditorDragState.dialog.style.transform = `translate(${propertyEditorDragState.currentX}px, ${propertyEditorDragState.currentY}px)`;
}

function resetPropertyEditorDragPosition() {
    propertyEditorDragState.currentX = 0;
    propertyEditorDragState.currentY = 0;
    if (propertyEditorDragState.dialog) {
        propertyEditorDragState.dialog.style.transform = "";
    }
    if (propertyEditorDragState.dragging) {
        propertyEditorDragState.dragging = false;
        document.removeEventListener("mousemove", handlePropertyEditorDragMove);
        document.removeEventListener("mouseup", handlePropertyEditorDragEnd);
    }
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
        setPropertyEditorSearchStatus("", "info");
    });
}

initializePropertyEditorDragSupport();

if (propertyEditorState.applyButton) {
    propertyEditorState.applyButton.addEventListener("click", () => {
        if (!propertyEditorState.currentKvRoot || !propertyEditorState.textarea) return;
        const newValue = propertyEditorState.textarea.value;
        const loader = propertyEditorState.currentKvRoot.loader;
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

if (propertyEditorState.textarea) {
    ["input", "keyup", "mouseup", "click"].forEach((eventName) => {
        propertyEditorState.textarea.addEventListener(eventName, () => {
            schedulePropertyEditorCaretUpdate();
        });
    });
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
const topLevelState = { mode: "none", count: 0 };
const topLevelCountLabel = document.querySelector("#top-level-count");
const topLevelInput = document.querySelector("#top-level-index-input");
const topLevelGoButton = document.querySelector("#top-level-go");
const topLevelErrorLabel = document.querySelector("#top-level-error");
const topLevelHighlightState = { kvElement: null, rootElement: null, timeoutHandle: null };
const searchHistoryList = document.querySelector("#search-history-options");
const replaceHistoryList = document.querySelector("#replace-history-options");
const SEARCH_HISTORY_STORAGE_KEY = "jsonlight.searchHistory";
const REPLACE_HISTORY_STORAGE_KEY = "jsonlight.replaceHistory";
const SEARCH_HISTORY_LIMIT = 12;
const REPLACE_HISTORY_LIMIT = 12;
const SEARCH_HISTORY_COMMIT_DELAY = 500;
const SEARCH_REGEX_EXAMPLES = [
    String.raw`toDate\((?:(?!;).)+\)`,
    String.raw`\bhttps?://[^\s]+`,
    String.raw`"errorCode"\s*:\s*\d+`,
    String.raw`(?<="userId"\s*:\s?")([^"\s]+)`
];
let searchHistoryValues = [];
let replaceHistoryValues = [];
let searchHistoryCommitHandle = null;

initializeSearchAndReplaceHistory();

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
                await ensurePathRendered(path);
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
    const kvRoot = await ensurePathRendered([index]);
    if (!kvRoot) {
        setTopLevelError("Unable to locate that array item.");
        return;
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
        for (const childKV of kvRoot.loader.getChild()) {
            childList.appendChild(
                renderKV(...childKV)
            )
        }
        collapseButton.innerHTML = "-";
    });
    collapseWrapper.addEventListener('hidden.bs.collapse', (ev) => {
        ev.stopPropagation();
        childList.replaceChildren();
        collapseButton.innerHTML = "+";
    })
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
        openPropertyEditor(kvRoot);
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
    updatePropertyEditorPath(loader);
    schedulePropertyEditorCaretUpdate();
    propertyEditorState.modal.show();
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
                type: 'JSON Parse Error'
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

function shouldShowBulkCheckbox(loader) {
    return bulkOperationsEnabled
        && !!loader
        && !!loader.parentLoader
        && loader.parentLoader === g_currentRootLoader;
}

function attachBulkCheckboxIfNeeded(kvRoot, kvElement, kvTextElement) {
    if (!kvRoot || !kvElement || !kvTextElement) return;
    const loader = kvRoot.loader;
    if (!shouldShowBulkCheckbox(loader)) return;
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-check", "bulk-checkbox-wrapper");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("form-check-input");
    checkbox.checked = isBulkItemSelected(loader);
    checkbox.addEventListener("change", () => handleBulkCheckboxChange(loader, checkbox.checked));
    wrapper.appendChild(checkbox);
    kvElement.insertBefore(wrapper, kvTextElement);
}

function clearBulkSelectionState() {
    if (bulkSelectionState.size === 0) return;
    bulkSelectionState.clear();
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
        refreshBulkRendering();
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
    updateBulkControls();
    refreshBulkRendering();
}

async function refreshBulkRendering() {
    if (!g_currentRootLoader) return;
    const expandedPaths = captureExpandedPaths(g_currentRootLoader);
    rerenderCurrentRoot();
    await restoreExpandedPaths(expandedPaths);
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
let currentTheme = THEME_LIGHT;
let themeToggleInput = null;
let bulkOperationsEnabled = false;
const bulkSelectionState = new Map();
let bulkToggleInput = null;
let bulkDeleteButton = null;
let bulkDeleteContainer = null;

updateTopLevelNavigator();

function rerenderCurrentRoot(options = {}) {
    if (!g_currentRootLoader) return;
    const view = document.querySelector("#view");
    if (view) {
        view.replaceChildren();
    }
    renderJSON(g_currentRootLoader);
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
    const expandedPaths = captureExpandedPaths();
    const result = duplicateLoaderChild(loader);
    if (!result.success) {
        alert("Unable to duplicate this item.");
        return;
    }
    handleValueChanged(parentLoader, { skipSearchRefresh: true });
    rerenderCurrentRoot();
    await restoreExpandedPaths(expandedPaths);
    if (result.newPath) {
        await focusPathSegments(result.newPath, true);
    }
}

function setCurrentRootLoader(loader, mode) {
    g_currentRootLoader = loader;
    g_currentMode = mode;
    clearBulkSelectionState();
    updateBulkControls();
    updateDownloadButtons();
    updateTopLevelNavigator();
}

function clearCurrentRootLoader() {
    setCurrentRootLoader(null, null);
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

function promptFileName(format) {
    const suggestedName = getSuggestedFileName(format);
    if (typeof window === "undefined" || typeof window.prompt !== "function") {
        return suggestedName;
    }
    let userInput = window.prompt("Enter file name", suggestedName);
    if (userInput == null) return null;
    let trimmed = userInput.trim();
    if (!trimmed) {
        trimmed = suggestedName;
    }
    trimmed = ensureFileExtension(trimmed, format);
    lastLoadedFileName = trimmed;
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
    let rootButton = rootJson.querySelector(".collapse-button");
    if (rootButton) {
        rootButton.style.display = "none";
        rootButton.click();
    }
    requestSearchRefresh();
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
    
    document.querySelector("#view").appendChild(errorContainer);
    requestSearchRefresh();
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
pasteArea.addEventListener("change", (ev) => {
    hideJsonlControls(); // Hide JSONL controls when using paste
    clearFileNameDisplay(); // Clear file name when using paste
    renderJsonStr(pasteArea.value);
});
if (pasteArea.value != "") {
    renderJsonStr(pasteArea.value);
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

// Expand All / Collapse All functionality
let expandAllButton = document.querySelector("#expand-all");
expandAllButton.addEventListener("click", async (ev) => {
    await expandAll();
});

let collapseAllButton = document.querySelector("#collapse-all");
collapseAllButton.addEventListener("click", (ev) => {
    collapseAll();
});

async function expandAll() {
    let foundCollapsed = true;
    
    // Keep expanding until no more collapsed items are found
    while (foundCollapsed) {
        foundCollapsed = false;
        const collapseButtons = document.querySelectorAll(".collapse-button");
        
        // Create an array of promises for all the expansions in this level
        const expansionPromises = [];
        
        collapseButtons.forEach(button => {
            const kvRoot = button.closest(".kv-root");
            const collapseWrapper = kvRoot.querySelector(".collapse");
            
            // Only expand if it's currently collapsed
            if (!collapseWrapper.classList.contains("show")) {
                foundCollapsed = true;
                
                // Create a promise that resolves when the collapse is fully shown
                const expansionPromise = new Promise((resolve) => {
                    const onShown = () => {
                        collapseWrapper.removeEventListener('shown.bs.collapse', onShown);
                        resolve();
                    };
                    collapseWrapper.addEventListener('shown.bs.collapse', onShown);
                    button.click();
                });
                
                expansionPromises.push(expansionPromise);
            }
        });
        
        // Wait for all expansions in this level to complete before moving to the next level
        if (expansionPromises.length > 0) {
            await Promise.all(expansionPromises);
        }
    }
}

function collapseAll() {
    const collapseButtons = document.querySelectorAll(".collapse-button");
    collapseButtons.forEach(button => {
        const kvRoot = button.closest(".kv-root");
        const collapseWrapper = kvRoot.querySelector(".collapse");
        
        // Skip the root level collapse button (it should stay expanded)
        // The root level button has display: none style applied
        const isRootLevel = button.style.display === "none";
        
        // Only collapse if it's currently expanded and not the root level
        if (collapseWrapper.classList.contains("show") && !isRootLevel) {
            button.click();
        }
    });
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
bulkDeleteContainer = document.querySelector("#bulk-operations-actions");
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