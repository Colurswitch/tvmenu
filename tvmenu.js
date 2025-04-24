class TVMenu {
    /**
     * Constructor for TVMenu
     *
     * @param {object} options - Options for the TVMenu
     * @param {string} options.header - Text to display at the top of the menu
     * @param {TVMenuItem[]} options.items - The array of items to display in the menu
     */
    constructor(options) {
        this.header = options.header;
        this.items = options.items;

        this.menuContainer = document.createElement("tvm-panel");
        this.mainInnerSection = document.createElement("tvm-section");
        this.dialogContainer = document.createElement("tvm-panel");
        this.mainInnerDialog = document.createElement("tvm-dialog");

        
        this.menuContainer.appendChild(this.mainInnerSection);
    }

    /**
     * Creates a tree of items in the given container.
     *
     * @param {TVMenuItem[]} items - The array of items to create in the container.
     * @param {HTMLElement} container - The container element to add the items to.
     * @private
     */
    #createItemTree(items, container) {
        items.forEach((item, idx) => {
            const $newItem = document.createElement("tvm-item");
            $newItem.innerHTML = `
                <span class="icon">
                    ${item.icon || ""}
                </span>
                <div class="right">
                    <h3>${item.text}</h3>
                    <h3>${["button","folder","separator"].includes(item.type) || !item.default ? "" : item.default}</h3>
                </div>
            `;
            if (idx == 0) $newItem.classList.add("active");
            if (item.default) $newItem.dataset.tvm_value = item.default;
            else {
                if (item.type == "checkbox") $newItem.dataset.tvm_value = false;
                else if (item.type == "number") $newItem.dataset.tvm_value = item.min?item.min:0;
                else if (item.type == "input") $newItem.dataset.tvm_value = "";
            }
            if (item.onSelect) $newItem.onclick = (evt) => {
                if (item.type == "input" && item.onChange) this.prompt(item.text, item.default, item.isPassword ? "password" : "text", item.onChange, item.min, item.max).then(value => item.value = value);
                if (item.type == "checkbox")
                item.onSelect(evt);
            };
            else if (item.type == "folder") {
                const _ = document.createElement("tvm-section");
                $newItem.parentElement.insertAdjacentElement("afterend", _);
                this.#createItemTree(item.children, _);
            }
            container.appendChild($newItem);
        });
    }

    /**
     * Displays an alert dialog with the provided message.
     *
     * @param {string} message - The message to display in the alert dialog.
     * @returns {Promise<void>} A promise that resolves when the dialog is dismissed.
     */
    alert(message) {
        return new Promise((resolve) => {
            this.mainInnerDialog.innerHTML = `<tvm-dialog-content>${message}</tvm-dialog-content>`;
            const $newActions = document.createElement("tvm-dialog-actions");
            const $acceptButton = document.createElement("button");
            $acceptButton.innerHTML = "OK";
            $acceptButton.onclick = () => {
                this.dialogContainer.classList.add("hidden");
                this.dialogContainer.innerHTML = "";
                resolve();
            }
            $newActions.appendChild($acceptButton);
            this.mainInnerDialog.appendChild($newActions);
            this.dialogContainer.appendChild(this.mainInnerDialog);
        });
    }

    /**
     * Displays a prompt dialog with the provided message and options.
     *
     * @param {string} message - The message to display in the prompt dialog.
     * @param {string|number|boolean} [defaultValue=""] - The default value to display in the input field.
     * @param {string} [type="text"] - The type of input to use in the prompt dialog.
     * @param {function(string)} [onchange] - A function to call when the value of the input changes.
     * @param {number} [min] - The minimum value of the input field.
     * @param {number} [max] - The maximum value of the input field.
     * @returns {Promise<string>} A promise that resolves with the value of the input when the dialog is dismissed.
     */
    prompt(message, defaultValue = "", type = "text", onchange, min, max) {
        return new Promise((resolve) => {
            const $newContent = document.createElement("tvm-dialog-content");
            $newContent.innerHTML = message;
            const $newInput = document.createElement("input");
            $newInput.type = type;
            $newInput.value = defaultValue;
            if (onchange) $newInput.onchange = () => onchange($newInput.value);
            if (min) $newInput.min = min;
            if (max) $newInput.max = max;
            $newContent.appendChild($newInput);
            const $newActions = document.createElement("tvm-dialog-actions");
            const $okButton = document.createElement("button");
            $okButton.innerHTML = "OK";
            $okButton.onclick = () => {
                this.dialogContainer.classList.add("hidden");
                this.dialogContainer.innerHTML = "";
                resolve($newInput.value);
            }
            const $cancelButton = document.createElement("button");
            $cancelButton.innerHTML = "Cancel";
            $cancelButton.onclick = () => {
                this.dialogContainer.classList.add("hidden");
                this.dialogContainer.innerHTML = "";
                resolve(defaultValue);
            }
            $newActions.appendChild($okButton);
            this.mainInnerDialog.appendChild($newContent);
            this.mainInnerDialog.appendChild($newActions);
            this.dialogContainer.appendChild(this.mainInnerDialog);
        })
    }

    confirm(message) {
        return new Promise((resolve) => {
            const $newContent = document.createElement("tvm-dialog-content");
            $newContent.innerHTML = message;
            const $newActions = document.createElement("tvm-dialog-actions");
            const $okButton = document.createElement("button");
            $okButton.innerHTML = "Yes";
            $okButton.onclick = () => {
                this.dialogContainer.classList.add("hidden");
                this.dialogContainer.innerHTML = "";
                resolve(true);
            }
            const $cancelButton = document.createElement("button");
            $cancelButton.innerHTML = "No";
            $cancelButton.onclick = () => {
                this.dialogContainer.classList.add("hidden");
                this.dialogContainer.innerHTML = "";
                resolve(false);
            }
            $newActions.appendChild($okButton);
            this.mainInnerDialog.appendChild($newContent);
            this.mainInnerDialog.appendChild($newActions);
            this.dialogContainer.appendChild(this.mainInnerDialog);
        })
    }

    /**
     * Opens the menu
     */
    open() {
        this.menuContainer.classList.remove("hidden");
    }

    /**
     * Closes the menu
     */
    close() {
        this.menuContainer.classList.add("hidden");
    }

    /**
     * Toggles the visibility of the menu
     */
    toggle() {
        this.menuContainer.classList.toggle("hidden");
    }

    /**
     * Selects the currently selected item as if the user had clicked on it
     */
    select() {
        //this.mainInnerSection.querySelector("tvm-item.selected").click();
    }

    /**
     * Removes the menu from the DOM. This is useful when the menu is no
     * longer needed and you want to free up resources.
     */
    destroy() {
        this.menuContainer.remove();
        this.mainInnerSection.remove();
        this.dialogContainer.remove();
        this.mainInnerDialog.remove();
    }
}

