import {StackLayout, GestureTypes } from "@nativescript/core";

export class PeekBase extends StackLayout {

    constructor() {
        super();
        this.id = "Peek";
        // this.on(GestureTypes.pan, () => this.parent.notify({eventName: "pan", object: this }));
   }
}