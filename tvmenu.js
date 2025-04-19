class TVMenu {
    /**
     * Constructor for TVMenu
     *
     * @param {Object} options - Options for the TVMenu
     * @param {HTMLElement} [options.domElement] - The HTMLElement to use as the panel
     * @param {{title: string, children: TVMenuItem[]}[]} options.sections - An array of sections, each containing a title and an array of children items
     */
    constructor(options) {
        this.domElement = options.domElement || document.createElement("tvm-panel");
        this.sections = options.sections;
    }
}

class TVMenuItem {
  /**
     * Constructor for TVMenuItem
     * @param {Object} options - Options for the TVMenuItem
     * @param {String} options.text - The text to display for the item
     * @param {string} options.icon - Valid HTML to display as an icon. Can be a basic icon or even an image.
     * @param {String} options.type - The type of item. Must be one of: button, checkbox, enum, folder, or color
     * @param {Function} [options.onSelect] - The function to call when the item is selected
     * @param {{text: string, value: string}[]} [options.possibleValues] - An array of valid options for the enum type. Only used if type is enum.
     * @param {function(string)} [options.onChange] - The function to call when the item's value changes. Won't be called if type is button or folder.
     * @param {TVMenuItem[]} [options.children] - The array of children items for this item. Only used if type is folder.
     * @param {boolean} [options.allowAlpha] - Whether or not the item should allow alpha. Only used if type is color.

     */
  constructor(options) {
    this.text = options.text;
    if (
      options.type !== "button" &&
      options.type !== "checkbox" &&
      options.type !== "enum" &&
      options.type !== "folder" &&
      options.type !== "color"
    ) {
      throw new Error("TVMenuItem: type is invalid.");
    } else if (
      (options.type === "enum" && !options.possibleValues) ||
      options.possibleValues.length === 0
    ) {
      throw new Error("TVMenuItem: possibleValues is invalid.");
    }
    this.type = options.type;
    this.icon = options.icon;
    this.onSelect = options.onSelect;
    this.possibleValues = options.possibleValues;
    this.onChange = options.onChange;
    this.children = options.children;
  }
}

export { TVMenu, TVMenuItem };
