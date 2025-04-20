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
        [domElement: HTMLElement | null] // DOM element (<tvm-panel>) to contain the menu. By default, the menu will be created inside a new <tvm-panel> element.
        sections: [ // {title: string, children: TVMenuItem[]}
            new TVMenuItem({
                [text: string], // Text to display in the menu item. Required unless type is "separator".
                [icon: string | HTMLElement | null], // Valid HTML to display as an icon. Required unless type is "separator".
                type: "button" | "checkbox" | "enum" | "color" | "folder" | "input" | "separator", // Type of menu item.
                [onSelect: () => void | null], // Callback function to execute when the item has been clicked or selected. Optional but won't be used if type is "separator".
                [possibleValues: {text: string, value: string}[] | null], // Array of values for the enum type. Required if type is "enum".
                [onChange: (string) => void | null], // Callback function to execute when the value of the item has changed. Optional but won't be used if type is "separator".
                [children: TVMenuItem[] | null], // Array of child items. Required if type is "folder".
                [allowAlpha: boolean], // Allow the user to select the alpha value of the color type. Optional but won't be used if type is "separator".
                [isPassword: boolean], // Whether the item is a password field. Use only if type is "input".
                [default: string | null] // Default value for the item. Optional but won't be used if type is "separator", "button", or "folder". Required and must be the number if type is "enum". Must be a valid CSS color string if type is "color". Can be just a string if type is "input". Must evaluate to a boolean if type is checkbox.
            })
        ]
    })
```

Control the menu:
```javascript
    menu.show() // Show the menu
    menu.hide() // Hide the menu
    menu.toggle() // Toggle the menu

    menu.moveSelection("up" | "down") // Move the selection up or down
    menu.select() // Select the current item
```

Danger zone:
```javascript
    menu.destroy() // Destroy the menu and remove it from the DOM
```