class TVMenuItem {
    /**
     * Constructor for TVMenuItem
     * @param {object} options - Options for the TVMenuItem
     * @param {string} [options.text] - The text to display for the item
     * @param {string} [options.icon] - Valid HTML to display as an icon. Can be a basic icon or even an image.
     * @param {string} options.type - The type of item. Must be one of: button, checkbox, enum, folder, input, number, or separator
     * @param {function(Event)} [options.onSelect] - The function to call when the item is selected
     * @param {{text: string, value: string}[]} [options.possibleValues] - An array of valid options for the enum type. Only used if type is enum.
     * @param {function(string)} [options.onChange] - The function to call when the item's value changes. Won't be called if type is button or folder.
     * @param {TVMenuItem[]} [options.children] - The array of children items for this item. Only used if type is folder.
     * @param {boolean} [options.isPassword] - Whether or not the item should be a password. Only used if type is input.
     * @param {number} [options.min] - The minimum value of the item. Only used if type is number.
     * @param {number} [options.max] - The maximum value of the item. Only used if type is number.
     * @param {string|number} [options.default]
     * The default value of the item. Optional, but won't be used if type is button or folder.
     * This property must evaluate to a CSS color if type is color. Can be a string if type is input.
     * Must evaluate to a bool if type is checkbox.
     */
    constructor(options) {
        this.text = options.text;
        if (
            options.type !== "button" &&
            options.type !== "checkbox" &&
            options.type !== "enum" &&
            options.type !== "number" &&
            options.type !== "folder" &&
            options.type !== "input" &&
            options.type !== "separator"
        ) {
            throw new Error("TVMenuItem: type is invalid.");
        } else if (
            (options.type === "enum" &&
                (!options.possibleValues || !options.default)) ||
            options.possibleValues.length === 0
        ) {
            throw new Error("TVMenuItem: possibleValues or default is invalid.");
        } else if (
            options.type === "number" && (!min || !max)
        ) {
            console.warn(
              "TVMenuItem: min or max is missing, input type will be number instead of range"
            );
        } else if (
            options.type === "folder" && (!options.children || options.children.length === 0)
        ) {
            throw new Error("TVMenuItem: children is null or empty.")
        }
        this.type = options.type;
        this.icon = options.icon;
        this.onSelect = options.onSelect;
        this.possibleValues = options.possibleValues;
        this.onChange = options.onChange;
        this.children = options.children;
        this.isPassword = options.isPassword;
        this.min = options.min;
        this.max = options.max;
        this.default = options.default;
        this.value = this.default;

        this.domElement = document.createElement("tvm-item");
    }

    /**
     * Evaluates a string to determine if it represents a boolean true value.
     *
     * @param {string} str - The string to evaluate.
     * @returns {boolean} - Returns true if the string is "true" or "1", otherwise false.
     */
    evaluateBool(str) {
        return str == "true" || str == "1";
    }
}
