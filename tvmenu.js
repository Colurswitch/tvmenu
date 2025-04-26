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
        this.mainInnerSection.classList.add("active");
        this.dialogContainer = document.createElement("tvm-panel");
        this.dialogContainer.classList.add("hidden");
        this.mainInnerDialog = document.createElement("tvm-dialog");

        this.menuContainer.appendChild(this.mainInnerSection);
        this.dialogContainer.appendChild(this.mainInnerDialog);
        this.#createItemTree(this.items, this.header, this.mainInnerSection);
        document.body.appendChild(this.menuContainer);
        document.body.appendChild(this.dialogContainer);
    }

    /**
     * Creates a tree of items in the given container.
     *
     * @param {TVMenuItem[]} items - The array of items to create in the container.
     * @param {string} header - The header text to display at the top of the menu.
     * @param {HTMLElement} container - The container element to add the items to.
     * @param {boolean} [isSubMenu] - Determines wether this menu is a child of another menu.
     * @param {HTMLElement} [subMenuHeader] - The header to display for the sub menu.
     * @param {HTMLElement} [parentMenu] - The parent menu of this menu.
     * @private
     */
    #createItemTree(items, header, container, isSubMenu, subMenuHeader, parentMenu) {
        if (isSubMenu) {
            const $newHeader = document.createElement("h1");
            $newHeader.innerHTML = subMenuHeader;
            container.appendChild($newHeader);
            const $backItem = document.createElement("tvm-item");
            $backItem.innerHTML = `
                <span class="icon">
                    <i class="material-icons">arrow_back</i>
                </span>
                <div class="right">
                    <h3>Back</h3>
                </div>
            `;
            $backItem.onclick = () => {
                container.classList.remove("active");
                parentMenu.classList.add("active");
            };
            container.appendChild($backItem);
        }
        if (header) {
            const $newHeader = document.createElement("h1");
            $newHeader.innerHTML = header;
            container.appendChild($newHeader);
        }
        items.forEach((item, idx) => {
            const $newItem = document.createElement("tvm-item");
            if (idx == 0) $newItem.classList.add("selected");
            if (item.type == "separator") $newItem.classList.add("is-separator");
            if (item.default) $newItem.dataset.tvm_value = item.default;
            else {
                if (item.type == "checkbox") 
                    $newItem.dataset.tvm_value = false;
                else if (item.type == "number")
                    $newItem.dataset.tvm_value = item.min ? item.min : 0;
                else if (item.type == "input") 
                    $newItem.dataset.tvm_value = "";
            }
            $newItem.innerHTML = `
                <span class="icon">
                    ${item.icon || ``}
                </span>
                <div class="right">
                    <h3>${item.text}</h3>
                    <h3>${["button", "folder", "separator"].includes(item.type) ||
                    !item.default
                    ? ""
                    : item.type == "checkbox"
                        ? item.default
                            ? item.default
                            : $newItem.tvm_value
                        : item.type == "number"
                            ? item.default
                                ? item.default
                                : $newItem.tvm_value
                            : item.type == "input"
                                ? item.default
                                    ? item.default
                                    : $newItem.tvm_value
                                : item.type == "enum" ??
                                (item.default ? item.default : $newItem.tvm_value)
                }</h3>
                </div>
            `;
            $newItem.onclick = (evt) => {
                if (item.type == "input" && item.onChange)
                    this.prompt(
                        item.text,
                        item.default,
                        item.isPassword ? "password" : "text",
                        item.onChange,
                        item.min,
                        item.max
                    ).then((value) => {
                        $newItem.dataset.tvm_value = value;
                        $newItem.innerHTML = `
                            <span class="icon">
                                ${item.icon || ``}
                            </span>
                            <div class="right">
                                <h3>${item.text}</h3>
                                <h3>${$newItem.dataset.tvm_value}</h3>
                            </div>
                        `;
                    });
                if (item.type == "checkbox")
                    $newItem.dataset.tvm_value = $newItem.dataset.tvm_value === "true" ? false : true;
                else if (item.type == "number")
                    this.prompt(
                        item.text,
                        item.default,
                        item.min && item.max ? "range" : "number",
                        item.onChange,
                        item.min,
                        item.max
                    ).then((value) => {
                        $newItem.dataset.tvm_value = value;
                        $newItem.innerHTML = `
                            <span class="icon">
                                ${item.icon || ``}
                            </span>
                            <div class="right">
                                <h3>${item.text}</h3>
                                <h3>${$newItem.dataset.tvm_value}</h3>
                            </div>
                        `;
                    });
                else if (item.type == "enum")
                    this.prompt(
                        item.text,
                        $newItem.dataset.tvm_value,
                        "enum",
                        item.onChange,
                        item.possibleValues
                    ).then((value) => {
                        $newItem.dataset.tvm_value = value;
                        $newItem.innerHTML = `
                            <span class="icon">
                                ${item.icon || ``}
                            </span>
                            <div class="right">
                                <h3>${item.text}</h3>
                                <h3>${$newItem.dataset.tvm_value}</h3>
                            </div>
                        `;
                    });
                else if (item.type == "link") {
                    if (item.openInNewTab) window.open(item.link, "_blank");
                    else window.open(item.link, "_self");
                }
                $newItem.innerHTML = `
                    <span class="icon">
                        ${item.icon || ``}
                    </span>
                    <div class="right">
                        <h3>${item.text}</h3>
                        <h3>${item.type == "button" || item.type == "link" ? "" : $newItem.dataset.tvm_value}</h3>
                    </div>
                `;
                if (item.onSelect) item.onSelect(evt);
            };
            if (item.type == "folder") {
                const _ = document.createElement("tvm-section");
                this.menuContainer.appendChild(_);
                $newItem.onclick = (evt) => {
                    $newItem.parentElement.classList.remove("active");
                    _.classList.add("active");
                };
                this.#createItemTree(
                    item.children,
                    "",
                    _,
                    true,
                    item.text,
                    container
                );
            }
            container.appendChild($newItem);
        });
    }

    /**
     * Finds the first element after the given element that matches the given selector.
     * If the given element is null or undefined, this method returns null.
     * If the given element matches the selector, this method returns the given element.
     * Otherwise, this method will recursively check the next sibling of the given element until it finds a match.
     *
     * @param {HTMLElement} element The element to start searching after.
     * @param {string} selector The selector to match.
     * @return {HTMLElement} The first matching element after the given element, or null.
     */
    #findMatchingElementAfter(element, selector) {
        // Check if the current element is null or undefined
        if (!element) return null;

        // Check if the current element matches the selector
        if (element.matches(selector)) return element;

        // Recursively check the next sibling
        return this.#findMatchingElementAfter(element.nextElementSibling, selector);
    }

    /**
     * Finds the first element before the given element that matches the given selector.
     * If the given element is null or undefined, this method returns null.
     * If the given element matches the selector, this method returns the given element.
     * Otherwise, this method will recursively check the previous sibling of the given element until it finds a match.
     *
     * @param {HTMLElement} element The element to start searching before.
     * @param {string} selector The selector to match.
     * @return {HTMLElement} The first matching element before the given element, or null.
     */
    #findMatchingElementBefore(element, selector) {
        // Check if the current element is null or undefined
        if (!element) return null;

        // Check if the current element matches the selector
        if (element.matches(selector)) return element;

        // Recursively check the previous sibling
        return this.#findMatchingElementBefore(element.previousElementSibling, selector);
    }

    /**
     * Handles key events for the menu. This is a no-op if the menu is not visible.
     *
     * @param {KeyboardEvent} evt - The event to handle.
     */
    #handleKeyEvent(evt) {
        /** @type {HTMLElement} - all the items in the menu that are not separators */
        var $selectedItem;
        var $selectedItemIndex;
        if (evt.target.closest("input")) return;
        this.moveSelection(evt.key == "ArrowUp" ? "up" : (evt.key == "ArrowDown" ? "down" : (evt.key == "ArrowLeft" ? "left" : "right")))
        /*if (this.dialogContainer.classList.contains("hidden")) {
            this.menuContainer.querySelectorAll("tvm-item:not(.is-separator)").forEach(el => {
                if (el.classList.contains("selected")) {
                    $selectedItem = el;
                    $selectedItemIndex = [...this.menuContainer.querySelectorAll("tvm-item:not(.is-separator)")].indexOf(el);
                    evt.preventDefault();
                    switch (evt.key) {
                        case "ArrowUp":
                            if ($selectedItem.previousElementSibling) {
                                $selectedItem = $selectedItem.previousElementSibling
                                $selectedItem.previousElementSibling.classList.add("selected");
                                $selectedItem.classList.remove("selected");
                                while ($selectedItem.classList.contains("is-separator")) {
                                    $selectedItem = $selectedItem.previousElementSibling;
                                    $selectedItem.previousElementSibling.classList.add("selected");
                                    $selectedItem.classList.remove("selected");
                                }
                                $selectedItem.scrollIntoView({ block: "center" })
                            }
                            break;
                        case "ArrowDown":
                            if ($selectedItem.nextElementSibling) {
                                $selectedItem = $selectedItem.nextElementSibling;
                                $selectedItem.nextElementSibling.classList.add("selected");
                                $selectedItem.classList.remove("selected");
                                while ($selectedItem.classList.contains("is-separator")) {
                                    $selectedItem = $selectedItem.nextElementSibling;
                                    $selectedItem.nextElementSibling.classList.add("selected");
                                    $selectedItem.classList.remove("selected");
                                }
                                $selectedItem.scrollIntoView({ block: "center" });
                            }
                            break;
                        case "Enter":
                            $selectedItem.click();
                            break;
                        case "Backtick":
                            this.menuContainer.classList.toggle("hidden");
                            break;
                    }
                }
            });
            
        } else {
            // The dialog is visible, so handle key events for the dialog's actions.
            // Only preventDefault() if there is no input field in focus.
            if (!evt.target.closest("input")) evt.preventDefault();
            this.mainInnerDialog.querySelectorAll("tvm-dialog-actions > button").forEach(el => {
                if (el.classList.contains("active")) {
                    $selectedItem = el;
                    $selectedItemIndex = [...this.mainInnerDialog.querySelectorAll("tvm-dialog-actions > button")].indexOf(el);
                    switch (evt.key) {
                        case "ArrowLeft":
                            if ($selectedItem.previousElementSibling) {
                                $selectedItem = $selectedItem.previousElementSibling;
                                $selectedItem.previousElementSibling.classList.add("active");
                                $selectedItem.classList.remove("active");
                            }
                            break;
                        case "ArrowRight":
                            if ($selectedItem.nextElementSibling) {
                                $selectedItem = $selectedItem.nextElementSibling;
                                $selectedItem.nextElementSibling.classList.add("active");
                                $selectedItem.classList.remove("active");
                            }
                            break;
                        case "Enter":
                            $selectedItem.click();
                    }
                }
            });
            
        }*/
    }

    /**
     * Subscribes to keyboard events and handles them by invoking the #handleKeyEvent method.
     * This method adds an event listener to the document that listens for keypress events.
     */
    subscribeToKeyboard() {
        window.addEventListener("keydown", (evt) => this.#handleKeyEvent(evt))
    }

    /**
     * Unsubscribes from keyboard events by removing the event listener for keypress events.
     * This prevents the #handleKeyEvent method from being invoked on keypress.
     */
    unsubscribeFromKeyboard() {
        window.removeEventListener("keydown", (evt) => this.#handleKeyEvent(evt))
    }

    /**
     * Moves the selection in the menu based on the specified direction.
     *
     * @param {string} direction - The direction to move the selection. Must be one of: "left", "right", "up", or "down".
     */
    moveSelection(direction) {
        if (
            direction !== "left" &&
            direction !== "right" &&
            direction !== "up" &&
            direction !== "down"
        ) {
            throw new Error(
              "TVMenu: direction must be one of: left, right, up, or down"
            );
        }
        switch (direction) {
            case "left":
                if (!this.dialogContainer.classList.contains("hidden")) {
                    if (this.dialogContainer.querySelector("tvm-dialog-actions button.active").previousElementSibling) {
                        this.dialogContainer
                          .querySelector("tvm-dialog-actions button.active")
                          .previousElementSibling.classList.add("active");
                        this.dialogContainer
                          .querySelector("tvm-dialog-actions button.active")
                          .classList.remove("active");
                    }
                } break;
            case "right":
                if (!this.dialogContainer.classList.contains("hidden")) {
                    if (this.dialogContainer.querySelector("tvm-dialog-actions button.active").nextElementSibling) {
                        this.dialogContainer
                          .querySelector("tvm-dialog-actions button.active")
                          .classList.remove("active");
                        this.dialogContainer
                          .querySelector("tvm-dialog-actions button.active")
                          .nextElementSibling.classList.add("active");
                    }
                } break;
            case "up":
                if (this.dialogContainer.classList.contains("hidden")) {
                    if (this.#findMatchingElementBefore(this.menuContainer.querySelector("tvm-item.selected"),"tvm-item:not(.is-separator):not(.selected)")) {
                        /*this.menuContainer
                          .querySelector("tvm-item.selected")
                          .classList.remove("selected");
                        this.menuContainer
                          .querySelector("tvm-item.selected")
                          .previousElementSibling.classList.add("selected");
                        while (this.menuContainer.querySelector("tvm-item.selected").classList.contains("is-separator")) {
                            this.menuContainer
                                .querySelector("tvm-item.selected")
                                .classList.remove("selected");
                            this.menuContainer
                                .querySelector("tvm-item.selected")
                                .previousElementSibling.classList.add("selected");
                        }
                        this.menuContainer
                            .querySelector("tvm-item.selected")
                            .scrollIntoView({ block: "center" });*/
                        this.menuContainer
                            .querySelector("tvm-item.selected")
                            .classList.remove("selected");
                        this.#findMatchingElementBefore(
                          this.menuContainer.querySelector("tvm-item.selected"),
                          "tvm-item:not(.is-separator):not(.selected)"
                        ).classList.add("selected");
                        this.menuContainer
                            .querySelector("tvm-item.selected")
                            .scrollIntoView({ block: "center" });
                    }
                } break;
            case "down":
                if (this.dialogContainer.classList.contains("hidden")) {
                    if (
                      this.#findMatchingElementAfter(
                        this.menuContainer.querySelector("tvm-item.selected"),
                        "tvm-item:not(.is-separator):not(.selected)"
                      )
                    ) {
                      /*this.menuContainer
                        .querySelector("tvm-item.selected")
                        .classList.remove("selected");
                      this.menuContainer
                        .querySelector("tvm-item.selected")
                        .nextElementSibling.classList.add("selected");
                      while (
                        this.menuContainer
                          .querySelector("tvm-item.selected")
                          .classList.contains("is-separator")
                      ) {
                        this.menuContainer
                          .querySelector("tvm-item.selected")
                          .classList.remove("selected");
                        this.menuContainer
                          .querySelector("tvm-item.selected")
                          .nextElementSibling.classList.add("selected");
                      }*/
                        this.menuContainer
                        .querySelector("tvm-item.selected")
                        .classList.remove("selected");
                        this.#findMatchingElementAfter(
                            this.menuContainer.querySelector("tvm-item.selected"),
                            "tvm-item:not(.is-separator):not(.selected)"
                          ).classList.add("selected");
                        this.menuContainer
                            .querySelector("tvm-item.selected")
                            .scrollIntoView({ block: "center" });
                    }
                } break;
        }
    }

    /**
     * Displays an alert dialog with the provided message. Not to be confused with Window.alert().
     *
     * @param {string} message - The message to display in the alert dialog.
     * @returns {Promise<void>} A promise that resolves when the dialog is dismissed.
     */
    alert(message) {
        return new Promise((resolve) => {
            this.dialogContainer.classList.remove("hidden");
            this.dialogContainer.innerHTML = "";
            this.mainInnerDialog.innerHTML = `<tvm-dialog-content>${message}</tvm-dialog-content>`;
            const $newActions = document.createElement("tvm-dialog-actions");
            const $acceptButton = document.createElement("button");
            $acceptButton.innerHTML = "OK";
            $acceptButton.onclick = () => {
                this.dialogContainer.classList.add("hidden");
                this.dialogContainer.innerHTML = "";
                resolve();
            };
            $newActions.appendChild($acceptButton);
            this.mainInnerDialog.appendChild($newActions);
            this.dialogContainer.appendChild(this.mainInnerDialog);
        });
    }

    /**
     * Displays a prompt dialog with the provided message and options. Not to be confused with Window.prompt().
     *
     * @param {string} message - The message to display in the prompt dialog.
     * @param {string|number|boolean} [defaultValue=""] - The default value to display in the input field.
     * @param {string} [type="text"] - The type of input to use in the prompt dialog.
     * @param {function(string)} [onchange] - A function to call when the value of the input changes.
     * @param {{text: string, value: string}[]} [values] - The possible values for the enum type.
     * @param {number} [min] - The minimum value of the input field.
     * @param {number} [max] - The maximum value of the input field.
     * @returns {Promise<string>} A promise that resolves with the value of the input when the dialog is dismissed.
     */
    prompt(
        message,
        defaultValue = "",
        type = "text",
        onchange,
        values,
        min,
        max
    ) {
        return new Promise((resolve) => {
            this.dialogContainer.classList.remove("hidden");
            this.dialogContainer.innerHTML = "<div></div>";
            const $newContent = document.createElement("tvm-dialog-content");
            $newContent.innerHTML = message;
            var $newActions;
            var $okButton;
            var $cancelButton;
            if (type === "enum") {
                const $newSelect = document.createElement("select");
                values.forEach((value) => {
                    const $newOption = document.createElement("option");
                    $newOption.innerHTML = value.text;
                    $newOption.value = value.value;
                    $newSelect.appendChild($newOption);
                });
                $newSelect.value = defaultValue;
                $newSelect.onchange = () => onchange($newSelect.value);
                $newSelect.value = defaultValue;
                $newActions = document.createElement("tvm-dialog-actions");
                $okButton = document.createElement("button");
                $okButton.innerHTML = "OK";
                $okButton.onclick = () => {
                    this.dialogContainer.classList.add("hidden");
                    this.dialogContainer.innerHTML = "";
                    resolve($newSelect.value);
                };
                $cancelButton = document.createElement("button");
                $cancelButton.innerHTML = "Cancel";
                $cancelButton.onclick = () => {
                    this.dialogContainer.classList.add("hidden");
                    this.dialogContainer.innerHTML = "";
                    resolve(defaultValue);
                };
                $newActions.appendChild($okButton);
                $newActions.appendChild($cancelButton);
                $newContent.appendChild($newSelect);
            } else {
                const $newInput = document.createElement("input");
                $newInput.type = type;
                $newInput.value = defaultValue;
                if (onchange) $newInput.onchange = () => onchange($newInput.value);
                if (min) $newInput.min = min;
                if (max) $newInput.max = max;
                $newContent.appendChild($newInput);
                $newActions = document.createElement("tvm-dialog-actions");
                $okButton = document.createElement("button");
                $okButton.innerHTML = "OK";
                $okButton.onclick = () => {
                    this.dialogContainer.classList.add("hidden");
                    this.dialogContainer.innerHTML = "";
                    resolve($newInput.value);
                };
                $cancelButton = document.createElement("button");
                $cancelButton.innerHTML = "Cancel";
                $cancelButton.onclick = () => {
                    this.dialogContainer.classList.add("hidden");
                    this.dialogContainer.innerHTML = "";
                    resolve(defaultValue);
                };
                $newActions.appendChild($okButton);
                $newActions.appendChild($cancelButton);
            }
            this.mainInnerDialog.appendChild($newContent);
            this.mainInnerDialog.appendChild($newActions);
            this.dialogContainer.replaceChildren("");
            this.dialogContainer.appendChild(this.mainInnerDialog);
        });
    }

    /**
     * Displays a confirmation dialog with the provided message. Not to be confused with Window.confirm().
     *
     * @param {string} message - The message to display in the confirm dialog.
     * @returns {Promise<boolean>} A promise that resolves with true if the user clicks the "Yes" button or false if the user clicks the "No" button.
     */
    confirm(message) {
        return new Promise((resolve) => {
            this.dialogContainer.classList.remove("hidden");
            this.dialogContainer.innerHTML = "<div></div>";
            const $newContent = document.createElement("tvm-dialog-content");
            $newContent.innerHTML = message;
            const $newActions = document.createElement("tvm-dialog-actions");
            const $okButton = document.createElement("button");
            $okButton.innerHTML = "Yes";
            $okButton.onclick = () => {
                this.dialogContainer.classList.add("hidden");
                this.dialogContainer.innerHTML = "";
                resolve(true);
            };
            const $cancelButton = document.createElement("button");
            $cancelButton.innerHTML = "No";
            $cancelButton.onclick = () => {
                this.dialogContainer.classList.add("hidden");
                this.dialogContainer.innerHTML = "";
                resolve(false);
            };
            $newActions.appendChild($okButton);
            $newActions.appendChild($cancelButton);
            this.mainInnerDialog.appendChild($newContent);
            this.mainInnerDialog.appendChild($newActions);
            this.dialogContainer.appendChild(this.mainInnerDialog);
        });
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
     * Removes the menu from the DOM. This is useful when the menu is no
     * longer needed and you want to free up resources.
     */
    destroy() {
        this.menuContainer.remove();
        this.dialogContainer.remove();
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
     * @param {string} [options.href] - The URL to open when the item is clicked. Only used if type is link.
     * @param {boolean} [options.openInNewTab] - Whether or not to open the URL in a new tab. Only used if type is link.
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
            options.type !== "link" &&
            options.type !== "separator"
        ) {
            throw new Error("TVMenuItem: type is invalid.");
        } else if (
            options.type === "enum" &&
            (!options.possibleValues ||
                options.possibleValues.length === 0 ||
                !options.default)
        ) {
            throw new Error("TVMenuItem: possibleValues or default is invalid.");
        } else if (options.type === "number" && (!options.min || !options.max)) {
            console.warn(
                "TVMenuItem: min or max is missing, input type will be number instead of range"
            );
        } else if (
            options.type === "folder" &&
            (!options.children || options.children.length === 0)
        ) {
            throw new Error("TVMenuItem: children is null or empty.");
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
        this.href = options.href;
        this.openInNewTab = options.openInNewTab;
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
