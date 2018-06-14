/**
 * @module CSS Code for all Widgets
 */
export default class WidgetsCss {
    static get code() {
        return `
        .widgets-handle {
            position: absolute;
            border: 1.5px solid;
            border-radius: 50%;
            width: 10px;
            height: 10px;
            margin: -6.5px; /* border + width / 2 */
            z-index: 3;
        }
        .widgets-line {
            position: absolute;
            width: 3px;
            height: 1.5px;
            margin-top: -0.75px; /* height / 2 */
        }
        .widgets-dashline {
            position: absolute;
            border-top: 1.5px dashed;
            margin-top: -1.5px; /* border */
        }
        .widgets-rectangle {
            position: absolute;
            border: 2px solid;
            margin: -2px; /* border */
        }
        .widgets-rectangle-helper {
            position: absolute;
            border: 1.5px dashed;
            margin: -1.5px; /* border */
        }
        .widgets-ellipse {
            position: absolute;
            border: 2px solid;
            border-radius: 50%;
            margin: -2px; /* border */
            z-index: 2;
        }
        .widgets-label {
            position: absolute;
            border: 1.5px solid;
            background-color: rgba(0, 0, 0, 0.7);
            color: rgb(255, 255, 255);
            padding: 4px;
            z-index: 3;
        }
        `;
    }
}
