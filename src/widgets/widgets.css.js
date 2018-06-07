/**
 * @module CSS Code for all Widgets
 */
export default class WidgetsCss {
    static get code() {
        return `

        .widgets-handle {
            border: 2px solid;
            background-color: #F9F9F9;
            color: #F9F9F9;
            position: absolute;
            width: 12px;
            height: 12px;
            margin: -6px;
            border-radius: 50%;
            transform-origin: 0 100%;
            z-index: 3;
        }

        `;
    }
}
