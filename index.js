/**
 * @file pixi 精灵的放大缩小旋转控件
 */
import * as PIXI from 'pixi.js'
import vec3 from 'gl-vec3';

export default class Resizer extends PIXI.Container {
    
    constructor(resizeElement, options) {
        super();

        this.options = {
            x: 0,
            y: 0,
            ...options
        };
        this.x = this.options.x;
        this.y = this.options.y;
        this.interactive = true;

        this.resizeElement = resizeElement; 
        this.rectGraphic = new PIXI.Graphics();
        this.selfGlobalPositionCache = this.getGlobalPosition();
        
        this.initHandlers();
        this.updateRect();

        this.initEvents();
        this.addChild(resizeElement, this.rectGraphic);
    }

    initHandlers() {
        this.resizeHandler = new PIXI.Graphics().beginFill(0xFFFFFF, 1).lineStyle(1, 0xFFFFFF, 1).drawRect(0, 0, 30, 30);
        this.resizeHandler.pivot.x = this.resizeHandler.width / 2 - 1;
        this.resizeHandler.pivot.y = this.resizeHandler.height / 2 - 1;
        this.resizeHandler.interactive = true;

        this.rotateHandler = new PIXI.Graphics().beginFill(0xFFFFFF, 1).lineStyle(1, 0xFFFFFF, 1).drawCircle(0, 0, 15);
        this.rotateHandler.interactive = true;
        
        this.addChild(this.resizeHandler, this.rotateHandler);
    }

    hide() {
        this.resizeHandler.visible = this.rotateHandler.visible = this.rectGraphic.visible = false;
    }

    show() {
        this.resizeHandler.visible = this.rotateHandler.visible = this.rectGraphic.visible = true;
    }

    updateRect() {
        this.rectGraphic.clear();
        this.rectGraphic.beginFill(0xFFFFFF, 0);
        this.rectGraphic.lineStyle(4, 0xFFFFFF, 1);
        this.rectGraphic.drawRect(0, 0, this.resizeElement.width, this.resizeElement.height);
        this.rectGraphic.pivot.x = this.rectGraphic.width / 2;
        this.rectGraphic.pivot.y = this.rectGraphic.height / 2;
        
        // 重置resizeHandler位置
        this.resizeHandler.x = -this.rectGraphic.width / 2;
        this.resizeHandler.y = -this.rectGraphic.height / 2;
        
        // 重置rotateHandler位置
        this.rotateHandler.x = 0;
        this.rotateHandler.y = this.rectGraphic.height / 2 + 50;
    }

    dragable(item, options) {
        item
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

        function onDragStart(event) {
            event.stopPropagation();
            this.data = event.data;
            this.dragging = true;
            this.startPosition = this.data.getLocalPosition(this.parent);
            options && options.onDragStart && options.onDragStart(this.startPosition);
        }

        function onDragEnd(event) {
            event.stopPropagation();
            this.dragging = false;
            this.data = null;
        }

        function onDragMove(event) {
            if (this.dragging) {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.x = newPosition.x;
                this.y = newPosition.y;
                options && options.onDragMove && options.onDragMove(newPosition, this.startPosition, event.data.global);
            }
        }
    }

    initEvents() {

        this.dragable(this.resizeHandler, {
            onDragStart: () => {
                this.resizeElement.startSize = {
                    width: this.resizeElement.width,
                    height: this.resizeElement.height,
                };
            },
            onDragMove: (newPosition, startPosition) => {
                const newWidth = this.resizeElement.startSize.width + (-newPosition.x + startPosition.x) * 2;
                const newHeight = this.resizeElement.startSize.height + (-newPosition.y + startPosition.y) * 2;
                this.resizeElement.width = newWidth <= 0 ? 1 : newWidth;
                this.resizeElement.height = newHeight <= 0 ? 1 : newHeight;
                this.updateRect();
            }
        });
        
        this.dragable(this.rotateHandler, {
            onDragStart: () => {
                this.selfGlobalPositionCache = this.getGlobalPosition();
            },
            onDragMove: (newPosition, startPosition, globalPosition) => {
                this.rotation = (globalPosition.x - this.selfGlobalPositionCache.x > 0 ? -1 : 1) * vec3.angle([globalPosition.x - this.selfGlobalPositionCache.x, globalPosition.y - this.selfGlobalPositionCache.y, 1], [0, 100, 1]);
                this.updateRect();
            }
        });
        this.dragable(this);
    }

    
}
