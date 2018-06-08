/**
 * @module CSS Code for all Widgets
 */
export default class WidgetsCss {
    static get code() {
        return `
        .widgets-handle {
            // background-color: rgba(255, 255, 255, 0.5);
            position: absolute;
            border: 1.5px solid;
            border-radius: 50%;
            width: 10px;
            height: 10px;
            margin: -6.5px; // border + width / 2
            z-index: 3;
        }
        .widgets-line {
            position: absolute;
            transform-origin: 0 100%; // TODO!
            width: 3px;
            height: 1.5px;
            margin-top: -0.75px; // height / 2
        }
        .widgets-dashline {
            position: absolute;
            border: none;
            border-top: 2px dashed #F9F9F9;
            transform-origin: 0 100%; // TODO!
            width: 50%;
            height: 1px;
        }
        .widgets-rectangle {
            position: absolute;
            border: 2px solid;
            transform-origin: 0 100%; // TODO!
        }
        .widgets-ellipse {
            position: absolute;
            border: 2px solid;
            border-radius: 50%;
            transform-origin: 0 100%; // TODO!
            z-index: 2;
        }
        .widgets-label {
            position: absolute;
            border: 1.5px solid;
            background-color: rgba(0, 0, 0, 0.6);
            color: rgb(255, 255, 255);
            padding: 4px;
            transform-origin: 0 100%; // TODO!
            z-index: 3;
        }
        /* experimental */
        .widgets-handle-cross {
            position: absolute;
            z-index: 3;
        }
        .widgets-handle-cross:before, .widgets-handle-cross:after {
            position: absolute;
            background-color: #FFF;
            content: ' ';
            left: 5px;
            height: 13px;
            width: 1.5px;
        }
        .widgets-handle-cross:before {
            transform: rotate(45deg);
        }
        .widgets-handle-cross:after {
            transform: rotate(-45deg);
        }
        `;
    }
}
