# TVMenu
Implements a nice TV-style menu for your HTML apps.

## How to use
Add the following HTML to your ```<head>``` tag:
```html
<link rel="stylesheet" href="https://github.com/Colurswitch/tvmenu/raw/refs/heads/main/tvmenu.css" />
<script src="https://github.com/Colurswitch/tvmenu/raw/refs/heads/main/tvmenu.js">
```
### Styling 
You can change the styling of the menu by adding the following CSS to your ```<head>``` tag:
```css
:root {
    --tvmenu-panel-bg: rgba(0, 0, 0, 0.5); /* Background color of the panel */
    --tvmenu-panel-mw: 700px; /* Maximum width of the menu */
}
```

### JavaScript
Create a new TVMenu instance:
```javascript
const menu = new TVMenu({
    items: [ // Array of menu items. Required.
        new TVMenuItem({
            [text: string], // Text to display in the menu item. Required unless type is "separator".
            [icon: string | HTMLElement | null], // Valid HTML to display as an icon. Required unless type is "separator".
            type: "button" | "checkbox" | "enum" | "color" | "folder" | "input" | "separator" | "link", 
            // Type of menu item.
            [onSelect: () => void | null], // Callback function to execute when the item has been clicked or selected. Optional but won't be used if type is "separator".
            [possibleValues: {text: string, value: string}[] | null], 
            // Array of values for the enum type. Required if type is "enum".
            [onChange: (string) => void | null], 
            // Callback function to execute when the value of the item has changed. Optional but won't be used if type is "separator".
            [children: TVMenuItem[] | null], // Array of child items. Required if type is "folder".
            [allowAlpha: boolean], 
            // Allow the user to select the alpha value of the color type. Optional but won't be used if type is "separator".
            [isPassword: boolean], 
            // Whether the item is a password field. Use only if type is "input".
            [default: string | number | null],
            // Default value for the item. Optional but won't be used if type is "separator", "button", or "folder". Required and must be the number if type is "enum". Must be a valid CSS color string if type is "color". Can be just a string if type is "input". Must evaluate to a boolean if type is checkbox.
            [href: string | null],
            // URL to open when the item is clicked. Only used if type is "link".
            [openInNewTab: boolean | null], 
            // Whether to open the URL in a new tab. Only used if type is link.
        })
    ]
})
```
### Methods
Bind the menu:
```javascript
menu.subscribeToKeyboard() // Subscribe to keyboard events
menu.unsubscribeFromKeyboard() // Unsubscribe from keyboard events
```

Control the menu:
```javascript
menu.show() // Show the menu
menu.hide() // Hide the menu
menu.toggle() // Toggle the menu

menu.moveSelection(direction: "up" | "down" | "left" | "right") // Move the selection in the menu. You can specify the direction to move in.
menu.select() // Select the current item
```

Display messages:
```javascript
menu.alert(message: string) => Promise<void> // Display a generic alert message. You can specify a promise callback if you want to execute code after the user clicks "OK".
menu.prompt(message: string, defaultValue?: string | number | boolean | "", type: "HTML Input type", onchange?: (string | number | boolean) => void, min?: number | null, max?: number | null) => Promise<string | number | boolean> // Display a prompt message. You can specify a function to execute when the user changes the value of the input. You can specify a minimum and maximum value for the "number" or "range" input. You can specify a promise callback, called with the user's input, if you want to execute code after the user clicks "OK".
menu.confirm(message: string) => Promise<boolean> // Display a confirmation message. You can specify a promise callback if you want to execute code after the user clicks "Yes" or "No".
```

Danger zone:
```javascript
menu.destroy() // Destroy the menu and remove it from the DOM
```
