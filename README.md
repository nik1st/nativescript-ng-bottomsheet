# NativeScript Angular Bottom Sheet Plugin

## Installation

```
tns plugin add nativescript-ng-bottomsheet
```

## Usage 
_iOS note: Shadows will be added later. :(_

The bottom sheet plugin extends a `GridLayout` and exposes a simple `BottomSheet` class with property `state` and method named `setState(state)`. Also plugin exposes interface `BottomSheetState` that helps to manage state of Bottom Sheet.

### XML
``` xml
    <Page
        navigatingTo="onNavigatingTo"
        xmlns="http://schemas.nativescript.org/tns.xsd"
        xmlns:ui="nativescript-ng-bottomsheet/ng-bottomsheet">

        <ActionBar>
            <Label text="Home"></Label>
        </ActionBar>

        <GridLayout>
            <!-- Add your page content here -->
            <ui:BottomSheet stateChange="onStateChange" />
        </GridLayout>
    </Page>
```


### Angular

Don't forget to register the component in `app.module.ts`.

``` typescript
import { registerElement } from 'nativescript-angular/element-registry';
import { BottomSheet } from 'nativescript-ng-bottomsheet/ng-bottomsheet';
registerElement('BottomSheet', () => BottomSheet);
```

#### HTML 

``` html
    <NgBottomSheet (stateChange)="onStateChange($event)"></NgBottomSheet>
```
#### Typescript

#### Typescript

``` typescript
    onStateChange(args) {
        const {eventName, object, state} = args;
        console.log(state); // it represents one of BottomSheetState values

        // If you want to change state via code, use method setState()
        // object.setState(BottomSheetState.COLLAPSED);
        // object.setState(BottomSheetState.HALF_EXPANDED);
        // object.setState(BottomSheetState.EXPANDED);
    }
```

# To run the Angular demo

```
cd src
npm run demo-angular.<platform>
```

# To run the plain Nativescript demo

```
cd src
npm run demo.<platform>
```

## License

MIT
