

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
            this.setDraggable();
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
        setDraggable : function ()
        {
            
            var owner = this;
            var draggable = owner.container.find(".ui-draggable");
            
            draggable.each(function ( i )
            {
                $(this).unbind("mousedown", dragstart);
                $(this).bind("mousedown", dragstart);
            });

            function dragstart( e )
            {
                $(window).bind("mousemove", dragmove);
                $(window).bind("mouseup", dragend);
                owner.dragObj.addClass("drag");
                owner.dragTarget = $(this);
                var pos = {left:e.pageX, top:e.pageY};
                owner.dispatchEvent({type:DragEvent.DRAG_START, vars:{target:owner.dragTarget, position:pos}});
                owner.dragPosition = {x:pos.left - owner.dragTarget.offset().left, y:pos.top - owner.dragTarget.offset().top};
                owner.moveDragObject(owner.dragTarget, pos);
                e.preventDefault();
                e.stopPropagation();
            }

            function dragmove( e )
            {
                var pos = {left:e.pageX, top:e.pageY};
                owner.moveDragObject(owner.dragTarget, pos);
                var area = owner.checkDragArea(owner.dragTarget, pos);
                owner.dispatchEvent({type:DragEvent.DRAG_MOVE, vars:{area:area, target:owner.dragTarget, position:pos}}); 
                e.preventDefault();
                e.stopPropagation();
            }

            function dragend ( e )
            {
                $(window).unbind("mousemove", dragmove);
                $(window).unbind("mouseup", dragend);
                owner.dragObj.removeClass("drag");
                var pos = {left:e.pageX, top:e.pageY};
                var area = owner.checkDragArea(owner.dragTarget, pos);
                owner.dispatchEvent({type:DragEvent.DRAG_END, vars:{area:area, target:owner.dragTarget, position:pos}});
                owner.dragTarget = null;
                owner.dragObj.empty();
            }
            
        },

        // 드래그 객체 이동
        moveDragObject : function ( target, position )
        {
            this.dragObj.css({top:position.top - this.dragPosition.y, left:position.left - this.dragPosition.x});
        },

        // 드래그 영역 체크
        checkDragArea : function ( target, position )
        {
            var areas =  this.container.find(".ui-draggable-area");
            for(var i=0; i<areas.length; i++)
            {
                var area = areas.eq(i);
                var rect = {
                    x:area.offset().left, 
                    y:area.offset().top, 
                    w:area.width()+parseInt(area.css("padding-left"))+parseInt(area.css("padding-right")), 
                    h:area.height()+parseInt(area.css("padding-top"))+parseInt(area.css("padding-bottom"))
                };

                if(area.is(".content_area")) rect.h = 112;
                if(position.left > rect.x && position.left < rect.x + rect.w && position.top > rect.y && position.top < rect.y + rect.h)
                {
                    return area;
                }
            }
            return null
        }

    });


    /*
    *  ContentBuilder 생성자
    */
    return Class.extend(
    {
        container     : null,
        contentArea   : null,
        contentBlocks : [],
        tempTool      : null,
        tempFile      : null,
        tempSource    : null,
        dragger       : null,


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

            var owner = this; 
            owner.contentArea = $('<div class="content_area"></div>');
            owner.container.append(owner.contentArea);

            owner.initContentBlock();
            owner.createTempTool();

            // 드래그 생성
            owner.dragger = new Dragger( owner.container );
            owner.dragger.addEventListener(DragEvent.DRAG_START, function ( e )
            {
                var target = e.vars.target;
                if(target.is(".ui-draggable-list"))
                {
                    appendDragThumb(e.vars.target, e.vars.position);
                }
            });

            owner.dragger.addEventListener(DragEvent.DRAG_MOVE, function ( e )
            {
                if(e.vars.area)
                {
                    if(e.vars.area.is(".content_empty"))
                    {
                        $(".content_empty").css({"background-color":"rgba(0,0,0,0.01)"});  
                    }
                }
                else
                {
                    $(".content_empty").css({"background-color":""});
                }
            });

            owner.dragger.addEventListener(DragEvent.DRAG_END, function ( e )
            {
                var target = e.vars.target;
                if(target.is(".ui-draggable-list"))
                {
                    target.find("img").css({opacity:""});
                }
                $(".content_empty").css({"background-color":""});

                if(e.vars.area)
                {
                    if(e.vars.area.is(".content_empty"))
                    {
                        owner.createContentBlock(null, e.vars.target.attr("data-num"));
                    }
                }

            });

            // 드레그 이미지 추가
            function appendDragThumb( target, position )
            {
                var thumb = target.find("img").clone();
                target.find("img").css({opacity:0.8});
                owner.dragger.dragObj.append(thumb);
            }
        },

        // 콘텐츠 블록 init
        initContentBlock : function ()
        {
            var owner = this;
            var blocks = owner.contentArea.find(">div");

            if(blocks.length == 0)
            {
               owner.contentArea.addClass("content_empty").addClass("ui-draggable-area"); 
            }
        },

        // 콘텐츠 블록 생성
        createContentBlock : function (beforeTarget, dataNum)
        {
            
           var block = this.findContentBlock( dataNum );
            
            if(block)
            {
                block.attr("data-thumb", false).attr("data-cat", false);
                block.find(">div>div").attr("contentEditable", true)
                this.contentArea.append(block);
                block.on("focusin", function ()
                {
                    $(this).addClass("ui-dragbox-outlined");
                });
                block.on("focusout", function ()
                {
                    $(this).removeClass("ui-dragbox-outlined");
                });
                //var contentBlock = new ContentBlock(dataId);
            }
        },


        // 콘텐츠 블록 찾기
        findContentBlock : function ( dataNum )
        {
            var blocks = this.tempSource.find(">div").parent();
            for(var i = 0; i<blocks.length; i++)
            {
                var block = blocks.eq(i);
                if(block.attr("data-num") == dataNum)
                {
                    return block.clone();
                }
            }
            return null;
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
                    var listHtml = '<div class="ui-draggable ui-draggable-list" data-num="'+ dataNum +'" data-cat="'+ dataCat +'">\
                                        <img src="'+imgPath+'" />\
                                    </div>';
                    owner.tempTool.find(".temp_list").append(listHtml);
                });
                
                owner.setSelectBox();
                owner.sortTemplete(0);
                owner.dragger.setDraggable();
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
