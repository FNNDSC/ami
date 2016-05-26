/**
 *
 */
export default class WidgetsBase extends THREE.Object3D{

  constructor() {

    // init THREE Object 3D
    super();

    // is widget enabled?
    this._enabled = true;

    // STATE, ENUM might be better
    this._selected = false;
    this._hovered = false;
    this._active = false;

    this._colors = {
      default: '#00B0FF',
      active: '#FFEB3B',
      hover: '#F50057',
      select: '#76FF03'
    };
    this._color = this._colors.default;

    this._dragged = false;
    // can not call it visible because it conflicts with THREE.Object3D
    this._displayed = true;

  }

  update(){
    
    // to be overloaded
  	window.console.log( 'update() should be overloaded!' );

  }

  updateColor(){

    if( this._active ){

      this._color = this._colors.active;

    }
    else if( this._hovered ){

      this._color = this._colors.hover;

    }
    else if( this._selected ){

      this._color = this._colors.select;

    }
    else{

      this._color = this._colors.default;

    }

  }

  get enabled(){

    return this._enabled;

  }

  set enabled( enabled ){

    this._enabled = enabled;
    this.update();

  }

  get selected(){

    return this._selected;

  }

  set selected( selected ){

    this._selected = selected;
    this.update();

  }

  get hovered(){

    return this._hovered;

  }

  set hovered( hovered ){

    this._hovered = hovered;
    this.update();

  }

  get dragged(){

    return this._dragged;

  }

  set dragged( dragged ){

    this._dragged = dragged;
    this.update();

  }

  get displayed(){

    return this._displayed;

  }

  set displayed( displayed ){

    this._displayed = displayed;
    this.update();

  }

  get active(){

    return this._active;

  }

  set active( active ){

    this._active = active;
    this.update();

  }

  get color(){

    return this._color;

  }

  set color( color ){

    this._color = color;
    this.update();

  }

}
