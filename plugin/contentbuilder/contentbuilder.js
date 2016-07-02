

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
    *  템플릿 카테고리
    */
    var tempCategory = [{name:"Default", id:0},{name:"All", id:-1},{name:"Title", id:1},{name:"Title, Subtitle", id:2},{name:"Info, Title", id:3},{name:"Heading, Paragraph", id:5},{name:"Paragraph", id:6},{name:"Buttons", id:33},{name:"Cards", id:34},{name:"Images + Caption", id:9},{name:"Images", id:11},{name:"Single Image", id:12},{name:"Call to Action", id:13},{name:"List", id:14},{name:"Quotes", id:15},{name:"Profile", id:16},{name:"Map", id:17},{name:"Video", id:20},{name:"Social", id:18},{name:"Services", id:21},{name:"Contact Info", id:22},{name:"Pricing", id:23},{name:"Team Profile", id:24},{name:"Products/Portfolio", id:25},{name:"How It Works", id:26},{name:"Partners/Clients", id:27},{name:"As Featured On", id:28},{name:"Achievements", id:29},{name:"Skills", id:32},{name:"Coming Soon", id:30},{name:"Page Not Found", id:31},{name:"Separator", id:19}];



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
                                <select class="temp_select form-control"></select>\
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

            $(window).bind("resize", function ( e )
            {
                owner.tempTool.find(".temp_list").css({height:$(window).height()-80});
            });

            $(window).resize();
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

                owner.setSelectBox();
                owner.sortTemplete(0);

            });  
        }, 


        //카테고리 셀렉박스 세팅
        setSelectBox : function ()
        {
            var owner = this;

            for(var i=0; i<tempCategory.length; i++)
            {
                var item = tempCategory[i];
                var option = $('<option value="'+item.id+'">' + item.name + '</option>');
                owner.tempTool.find(".temp_select").append(option);
            }

            owner.tempTool.find(".temp_select").bind("change", function ( e )
            {
                var id = $(this).find("option:selected").val();
                owner.sortTemplete(id);
            });
        },

        // 카테고리 정렬
        sortTemplete : function ( id )
        {
            var owner = this;
            var list = owner.tempTool.find(".temp_list>div"); 
            list.each(function ( i )
            {
                if(id != -1)
                {
                    if($(this).attr("data-cat").indexOf(id) > -1)   $(this).css({display:"inline-block"});
                    else                                            $(this).css({display:"none"});
                }
                else
                {
                    $(this).css({display:"inline-block"});
                }
            });
        },

        // html 출력
        getHtml : function ()
        {

        }
    });
    
})();
