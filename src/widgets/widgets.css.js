/**
 * @module CSS Code for all Widgets
 */
export default class WidgetsCss {
    static get code() {
        return `
        .widgets-handle {
            position: absolute;
            border: 1px solid;
            border-radius: 50%;
            width: 10px;
            height: 10px;
            margin: -5.5px; /* border + width / 2 */
            z-index: 3;
        }
        .widgets-line {
            position: absolute;
            width: 1px;
            height: 1px;
            margin-top: -0.5px; /* height / 2 */
        }
        .widgets-line:before { /* for dragging */
            content: " ";
            position: absolute;
            height: 11.5px;
            left: 0;
            right: 0;
            margin-top: -5px;
        }
        .widgets-dashline {
            position: absolute;
            border-top: 1px dashed;
            margin-top: -1px; /* border */
        }
        .widgets-rectangle {
            position: absolute;
            border: 1px solid;
            margin: -1px; /* border */
        }
        .widgets-rectangle-helper {
            position: absolute;
            border: 1px dashed;
            margin: -1px; /* border */
        }
        .widgets-ellipse {
            position: absolute;
            border: 1px solid;
            border-radius: 50%;
            margin: -1px; /* border */
            z-index: 2;
        }
        .widgets-label {
            position: absolute;
            border: 1px solid;
            background-color: rgba(0, 0, 0, 0.7);
            color: rgb(255, 255, 255);
            padding: 4px;
            z-index: 3;
        }
        `;
    }
}
