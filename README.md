# CSS Sense

An extension for autocompleting classnames found in imported CSS. It's very basic at the moment. The extension looks for this line:

```
import styles from "./whatever.css"
```

This kicks the Intellisense into gear and it'll scan your CSS (or SCSS) file for class names to import.

## Known Issues

You can only import one file and it has to be imported as `styles`. Also I have no idea what happens if you do weird things in your CSS like using ids or loops or things. It might work, since the plugin uses [css-tree](https://github.com/csstree/csstree) and [scss-parser](https://github.com/salesforce-ux/scss-parser) under the hood. But doing anything too funky in your CSS voids the warranty, mkay?

## Release Notes

We have a first release, made during investment day at Universal Avenue, to scratch a personal itch. It's probably slightly shonky.

### 0.0.1

Initial release.

---
