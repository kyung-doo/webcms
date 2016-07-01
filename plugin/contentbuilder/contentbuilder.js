

var ContentBuilder = ContentBuilder || (function ()
{
    /*
    *  드래그 이벤트
    */
    var DragEvent = {
        DRAG_START  : "dragStart",
        DRAG_MOVE   : "dragMove",
        DRAG_END    : "dragEnd"
    };
    


    /*
    *  contentBlock 클래스
    */
    this.ContentBlock = EventDispatcher.extend(
    {
        init : function ()
        {

        }
    });


    /*
    *  Dragger 클래스
    */
    this.Dragger = EventDispatcher.extend(
    {
        container : null,
        dragObj   : null,
        dragPosition : {},
        dragTarget : null,


        //init
        init : function ( container )
        {
            this.container = container;
            this.createObject();
            this.setDraggableEvent();
        },

        //드래그 객체 생성
        createObject : function ()
        {
            var html = '<div class="drag_obj">\
                        </div>';
            this.dragObj = $(html);
            this.container.append(this.dragObj);

        },

        //드래그 타겟 마우스 이벤트
        setDraggableEvent : function ()
        {
            
            var owner = this;
            var draggable = owner.container.find(".ui-draggable");
            
            draggable.each(function ( i )
            {
                $(this).bind("mousedown", dragstart );
            });

            function dragstart( e )
            {
                $(window).bind("mousemove", dragmove);
                $(window).bind("mouseup", dragend);
                owner.dragObj.addClass("drag");
                owner.dragTarget = $(this);
                var pos = {left:e.pageX, top:e.pageY};
                owner.appendThumb(owner.dragTarget, pos);
                owner.dispatchEvent({type:DragEvent.DRAG_START, vars:{target:owner.dragTarget, position:pos}});
                e.preventDefault();
                e.stopPropagation();
            }

            function dragmove( e )
            {
                var pos = {left:e.pageX, top:e.pageY};
                owner.moveDragObject(owner.dragTarget, pos);
                owner.dispatchEvent({type:DragEvent.DRAG_MOVE, vars:{target:owner.dragTarget, position:pos}});
                e.preventDefault();
                e.stopPropagation();
            }

            function dragend ( e )
            {
                $(window).unbind("mousemove", dragmove);
                $(window).unbind("mouseup", dragend);
                owner.dragObj.removeClass("drag");
                var pos = {left:e.pageX, top:e.pageY};
                owner.dispatchEvent({type:DragEvent.DRAG_END, vars:{target:owner.dragTarget, position:pos}});
                owner.dragTarget.find("img").css({opacity:""});
                owner.dragTarget = null;
                owner.removeThumb();
            }
        },

        // 드레그 이미지 추가
        appendThumb : function ( target, position )
        {
            var thumb = target.find("img").clone();
            target.find("img").css({opacity:0.8});
            this.dragObj.append(thumb);
            this.dragPosition = {x:position.left - target.offset().left, y:position.top - target.offset().top};
            this.moveDragObject(target, position); 
        },

        // 드레그 이미지 제거
        removeThumb : function ()
        {
            this.dragObj.empty();
        },

        // 드래그 객체 이동
        moveDragObject : function ( target, position )
        {
            this.dragObj.css({top:position.top - this.dragPosition.y, left:position.left - this.dragPosition.x});
        }

    });


    /*
    *  ContentBuilder 생성자
    */
    return Class.extend(
    {
        container  : null,
        tempTool   : null,
        tempFile   : null,
        tempSource : null,
        dragger    : null,


        // init
        init : function ( containerID, option )
        {
            this.container = $(containerID);
            
            var pattern = /tempFile/;

            for( var opt in option)
            {
                if(option[opt])
                {
                    if(pattern.test(opt)) this[opt] = option[opt];
                }
            }

            this.createTempTool();
        },

        // 템플릿툴 생성
        createTempTool : function ()
        {
            var owner = this;
            var tempHtml = '<div class="temp_tool show">\
                                <a class="button" href="javascript:"><i class="fa fa-chevron-right" aria-hidden="true"></i></a>\
                                <div class="temp_list"></div>\
                            </div>';
                            
            owner.tempTool = $(tempHtml);
            owner.container.append(owner.tempTool);
            owner.tempTool.find(".button").bind("click", function( e )
            {
               if(owner.tempTool.is(".hide"))
               {
                   owner.tempTool.removeClass("hide");
               } 
               else
               {
                   owner.tempTool.addClass("hide");
               }
            });

            owner.tempTool.bind("dragstart", function ( e )
            {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            owner.tempTool.bind("selectstart", function ( e )
            {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            owner.loadTemplate();

        },

        //템플릿 파일 로드
        loadTemplate : function ()
        {
            var owner = this;
            $.get(owner.tempFile, function ( data )
            {
                owner.tempSource = $(data);
                var list = owner.tempSource.find(">div").parent(); 
                list.each( function ( i )
                {
                    var imgPath = $(this).attr("data-thumb");
                    var dataNum = $(this).attr("data-num");
                    var dataCat = $(this).attr("data-cat");
                    var listHtml = '<div class="ui-draggable" data-num="'+ dataNum +'" data-cat="'+ dataCat +'">\
                                        <img src="'+imgPath+'" />\
                                    </div>';
                    owner.tempTool.find(".temp_list").append(listHtml);
                });

                
                owner.dragger = new Dragger( owner.container );
                owner.dragger.addEventListener(DragEvent.DRAG_START, function ( e )
                {
                    
                });
                owner.dragger.addEventListener(DragEvent.DRAG_MOVE, function ( e )
                {
                    
                });
                owner.dragger.addEventListener(DragEvent.DRAG_END, function ( e )
                {
                    
                });


            }); 

            
            
        }, 

        // html 출력
        getHtml : function ()
        {

        }
    });
    
})();
